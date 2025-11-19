import { Router } from 'express';
import { queryAssistant } from '../controllers/assistant.controller.js';
import { authenticateToken, authorizeRole } from '../middlewares/auth.middleware.js';

const router = Router();

// Aplicamos autenticación
router.use(authenticateToken);

// POST /api/assistant/query
// Ruta para que los estudiantes hagan preguntas
router.post(
  '/query',
  authorizeRole('ESTUDIANTE'), // Solo los estudiantes pueden usarlo
  queryAssistant
);

export default router;