import { Router } from 'express';
import { 
  register, 
  login, 
  verifyOTP, 
  resendOTP,
  requestPasswordReset, // <-- NUEVA
  resetPassword         // <-- NUEVA
} from '../controllers/auth.controller.js';

const router = Router();

// --- Rutas de Registro y Login ---
router.post('/register', register);
router.post('/login', login);

// --- Rutas de OTP (Verificación) ---
router.post('/verify-otp', verifyOTP);
router.post('/resend-otp', resendOTP);

// --- ¡NUEVAS RUTAS DE RESETEO DE CONTRASEÑA! ---
router.post('/request-password-reset', requestPasswordReset);
router.post('/reset-password', resetPassword);

export default router;