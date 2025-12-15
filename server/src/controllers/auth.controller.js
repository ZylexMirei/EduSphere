import prisma from '../prismaClient.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { sendVerificationEmail, sendPasswordResetEmail } from '../services/mail.service.js';
import { createAuditLog } from '../services/audit.service.js';

// --- TRUCO IP: SIMULAR IP PÚBLICA ---
const getCleanIp = (req) => {
  let ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip || 'Unknown';
  
  // Si detecta Localhost, miente y pone la IP real que quieres mostrar
  if (ip === '::1' || ip === '127.0.0.1' || ip.includes('127.0.0.1')) {
     return '177.222.63.154'; 
  }
  
  if (ip.includes('::ffff:')) return ip.split('::ffff:')[1];
  return ip;
};

// --- Función Ayudante para generar y guardar OTP ---
async function generateAndSendOTP(email, purpose) {
  try {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutos

    await prisma.oTP.deleteMany({ where: { email, purpose } });

    await prisma.oTP.create({
      data: { email, code, expiresAt, purpose }
    });

    if (purpose === 'VERIFICATION') {
      await sendVerificationEmail(email, code);
    } else if (purpose === 'PASSWORD_RESET') {
      await sendPasswordResetEmail(email, code);
    }
  } catch (error) {
    console.error(`Error enviando OTP (${purpose}):`, error);
    throw new Error(error.message || "No se pudo enviar el correo de verificación.");
  }
}

// --- 1. REGISTRO ---
export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: "Faltan campos obligatorios." });

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return res.status(409).json({ message: "El correo ya está registrado." });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role || 'ESTUDIANTE',
        isVerified: false 
      }
    });

    await generateAndSendOTP(email, 'VERIFICATION');
    
    // Log con IP Trucada
    try {
        if(createAuditLog) await createAuditLog(newUser.id, 'USER_REGISTER_SELF', { details: 'Usuario se registró' }, newUser.id, getCleanIp(req));
    } catch(e) {}
    
    res.status(201).json({ message: "Usuario creado. Revisa tu correo para el código." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || "Error en el servidor al registrar." });
  }
};

// --- 2. LOGIN (SOLO OTP) ---
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Faltan credenciales." });

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      // Log de fallo con IP Trucada
      if(user) await createAuditLog(user.id, 'LOGIN_FAILED', { reason: 'Password incorrecto' }, user.id, getCleanIp(req));
      return res.status(401).json({ message: "Credenciales inválidas." });
    }

    await generateAndSendOTP(email, 'VERIFICATION');

    res.status(200).json({
      message: "Credenciales correctas. Código enviado.",
      requireOtp: true,
      email: user.email
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || "Error interno en login." });
  }
};

// --- 3. VERIFICAR OTP Y DAR TOKEN ---
export const verifyOTP = async (req, res) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) return res.status(400).json({ message: "Faltan datos." });

    const validOtp = await prisma.oTP.findFirst({
      where: {
        email,
        code,
        purpose: 'VERIFICATION',
        used: false,
        expiresAt: { gt: new Date() }
      }
    });

    if (!validOtp) {
      return res.status(400).json({ message: "Código inválido o expirado." });
    }

    await prisma.oTP.update({ where: { id: validOtp.id }, data: { used: true } });

    const user = await prisma.user.update({
      where: { email },
      data: { isVerified: true }
    });

    const token = jwt.sign(
      { userId: user.id, role: user.role, email: user.email },
      process.env.JWT_SECRET || 'secret_key',
      { expiresIn: '24h' }
    );

    // --- AQUÍ SE GUARDA LA IP TRUCADA (177.222...) ---
    const userIp = getCleanIp(req);
    await createAuditLog(
        user.id, 
        'LOGIN_SUCCESS', 
        { method: 'OTP' }, 
        user.id, 
        userIp 
    );

    res.status(200).json({
      message: "Bienvenido a EduSphere",
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error verificando código." });
  }
};

// --- REENVIAR OTP ---
export const resendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ message: "Usuario no encontrado." });

    await generateAndSendOTP(email, 'VERIFICATION');
    res.status(200).json({ message: "Nuevo código enviado." });
  } catch (error) {
    res.status(500).json({ message: error.message || "Error al reenviar." });
  }
};

// --- SOLICITAR RESET PASSWORD ---
export const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    
    if (user) {
      await generateAndSendOTP(email, 'PASSWORD_RESET');
      await createAuditLog(user.id, 'PASSWORD_RESET_REQUEST', {}, user.id, getCleanIp(req));
    }
    
    res.status(200).json({ message: "Si el correo existe, recibirás un código." });
  } catch (error) {
    res.status(500).json({ message: error.message || "Error en la solicitud." });
  }
};

// --- EJECUTAR RESET PASSWORD ---
export const resetPassword = async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;
    
    const validOtp = await prisma.oTP.findFirst({
      where: {
        email,
        code,
        purpose: 'PASSWORD_RESET',
        used: false,
        expiresAt: { gt: new Date() }
      }
    });

    if (!validOtp) return res.status(400).json({ message: "Código inválido." });

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const user = await prisma.user.update({
      where: { email },
      data: { password: hashedPassword }
    });

    await prisma.oTP.update({ where: { id: validOtp.id }, data: { used: true } });
    
    await createAuditLog(user.id, 'PASSWORD_RESET_SUCCESS', {}, user.id, getCleanIp(req));

    res.status(200).json({ message: "Contraseña actualizada correctamente." });
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar contraseña." });
  }
};