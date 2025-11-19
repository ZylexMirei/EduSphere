import { Router } from 'express';
import {
  createMaterial,
  getAllMaterials,
  getMaterialById,
  updateMaterial,
  deleteMaterial
} from '../controllers/material.controller.js';

import { authenticateToken, authorizeRole } from '../middlewares/auth.middleware.js';
// Importamos la configuración de Multer que acabamos de arreglar
import { upload } from '../config/multer.config.js'; 

const router = Router();

// Todas las rutas requieren login
router.use(authenticateToken);

// --- RUTA DE CREAR (POST) ---
router.post(
  '/', 
  authorizeRole(['DOCENTE', 'ADMIN']), 
  // ¡OJO AQUÍ! 'attachments' debe coincidir con el nombre en el Frontend
  upload.array('attachments', 5), 
  createMaterial
);

// --- RUTAS DE LECTURA (GET) ---
router.get('/', authorizeRole(['ESTUDIANTE', 'DOCENTE', 'ADMIN']), getAllMaterials);
router.get('/:id', authorizeRole(['ESTUDIANTE', 'DOCENTE', 'ADMIN']), getMaterialById);

// --- RUTAS DE EDICIÓN/BORRADO (PUT/DELETE) ---
router.put('/:id', authorizeRole(['DOCENTE', 'ADMIN']), updateMaterial);
router.delete('/:id', authorizeRole(['DOCENTE', 'ADMIN']), deleteMaterial);

export default router;