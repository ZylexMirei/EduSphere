import { Router } from 'express';
// Aquí estaba el error: antes tenías dos líneas importando cosas. Ahora solo una:
import { queryAssistant, generateFlashcards, generateFeedback } from '../controllers/assistant.controller.js';
import { authenticateToken, authorizeRole } from '../middlewares/auth.middleware.js';

const router = Router();


router.use(authenticateToken);

router.post('/query', authorizeRole('ESTUDIANTE'), queryAssistant);
router.post('/flashcards', authorizeRole('ESTUDIANTE'), generateFlashcards)

router.post('/feedback', authorizeRole(['DOCENTE', 'ADMIN']), generateFeedback);

export default router;