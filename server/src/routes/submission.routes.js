import { Router } from 'express';
import {
  submitExam,
  gradeSubmission,
  getMySubmissions,
  getSubmissionsForExam
} from '../controllers/submission.controller.js';

import { authenticateToken, authorizeRole } from '../middlewares/auth.middleware.js';
import { getSubmissionById } from '../controllers/submission.controller.js';

const router = Router();

// Aplicamos autenticación a TODAS las rutas
router.use(authenticateToken);
router.get('/:id', authorizeRole(['DOCENTE', 'ADMIN']), getSubmissionById);
// --- Rutas para Estudiantes ---

// POST /api/submissions/
// Entregar un examen
router.post(
  '/',
  authorizeRole('ESTUDIANTE'),
  submitExam
);

// GET /api/submissions/my-results
// Ver todas mis entregas y notas
router.get(
  '/my-results',
  authorizeRole('ESTUDIANTE'),
  getMySubmissions
);

// --- Rutas para Docentes / Admins ---

// GET /api/submissions/exam/:examId
// Ver todas las entregas de un examen específico
router.get(
  '/exam/:examId',
  authorizeRole(['DOCENTE', 'ADMIN']),
  getSubmissionsForExam
);

// PUT /api/submissions/:submissionId/grade
// Poner/Actualizar la nota de una entrega
router.put(
  '/:submissionId/grade',
  authorizeRole(['DOCENTE', 'ADMIN']),
  gradeSubmission
);

export default router;