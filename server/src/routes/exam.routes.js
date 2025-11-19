import { Router } from 'express';
import {
  createExam,
  getAllExams,
  getExamById,
  updateExam,
  deleteExam
} from '../controllers/exam.controller.js';

// Importamos nuestros middlewares
import { authenticateToken, authorizeRole } from '../middlewares/auth.middleware.js';

const router = Router();

// Aplicamos autenticación a TODAS las rutas de exámenes
router.use(authenticateToken);

// --- Definición de Rutas ---

// POST /api/exams/
// Crear un nuevo examen (Solo Docentes y Admins)
router.post(
  '/',
  authorizeRole(['DOCENTE', 'ADMIN']),
  createExam
);

// GET /api/exams/
// Ver todos los exámenes (Todos los roles logueados)
router.get(
  '/',
  authorizeRole(['ESTUDIANTE', 'DOCENTE', 'ADMIN']),
  getAllExams
);

// GET /api/exams/:id
// Ver un examen específico (Todos los roles logueados)
router.get(
  '/:id',
  authorizeRole(['ESTUDIANTE', 'DOCENTE', 'ADMIN']),
  getExamById
);

// PUT /api/exams/:id
// Actualizar un examen (Solo Docentes y Admins)
router.put(
  '/:id',
  authorizeRole(['DOCENTE', 'ADMIN']),
  updateExam
);

// DELETE /api/exams/:id
// Eliminar un examen (Solo Docentes y Admins)
router.delete(
  '/:id',
  authorizeRole(['DOCENTE', 'ADMIN']),
  deleteExam
);

export default router;