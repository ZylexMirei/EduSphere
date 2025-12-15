import prisma from '../prismaClient.js';
import bcrypt from 'bcryptjs';
import { createAuditLog } from '../services/audit.service.js';

// --- HELPER IP REAL ---
const getCleanIp = (req) => {
  let ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip || 'Unknown';
  if (ip.includes('::ffff:')) ip = ip.split('::ffff:')[1];
  if (ip === '::1') return '127.0.0.1';
  return ip;
};

export const getAllUsers = async (req, res) => {
  try {
    const { includeSelf } = req.query;
    const users = await prisma.user.findMany(includeSelf ? {} : { where: { id: { not: req.user.userId } } });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener usuarios." });
  }
};

export const createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password || !role) return res.status(400).json({ message: "Datos incompletos." });
    if (role === 'ADMIN') return res.status(403).json({ message: "No crear ADMIN aquí." });

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return res.status(409).json({ message: "Correo registrado." });
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await prisma.user.create({ data: { name, email, password: hashedPassword, role, isVerified: true } });

    await createAuditLog(req.user.userId, 'USER_CREATED', { details: `Admin creó ${role}: ${email}` }, newUser.id, getCleanIp(req));

    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ message: "Error interno." });
  }
};

export const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    if (!['ADMIN', 'DOCENTE', 'ESTUDIANTE'].includes(role)) return res.status(400).json({ message: "Rol inválido." });

    const updatedUser = await prisma.user.update({ where: { id }, data: { role } });
    await createAuditLog(req.user.userId, 'USER_ROLE_UPDATED', { details: `Rol cambiado a ${role}` }, id, getCleanIp(req));

    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar." });
  }
};

export const updateUserActivation = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;
    const updatedUser = await prisma.user.update({ where: { id }, data: { isVerified: isActive } });

    await createAuditLog(req.user.userId, isActive ? 'USER_ACTIVATED' : 'USER_DEACTIVATED', { details: `Usuario ${isActive ? 'activado' : 'desactivado'}` }, id, getCleanIp(req));

    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar." });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    // Borrar cascada manual para seguridad
    await prisma.studentExam.deleteMany({ where: { studentId: id } });
    await prisma.material.deleteMany({ where: { authorId: id } });
    await prisma.exam.deleteMany({ where: { authorId: id } });
    try { await prisma.auditLog.deleteMany({ where: { userId: id } }); } catch(e) {}
    try { await prisma.auditLog.deleteMany({ where: { actorId: id } }); } catch(e) {}

    const deleted = await prisma.user.delete({ where: { id } });
    res.status(200).json({ message: "Usuario eliminado." });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar." });
  }
};

export const getSiteStats = async (req, res) => {
  try {
    const [students, teachers, totalAdmins, materials, exams] = await Promise.all([
        prisma.user.count({ where: { role: 'ESTUDIANTE' } }),
        prisma.user.count({ where: { role: 'DOCENTE' } }),
        prisma.user.count({ where: { role: 'ADMIN' } }),
        prisma.material.count(),
        prisma.exam.count()
    ]);
    res.status(200).json({ students, teachers, totalAdmins, materials, exams });
  } catch (error) {
    res.status(500).json({ message: "Error estadísticas." });
  }
};

export const getCourseStatistics = async (req, res) => {
  try {
    const exams = await prisma.exam.findMany({ include: { author: { select: { name: true } }, _count: { select: { submissions: true } } } });
    const stats = await Promise.all(exams.map(async (exam) => {
      const submissions = await prisma.studentExam.findMany({ where: { examId: exam.id, grade: { not: null } } });
      let avg = 0;
      if (submissions.length > 0) avg = submissions.reduce((sum, s) => sum + (s.grade || 0), 0) / submissions.length;
      return { examId: exam.id, title: exam.title, authorName: exam.author.name, totalSubmissions: exam._count.submissions, gradedSubmissions: submissions.length, averageGrade: avg.toFixed(2) };
    }));
    res.status(200).json(stats);
  } catch (error) {
    res.status(500).json({ message: "Error estadísticas cursos." });
  }
};

// --- ARREGLO FINAL PARA HISTORIAL (ACTOR -> USER) ---
export const getAuditLogs = async (req, res) => {
  try {
    // 1. Buscamos 'actor' (nombre real en BD)
    const logs = await prisma.auditLog.findMany({
      take: 100,
      orderBy: { timestamp: 'desc' },
      include: { actor: { select: { name: true, email: true, role: true } } }
    });

    // 2. Mapeamos a 'user' para el Frontend
    const formattedLogs = logs.map(log => ({
      ...log,
      user: log.actor || { name: 'Usuario Eliminado', email: '-' } 
    }));

    res.status(200).json(formattedLogs);
  } catch (error) {
    console.error("Error logs:", error);
    res.status(500).json({ message: "Error al obtener historial." });
  }
};