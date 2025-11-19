import prisma from '../prismaClient.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { sendVerificationEmail, sendPasswordResetEmail } from '../services/mail.service.js';
import { createAuditLog } from '../services/audit.service.js'; // <-- ¡IMPORTA EL HISTORIAL!

// --- Función Ayudante ---
async function generateAndSendOTP(email, purpose) {
  try {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); 
    await prisma.oTP.deleteMany({ where: { email: email, purpose: purpose } });
    await prisma.oTP.create({ data: { email, code, expiresAt, purpose: purpose } });
    if (purpose === 'VERIFICATION') await sendVerificationEmail(email, code);
    else if (purpose === 'PASSWORD_RESET') await sendPasswordResetEmail(email, code);
  } catch (error) {
    console.error(`¡ERROR FATAL AL ENVIAR CORREO (${purpose})!`, error);
    throw new Error("Fallo al enviar el correo. Revisa SMTP o el logo.");
  }
}

// --- REGISTRO ---
export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: "Campos obligatorios." });
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return res.status(409).json({ message: "El correo ya está registrado." });
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await prisma.user.create({
      data: { name, email, password: hashedPassword, role: role || 'ESTUDIANTE', isVerified: false }
    });
    
    await generateAndSendOTP(email, 'VERIFICATION');
    // ¡HISTORIAL! (actorId es null porque aún no está logueado, pero sí guardamos el target)
    // await createAuditLog(null, 'USER_REGISTERED', { details: `Usuario ${email} se registró.` }, newUser.id, req.ip);
    
    res.status(201).json({ message: "Usuario registrado. Te hemos enviado un código." });
  } catch (error) {
    if (error.message.includes("Fallo al enviar el correo")) return res.status(500).json({ message: "Usuario registrado, pero falló el envío del correo." });
    res.status(500).json({ message: "Error interno del servidor." });
  }
};

// --- LOGIN (A Prueba de Balas) ---
export const login = async (req, res) => {
  try {
    if (!process.env.JWT_SECRET) return res.status(500).json({ message: "Error de configuración interna." });

    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Campos obligatorios." });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      await createAuditLog('system', 'LOGIN_FAILED', { details: `Intento (email no existe): ${email}`, ipAddress: req.ip });
      return res.status(401).json({ message: "Credenciales inválidas." });
    }

    let isPasswordCorrect;
    try { isPasswordCorrect = await bcrypt.compare(password, user.password); } 
    catch (e) { isPasswordCorrect = false; } // ¡Anti-Crash!

    if (!isPasswordCorrect) {
      await createAuditLog(user.id, 'LOGIN_FAILED', { details: `Intento (pass incorrecta) para ${email}`, ipAddress: req.ip });
      return res.status(401).json({ message: "Credenciales inválidas." });
    }
    
    if (!user.isVerified && user.role !== 'ADMIN') {
      try {
        await generateAndSendOTP(email, 'VERIFICATION'); 
        return res.status(403).json({ message: "Tu cuenta no está verificada. Te hemos enviado un nuevo código." });
      } catch (emailError) {
        return res.status(403).json({ message: "Tu cuenta no está verificada. (No se pudo reenviar el código)." });
      }
    }

    const token = jwt.sign({ userId: user.id, role: user.role, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1d' });
    
    await createAuditLog(user.id, 'LOGIN_SUCCESS', { details: `Login exitoso para ${email}`, ipAddress: req.ip });

    res.status(200).json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
    
  } catch (error) {
    res.status(500).json({ message: "Error interno del servidor." });
  }
};

// --- VERIFICAR OTP ---
export const verifyOTP = async (req, res) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) return res.status(400).json({ message: "Campos obligatorios." });

    const otpRecord = await prisma.oTP.findFirst({
      where: { email: email, code: code, purpose: 'VERIFICATION', used: false, expiresAt: { gt: new Date() } }
    });
    if (!otpRecord) return res.status(400).json({ message: "Código OTP inválido o expirado." });

    const user = await prisma.user.update({ where: { email: email }, data: { isVerified: true } });
    await prisma.oTP.update({ where: { id: otpRecord.id }, data: { used: true } });
    
    await createAuditLog(user.id, 'ACCOUNT_VERIFIED', { details: `Cuenta ${email} verificada.`, ipAddress: req.ip });

    const token = jwt.sign({ userId: user.id, role: user.role, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.status(200).json({
      message: "¡Cuenta verificada exitosamente!",
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    res.status(500).json({ message: "Error interno del servidor." });
  }
};

// --- REENVIAR OTP ---
export const resendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email es obligatorio." });
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ message: "Usuario no encontrado." });
    if (user.isVerified) return res.status(400).json({ message: "Esta cuenta ya está verificada." });
    await generateAndSendOTP(email, 'VERIFICATION');
    res.status(200).json({ message: "Se ha enviado un nuevo código OTP a tu correo." });
  } catch (error) {
    res.status(500).json({ message: "Error al reenviar el código." });
  }
};

// --- SOLICITAR RESETEO ---
export const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (user) {
      await generateAndSendOTP(email, 'PASSWORD_RESET');
      await createAuditLog(user.id, 'PASSWORD_RESET_REQUESTED', { details: `Solicitud de reseteo para ${email}`, ipAddress: req.ip });
    }
    res.status(200).json({ message: "Si tu correo está en nuestro sistema, recibirás un código." });
  } catch (error) {
    res.status(500).json({ message: "Error interno del servidor." });
  }
};

// --- RESETEAR CONTRASEÑA ---
export const resetPassword = async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;
    if (!email || !code || !newPassword) return res.status(400).json({ message: "Campos obligatorios." });

    const otpRecord = await prisma.oTP.findFirst({
      where: { email: email, code: code, purpose: 'PASSWORD_RESET', used: false, expiresAt: { gt: new Date() } }
    });
    if (!otpRecord) return res.status(400).json({ message: "Código inválido o expirado." });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const user = await prisma.user.update({ where: { email: email }, data: { password: hashedPassword } });
    await prisma.oTP.update({ where: { id: otpRecord.id }, data: { used: true } });
    
    await createAuditLog(user.id, 'PASSWORD_RESET_SUCCESS', { details: `Contraseña reseteada para ${email}`, ipAddress: req.ip });

    res.status(200).json({ message: "Contraseña actualizada exitosamente." });
  } catch (error) {
    res.status(500).json({ message: "Error interno del servidor." });
  }
};