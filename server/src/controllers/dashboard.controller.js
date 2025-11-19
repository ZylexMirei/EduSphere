import prisma from '../prismaClient.js';

/**
 * Obtiene las estadísticas de rendimiento de un estudiante específico.
 * Para Docentes y Admins.
 */
export const getStudentPerformance = async (req, res) => {
  try {
    const { studentId } = req.params;

    const student = await prisma.user.findUnique({
      where: { id: studentId, role: 'ESTUDIANTE' }
    });
    if (!student) return res.status(404).json({ message: "Estudiante no encontrado." });

    const submissions = await prisma.studentExam.findMany({
      where: {
        studentId: studentId,
        grade: { not: null } 
      },
      include: {
        exam: { select: { title: true } }
      }
    });

    if (submissions.length === 0) {
      return res.status(200).json({
        message: "El estudiante no tiene exámenes calificados.",
        studentName: student.name,
        averageGrade: null,
        totalSubmitted: 0,
        submissions: []
      });
    }

    const totalGrades = submissions.reduce((sum, sub) => sum + sub.grade, 0);
    const averageGrade = totalGrades / submissions.length;

    res.status(200).json({
      studentName: student.name,
      averageGrade: parseFloat(averageGrade.toFixed(2)),
      totalSubmitted: submissions.length,
      submissions: submissions 
    });

  } catch (error) {
    console.error("Error al obtener rendimiento:", error);
    res.status(500).json({ message: "Error interno del servidor." });
  }
};