import { Router } from 'express';
import { chatWithIA, generateFlashcards } from '../controllers/assistant.controller.js';
import { authenticateToken } from '../middlewares/auth.middleware.js'; // Ajusta la ruta si es distinta

const router = Router();

// Rutas protegidas (solo usuarios logueados pueden usar la IA)
router.post('/chat', authenticateToken, chatWithIA);
router.post('/flashcards', authenticateToken, generateFlashcards);

export default router;