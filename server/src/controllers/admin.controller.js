import prisma from '../prismaClient.js';
import bcrypt from 'bcrypt';
import { createAuditLog } from '../services/audit.service.js'; // Importa el Historial

// --- GESTIÓN DE USUARIOS ---

/**
 * Obtiene TODOS los usuarios (incluyendo al admin si se pide)
 */
export const getAllUsers = async (req, res) => {
  try {
    const { includeSelf } = req.query;
    let users;
    if (includeSelf) {
      users = await prisma.user.findMany();
    } else {
      users = await prisma.user.findMany({
        where: { id: { not: req.user.userId } } // Excluye al admin logueado
      });
    }
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener usuarios." });
  }
};

/**
 * Admin crea un NUEVO usuario (Estudiante o Docente)
 */
export const createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "Nombre, email, contraseña y rol son obligatorios." });
    }
    if (role === 'ADMIN') {
      return res.status(403).json({ message: "No se puede crear otro ADMIN desde esta ruta." });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ message: "El correo ya está registrado." });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role,
        isVerified: true // Los usuarios creados por Admin ya están verificados
      }
    });

    // ¡HISTORIAL!
    await createAuditLog(
      req.user.userId, 
      'USER_CREATED', 
      { details: `Admin creó ${role}: ${email}` },
      newUser.id,
      req.ip
    );

    res.status(201).json({ id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role });
  } catch (error) {
    res.status(500).json({ message: "Error interno al crear usuario." });
  }
};

/**
 * Admin actualiza el ROL de un usuario
 */
export const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!role || !['ADMIN', 'DOCENTE', 'ESTUDIANTE'].includes(role)) {
      return res.status(400).json({ message: "Rol inválido." });
    }

    const updatedUser = await prisma.user.update({
      where: { id: id },
      data: { role: role }
    });
    
    // ¡HISTORIAL!
    await createAuditLog(
      req.user.userId,
      'USER_ROLE_UPDATED',
      { details: `Rol de ${updatedUser.email} cambiado a ${role}` },
      id,
      req.ip
    );

    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar rol." });
  }
};

/**
 * Admin ACTIVA o DESACTIVA (Verifica/Desverifica) un usuario
 */
export const updateUserActivation = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body; // true o false

    if (typeof isActive !== 'boolean') {
      return res.status(400).json({ message: "Se requiere un estado 'isActive' (boolean)." });
    }

    const updatedUser = await prisma.user.update({
      where: { id: id },
      data: { isVerified: isActive }
    });

    // ¡HISTORIAL!
    const action = isActive ? 'USER_ACTIVATED' : 'USER_DEACTIVATED';
    await createAuditLog(
      req.user.userId,
      action,
      { details: `Usuario ${updatedUser.email} fue ${isActive ? 'ACTIVADO' : 'DESACTIVADO'}` },
      id,
      req.ip
    );

    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar estado." });
  }
};

/**
 * Admin elimina un usuario (¡Peligroso!)
 */
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    // ... (Faltaría lógica para borrar cascada, pero por ahora...)
    
    // 1. Borrar dependencias (para que no crashee)
    await prisma.studentExam.deleteMany({ where: { studentId: id } });
    await prisma.material.deleteMany({ where: { authorId: id } });
    await prisma.exam.deleteMany({ where: { authorId: id } });
    await prisma.auditLog.deleteMany({ where: { actorId: id } });
    
    // 2. Borrar al usuario
    const deletedUser = await prisma.user.delete({
      where: { id: id }
    });
    
    res.status(200).json({ message: `Usuario ${deletedUser.email} eliminado.` });
  } catch (error) {
    console.error("Error al eliminar usuario:", error);
    res.status(500).json({ message: "Error al eliminar usuario." });
  }
};

// --- ESTADÍSTICAS "WAOOO" ---

/**
 * Obtiene las estadísticas generales del sitio
 */
export const getSiteStats = async (req, res) => {
  try {
    const studentCount = await prisma.user.count({ where: { role: 'ESTUDIANTE' } });
    const teacherCount = await prisma.user.count({ where: { role: 'DOCENTE' } });
    const adminCount = await prisma.user.count({ where: { role: 'ADMIN' } });
    const materialCount = await prisma.material.count();
    const examCount = await prisma.exam.count();

    res.status(200).json({
      students: studentCount,
      teachers: teacherCount,
      totalAdmins: adminCount, // <-- ¡NUEVA!
      materials: materialCount,
      exams: examCount
    });
  } catch (error) {
    res.status(500).json({ message: "Error al obtener estadísticas." });
  }
};

/**
 * Obtiene las estadísticas de rendimiento por curso/examen
 */
export const getCourseStatistics = async (req, res) => {
  try {
    const exams = await prisma.exam.findMany({
      include: {
        author: {
          select: { name: true }
        },
        _count: {
          select: { submissions: true }
        }
      }
    });

    const stats = await Promise.all(exams.map(async (exam) => {
      const submissions = await prisma.studentExam.findMany({
        where: { examId: exam.id, grade: { not: null } }
      });
      
      let averageGrade = 0;
      if (submissions.length > 0) {
        const totalGrade = submissions.reduce((sum, sub) => sum + (sub.grade || 0), 0);
        averageGrade = parseFloat((totalGrade / submissions.length).toFixed(2));
      }
      
      return {
        examId: exam.id,
        title: exam.title,
        authorName: exam.author.name,
        totalSubmissions: exam._count.submissions,
        gradedSubmissions: submissions.length,
        averageGrade: averageGrade
      };
    }));

    res.status(200).json(stats);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener estadísticas de cursos." });
  }
};

/**
 * Obtiene el historial (AuditLog)
 */
export const getAuditLogs = async (req, res) => {
  try {
    const logs = await prisma.auditLog.findMany({
      take: 100, // Solo los últimos 100
      orderBy: { timestamp: 'desc' },
      // ¡Incluimos el nombre del actor!
      include: {
        actor: {
          select: { name: true, email: true }
        }
      }
    });
    res.status(200).json(logs);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener historial." });
  }
};