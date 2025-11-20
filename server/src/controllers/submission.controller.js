import prisma from '../prismaClient.js';

/**
 * Entrega un examen (Estudiante).
 */
export const submitExam = async (req, res) => {
  try {
    const { examId, answers } = req.body; // answers es un JSON
    const studentId = req.user.userId; // De 'authenticateToken'

    if (!examId || !answers) {
      return res.status(400).json({ message: "El ID del examen y las respuestas son obligatorios." });
    }

    // 1. Verificar si el estudiante ya entregó este examen
    const existingSubmission = await prisma.studentExam.findFirst({
      where: {
        studentId: studentId,
        examId: examId,
      }
    });

    if (existingSubmission) {
      return res.status(409).json({ message: "Ya has entregado este examen." });
    }

    // 2. Crear la entrega
    const newSubmission = await prisma.studentExam.create({
      data: {
        studentId: studentId,
        examId: examId,
        answers: answers, 
        submitted: true
      }
    });

    res.status(201).json({ message: "Examen entregado exitosamente.", submissionId: newSubmission.id });
  } catch (error) {
    console.error("Error al entregar examen:", error);
    res.status(500).json({ message: "Error interno del servidor." });
  }
};

/**
 * Califica una entrega (Docente / Admin).
 */
export const gradeSubmission = async (req, res) => {
  try {
    const { submissionId } = req.params;
    
    // --- CORRECCIÓN AQUÍ: Recibimos 'grade' Y 'feedback' ---
    const { grade, feedback } = req.body; 
    
    const userId = req.user.userId;
    const userRole = req.user.role;

    // Validación de número
    const numericGrade = parseFloat(grade);
    if (isNaN(numericGrade)) {
      return res.status(400).json({ message: "La nota debe ser un número válido." });
    }

    // 1. Buscar la entrega
    const submission = await prisma.studentExam.findUnique({
      where: { id: submissionId },
      include: { exam: true } 
    });

    if (!submission) {
      return res.status(404).json({ message: "Entrega no encontrada." });
    }

    // 2. Verificar permisos
    if (submission.exam.authorId !== userId && userRole !== 'ADMIN') {
      return res.status(403).json({ message: "No tienes permisos para calificar esta entrega." });
    }

    // 3. Actualizar la nota Y EL FEEDBACK
    const gradedSubmission = await prisma.studentExam.update({
      where: { id: submissionId },
      data: {
        grade: numericGrade,
        feedback: feedback || "" // Guardamos el feedback (o vacío si no hay)
      }
    });

    res.status(200).json(gradedSubmission);
  } catch (error) {
    console.error("Error al calificar:", error);
    res.status(500).json({ message: "Error interno del servidor." });
  }
};

/**
 * Obtiene una entrega por ID (Para detalle al calificar)
 */
export const getSubmissionById = async (req, res) => {
  try {
    const { id } = req.params;
    const submission = await prisma.studentExam.findUnique({
      where: { id },
      include: { student: true } 
    });
    if (!submission) return res.status(404).json({ message: "No encontrada" });
    res.json(submission);
  } catch (error) {
    res.status(500).json({ message: "Error" });
  }
};

/**
 * Obtiene todas las entregas de un estudiante (Estudiante).
 */
export const getMySubmissions = async (req, res) => {
  try {
    const studentId = req.user.userId;
    const submissions = await prisma.studentExam.findMany({
      where: { studentId: studentId },
      include: {
        exam: { 
          select: { title: true }
        }
      },
      orderBy: { submittedAt: 'desc' }
    });

    res.status(200).json(submissions);
  } catch (error) {
    console.error("Error al obtener mis entregas:", error);
    res.status(500).json({ message: "Error interno del servidor." });
  }
};

/**
 * Obtiene todas las entregas para un examen específico (Docente / Admin).
 */
export const getSubmissionsForExam = async (req, res) => {
  try {
    const { examId } = req.params;
    const userId = req.user.userId;
    const userRole = req.user.role;

    const exam = await prisma.exam.findUnique({ where: { id: examId } });
    if (!exam) {
      return res.status(404).json({ message: "Examen no encontrado." });
    }
    if (exam.authorId !== userId && userRole !== 'ADMIN') {
      return res.status(403).json({ message: "No tienes permisos para ver las entregas de este examen." });
    }

    const submissions = await prisma.studentExam.findMany({
      where: { examId: examId },
      include: {
        student: { 
          select: { name: true, email: true }
        }
      },
      orderBy: { submittedAt: 'asc' }
    });

    res.status(200).json(submissions);
  } catch (error) {
    console.error("Error al obtener entregas del examen:", error);
    res.status(500).json({ message: "Error interno del servidor." });
  }
};