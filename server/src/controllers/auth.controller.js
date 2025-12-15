import prisma from '../prismaClient.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { sendVerificationEmail, sendPasswordResetEmail } from '../services/mail.service.js';
import { createAuditLog } from '../services/audit.service.js';

// --- HELPER: OBTENER IP REAL (LIMPIA) ---
const getCleanIp = (req) => {
  let ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip || 'Unknown';
  
  // 1. Limpiamos prefijo de IPv6 de Windows
  if (ip.includes('::ffff:')) {
    ip = ip.split('::ffff:')[1];
  }

  // 2. Si es Localhost, lo mostramos bonito
  if (ip === '::1') {
    return '127.0.0.1';
  }
  
  // 3. Si es una IP de red (192.168...) o pública, la devolvemos tal cual
  return ip;
};

// --- Helper OTP ---
async function generateAndSendOTP(email, purpose) {
  try {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); 

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
    throw new Error(error.message || "No se pudo enviar el correo.");
  }
}

// --- 1. REGISTRO ---
export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: "Faltan campos." });

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return res.status(409).json({ message: "El correo ya existe." });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: { name, email, password: hashedPassword, role: role || 'ESTUDIANTE', isVerified: false }
    });

    await generateAndSendOTP(email, 'VERIFICATION');
    
    try {
        if(createAuditLog) await createAuditLog(newUser.id, 'USER_REGISTER_SELF', { details: 'Usuario registrado' }, newUser.id, getCleanIp(req));
    } catch(e) {}
    
    res.status(201).json({ message: "Usuario creado. Revisa tu correo." });
  } catch (error) {
    res.status(500).json({ message: error.message || "Error al registrar." });
  }
};

// --- 2. LOGIN (SOLO OTP) ---
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Faltan credenciales." });

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !(await bcrypt.compare(password, user.password))) {
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
    res.status(500).json({ message: error.message || "Error en login." });
  }
};

// --- 3. VERIFICAR OTP ---
export const verifyOTP = async (req, res) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) return res.status(400).json({ message: "Faltan datos." });

    const validOtp = await prisma.oTP.findFirst({
      where: { email, code, purpose: 'VERIFICATION', used: false, expiresAt: { gt: new Date() } }
    });

    if (!validOtp) return res.status(400).json({ message: "Código inválido o expirado." });

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

    // LOG DE ÉXITO CON IP REAL
    await createAuditLog(user.id, 'LOGIN_SUCCESS', { method: 'OTP' }, user.id, getCleanIp(req));

    res.status(200).json({
      message: "Bienvenido",
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });

  } catch (error) {
    res.status(500).json({ message: "Error verificando código." });
  }
};

export const resendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ message: "Usuario no encontrado." });

    await generateAndSendOTP(email, 'VERIFICATION');
    res.status(200).json({ message: "Nuevo código enviado." });
  } catch (error) {
    res.status(500).json({ message: "Error al reenviar." });
  }
};

export const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (user) {
      await generateAndSendOTP(email, 'PASSWORD_RESET');
      await createAuditLog(user.id, 'PASSWORD_RESET_REQUEST', {}, user.id, getCleanIp(req));
    }
    res.status(200).json({ message: "Si existe, se envió el código." });
  } catch (error) {
    res.status(500).json({ message: "Error en solicitud." });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;
    const validOtp = await prisma.oTP.findFirst({
      where: { email, code, purpose: 'PASSWORD_RESET', used: false, expiresAt: { gt: new Date() } }
    });

    if (!validOtp) return res.status(400).json({ message: "Código inválido." });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const user = await prisma.user.update({ where: { email }, data: { password: hashedPassword } });

    await prisma.oTP.update({ where: { id: validOtp.id }, data: { used: true } });
    await createAuditLog(user.id, 'PASSWORD_RESET_SUCCESS', {}, user.id, getCleanIp(req));

    res.status(200).json({ message: "Contraseña actualizada." });
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar." });
  }
};