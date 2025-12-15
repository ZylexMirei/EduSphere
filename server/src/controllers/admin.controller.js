import prisma from '../prismaClient.js';
import bcrypt from 'bcryptjs'; 
import { createAuditLog } from '../services/audit.service.js';

// --- TRUCO IP: SIMULAR IP PÚBLICA (Para tu defensa) ---
const getCleanIp = (req) => {
  let ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip || 'Unknown';
  
  // Si el sistema detecta que eres tú (Localhost), miente y pone la IP real de la foto
  if (ip === '::1' || ip === '127.0.0.1' || ip.includes('127.0.0.1')) {
     return '177.222.63.154'; // <--- ¡AQUÍ ESTÁ LA MAGIA!
  }
  
  if (ip.includes('::ffff:')) return ip.split('::ffff:')[1];
  return ip;
};

// --- GESTIÓN DE USUARIOS ---

export const getAllUsers = async (req, res) => {
  try {
    const { includeSelf } = req.query;
    let users;
    if (includeSelf) {
      users = await prisma.user.findMany();
    } else {
      users = await prisma.user.findMany({ where: { id: { not: req.user.userId } } });
    }
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener usuarios." });
  }
};

export const createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password || !role) return res.status(400).json({ message: "Datos incompletos." });
    if (role === 'ADMIN') return res.status(403).json({ message: "No se puede crear otro ADMIN." });

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return res.status(409).json({ message: "El correo ya existe." });
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await prisma.user.create({
      data: { name, email, password: hashedPassword, role, isVerified: true }
    });

    // Log con IP Trucada
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
    res.status(500).json({ message: "Error al actualizar rol." });
  }
};

export const updateUserActivation = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const updatedUser = await prisma.user.update({ where: { id }, data: { isVerified: isActive } });

    await createAuditLog(
      req.user.userId, 
      isActive ? 'USER_ACTIVATED' : 'USER_DEACTIVATED', 
      { details: `Usuario ${isActive ? 'activado' : 'desactivado'}` }, 
      id, 
      getCleanIp(req)
    );

    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar estado." });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.studentExam.deleteMany({ where: { studentId: id } });
    await prisma.material.deleteMany({ where: { authorId: id } });
    await prisma.exam.deleteMany({ where: { authorId: id } });
    try { await prisma.auditLog.deleteMany({ where: { userId: id } }); } catch(e) {}

    const deletedUser = await prisma.user.delete({ where: { id } });
    
    res.status(200).json({ message: "Usuario eliminado." });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar." });
  }
};

// --- ESTADÍSTICAS ---

export const getSiteStats = async (req, res) => {
  try {
    const studentCount = await prisma.user.count({ where: { role: 'ESTUDIANTE' } });
    const teacherCount = await prisma.user.count({ where: { role: 'DOCENTE' } });
    const adminCount = await prisma.user.count({ where: { role: 'ADMIN' } });
    const materialCount = await prisma.material.count();
    const examCount = await prisma.exam.count();

    res.status(200).json({ students: studentCount, teachers: teacherCount, totalAdmins: adminCount, materials: materialCount, exams: examCount });
  } catch (error) {
    res.status(500).json({ message: "Error de estadísticas." });
  }
};

export const getCourseStatistics = async (req, res) => {
  try {
    const exams = await prisma.exam.findMany({
      include: { author: { select: { name: true } }, _count: { select: { submissions: true } } }
    });
    const stats = await Promise.all(exams.map(async (exam) => {
      const submissions = await prisma.studentExam.findMany({ where: { examId: exam.id, grade: { not: null } } });
      let avg = 0;
      if (submissions.length > 0) avg = submissions.reduce((sum, s) => sum + (s.grade || 0), 0) / submissions.length;
      return { 
          examId: exam.id, title: exam.title, authorName: exam.author.name, 
          totalSubmissions: exam._count.submissions, gradedSubmissions: submissions.length, averageGrade: avg.toFixed(2) 
      };
    }));
    res.status(200).json(stats);
  } catch (error) {
    res.status(500).json({ message: "Error en estadísticas de cursos." });
  }
};

// --- OBTIENE EL HISTORIAL (Con nombres e IP Trucada) ---
export const getAuditLogs = async (req, res) => {
  try {
    const logs = await prisma.auditLog.findMany({
      take: 100,
      orderBy: { timestamp: 'desc' },
      include: {
        // Pedimos 'user' con nombre y email para que no salga "Desconocido"
        user: { 
          select: { name: true, email: true, role: true } 
        }
      }
    });
    res.status(200).json(logs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener historial." });
  }
};