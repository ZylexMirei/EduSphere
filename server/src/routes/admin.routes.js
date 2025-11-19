import { Router } from 'express';
import {
  getAllUsers,
  createUser,
  updateUserRole,
  updateUserActivation,
  deleteUser,
  getSiteStats,
  getCourseStatistics,
  getAuditLogs
} from '../controllers/admin.controller.js';

import { authenticateToken, authorizeRole } from '../middlewares/auth.middleware.js';

const router = Router();

// El "guardia" protege TODAS las rutas de este archivo
router.use(authenticateToken, authorizeRole('ADMIN'));

// --- Gestión de Usuarios ---
router.get('/users', getAllUsers);
router.post('/users', createUser);
router.patch('/users/:id/role', updateUserRole);
router.patch('/users/:id/activation', updateUserActivation);
router.delete('/users/:id', deleteUser);


router.get('/stats/site', getSiteStats);     
router.get('/stats/courses', getCourseStatistics); 
router.get('/audit-logs', getAuditLogs);   

export default router;