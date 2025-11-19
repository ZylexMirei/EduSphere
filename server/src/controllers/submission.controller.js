import prisma from '../prismaClient.js';

/**
 * Entrega un examen (Estudiante).
 * Recibe las respuestas y calcula una nota preliminar.
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

    // 2. (BONO: Autocalificación) Traer el examen para comparar respuestas
    // En un proyecto real, esto sería más complejo.
    // Por ahora, solo guardaremos las respuestas. El docente calificará.
    const exam = await prisma.exam.findUnique({ where: { id: examId } });
    if (!exam) {
      return res.status(404).json({ message: "Examen no encontrado." });
    }
    
    // --- Lógica de autocalificación simple (Opcional) ---
    // let score = 0;
    // const questions = exam.questions; // Array de preguntas del examen
    // questions.forEach((question, index) => {
    //   const studentAnswer = answers.find(a => a.questionIndex === index);
    //   if (studentAnswer && studentAnswer.answer === question.correct) {
    //     score++;
    //   }
    // });
    // const finalGrade = (score / questions.length) * 100;
    // --- Fin de autocalificación ---
    
    // Por ahora, guardamos la entrega sin nota (grade: null).
    // El docente debe calificarla.
    const newSubmission = await prisma.studentExam.create({
      data: {
        studentId: studentId,
        examId: examId,
        answers: answers, // Guardamos el JSON de respuestas del estudiante
        submitted: true,
        // grade: finalGrade // Descomentar para autocalificación
      }
    });

    res.status(201).json({ message: "Examen entregado exitosamente. Esperando calificación.", submissionId: newSubmission.id });
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
    const { grade } = req.body;
    const userId = req.user.userId;
    const userRole = req.user.role;

    if (grade === undefined || grade === null) {
      return res.status(400).json({ message: "La nota (grade) es obligatoria." });
    }

    // 1. Buscar la entrega
    const submission = await prisma.studentExam.findUnique({
      where: { id: submissionId },
      include: { exam: true } // Incluimos el examen para verificar el autor
    });

    if (!submission) {
      return res.status(404).json({ message: "Entrega no encontrada." });
    }

    // 2. Verificar permisos (Solo el autor del examen o un Admin)
    if (submission.exam.authorId !== userId && userRole !== 'ADMIN') {
      return res.status(403).json({ message: "No tienes permisos para calificar esta entrega." });
    }

    // 3. Actualizar la nota
    const gradedSubmission = await prisma.studentExam.update({
      where: { id: submissionId },
      data: {
        grade: parseFloat(grade) // Aseguramos que sea un número
      }
    });

    res.status(200).json(gradedSubmission);
  } catch (error) {
    console.error("Error al calificar:", error);
    res.status(500).json({ message: "Error interno del servidor." });
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
        exam: { // Para que el estudiante sepa a qué examen pertenece
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

    // Verificar que el examen existe y que el usuario es el autor o Admin
    const exam = await prisma.exam.findUnique({ where: { id: examId } });
    if (!exam) {
      return res.status(404).json({ message: "Examen no encontrado." });
    }
    if (exam.authorId !== userId && userRole !== 'ADMIN') {
      return res.status(403).json({ message: "No tienes permisos para ver las entregas de este examen." });
    }

    // Buscar todas las entregas para ese examen
    const submissions = await prisma.studentExam.findMany({
      where: { examId: examId },
      include: {
        student: { // Para que el docente sepa quién lo entregó
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