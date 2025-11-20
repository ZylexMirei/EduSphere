// server/src/routes/assistant.routes.js
import { Router } from 'express';
import { queryAssistant, generateFlashcards } from '../controllers/assistant.controller.js'; // <-- Importar nueva función
import { authenticateToken, authorizeRole } from '../middlewares/auth.middleware.js';
import { queryAssistant, generateFlashcards, generateFeedback } from '../controllers/assistant.controller.js';


const router = Router();
router.use(authenticateToken);

router.post('/query', authorizeRole('ESTUDIANTE'), queryAssistant);
router.post('/flashcards', authorizeRole('ESTUDIANTE'), generateFlashcards);
router.post('/feedback', authorizeRole(['DOCENTE', 'ADMIN']), generateFeedback);

export default router;