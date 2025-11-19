import { Router } from 'express';
import { getStudentPerformance } from '../controllers/dashboard.controller.js';
import { authenticateToken, authorizeRole } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(authenticateToken);

// GET /api/dashboard/student/:studentId
// Ver el rendimiento de un estudiante específico (Docentes/Admins)
router.get(
  '/student/:studentId',
  authorizeRole(['DOCENTE', 'ADMIN']),
  getStudentPerformance
);



export default router;