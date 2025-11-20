import prisma from '../prismaClient.js';

/**
 * Crea un nuevo examen.
 * Solo para Docentes y Admins.
 */
export const createExam = async (req, res) => {
  try {
    // Recibimos assignedTo (array de IDs) y duration (minutos) del frontend
    const { title, questions, assignedTo, duration } = req.body; 
    const authorId = req.user.userId; // De 'authenticateToken'

    if (!title || !questions) {
      return res.status(400).json({ message: "El título y las preguntas son obligatorios." });
    }

    // Validamos que 'questions' sea un array (o al menos un JSON válido)
    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ message: "El formato de 'questions' debe ser un array JSON no vacío." });
    }

    const newExam = await prisma.exam.create({
      data: {
        title,
        questions, // Prisma se encarga de guardar el JSON
        authorId,
        // Si no envían nada, guardamos array vacío (significa "Para Todos")
        assignedTo: assignedTo || [],
        // Guardamos la duración o 60 minutos por defecto
        duration: parseInt(duration) || 60 
      }
    });

    res.status(201).json(newExam);
  } catch (error) {
    console.error("Error al crear examen:", error);
    res.status(500).json({ message: "Error interno del servidor." });
  }
};

/**
 * Obtiene todos los exámenes.
 * - Docentes/Admins: Ven todos.
 * - Estudiantes: Ven solo los públicos (assignedTo vacío) o los asignados a ellos.
 */
export const getAllExams = async (req, res) => {
  try {
    const userId = req.user.userId;
    const userRole = req.user.role;

    let whereClause = {};

    // Lógica de Filtrado para Estudiantes:
    if (userRole === 'ESTUDIANTE') {
      whereClause = {
        OR: [
          { assignedTo: { has: userId } }, // O está asignado específicamente a mí
          { assignedTo: { equals: [] } }   // O está vacío (para todos)
        ]
      };
    }
    // Docentes y Admins ven todos (whereClause se queda vacío)

    const exams = await prisma.exam.findMany({
      where: whereClause,
      include: {
        author: {
          select: { name: true }
        },
        // Contamos cuántas veces se ha entregado
        _count: {
          select: { submissions: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    res.status(200).json(exams);
  } catch (error) {
    console.error("Error al obtener exámenes:", error);
    res.status(500).json({ message: "Error interno del servidor." });
  }
};

/**
 * Obtiene un examen por su ID.
 * Para todos los usuarios logueados.
 */
export const getExamById = async (req, res) => {
  try {
    const { id } = req.params;
    const exam = await prisma.exam.findUnique({
      where: { id: id },
      include: {
        author: {
          select: { name: true }
        }
      }
    });

    if (!exam) {
      return res.status(404).json({ message: "Examen no encontrado." });
    }

    res.status(200).json(exam);
  } catch (error) {
    console.error("Error al obtener examen por ID:", error);
    res.status(500).json({ message: "Error interno del servidor." });
  }
};

/**
 * Actualiza un examen.
 * Solo para Admins o el Docente que lo creó.
 */
export const updateExam = async (req, res) => {
  try {
    const { id } = req.params;
    // Recibimos los campos actualizables
    const { title, questions, assignedTo, duration } = req.body;
    const userId = req.user.userId;
    const userRole = req.user.role;

    const exam = await prisma.exam.findUnique({
      where: { id: id }
    });

    if (!exam) {
      return res.status(404).json({ message: "Examen no encontrado." });
    }

    // Verificar permisos
    if (exam.authorId !== userId && userRole !== 'ADMIN') {
      return res.status(403).json({ message: "No tienes permisos para editar este examen." });
    }

    const updatedExam = await prisma.exam.update({
      where: { id: id },
      data: {
        title,
        questions,
        assignedTo: assignedTo || [], // Actualizamos asignación
        duration: parseInt(duration) || 60 // Actualizamos duración
      }
    });

    res.status(200).json(updatedExam);
  } catch (error) {
    console.error("Error al actualizar examen:", error);
    res.status(500).json({ message: "Error interno del servidor." });
  }
};

/**
 * Elimina un examen.
 * Solo para Admins o el Docente que lo creó.
 */
export const deleteExam = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const userRole = req.user.role;

    const exam = await prisma.exam.findUnique({
      where: { id: id }
    });

    if (!exam) {
      return res.status(404).json({ message: "Examen no encontrado." });
    }

    // Verificar permisos
    if (exam.authorId !== userId && userRole !== 'ADMIN') {
      return res.status(403).json({ message: "No tienes permisos para eliminar este examen." });
    }

    await prisma.exam.delete({
      where: { id: id }
    });

    res.status(204).send(); // No Content
  } catch (error) {
    // Manejar error si hay entregas (foreign key constraint)
    if (error.code === 'P2003') {
        return res.status(409).json({ message: "No se puede eliminar el examen porque ya tiene entregas de estudiantes."});
    }
    console.error("Error al eliminar examen:", error);
    res.status(500).json({ message: "Error interno del servidor." });
  }
};