import nodemailer from 'nodemailer';
import path from 'path';
import fs from 'fs'; // <-- ¡IMPORTANTE! Para verificar si el archivo existe
import 'dotenv/config';

// Configuración del transporter (esto se queda igual)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_PORT == 465, 
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// --- FUNCIÓN DE LOGO "A PRUEBA DE BALAS" ---
const getLogoAttachment = () => {
  const attachments = [];
  const logoPath = path.join(process.cwd(), 'src', 'assets', 'logo.png'); // Asegúrate que se llame 'logo.png'
  
  // ¡AQUÍ ESTÁ LA MAGIA!
  if (fs.existsSync(logoPath)) {
    attachments.push({
      filename: 'logo.png',
      path: logoPath,
      cid: 'edusphere_logo_unique_id' // ID para usar en el HTML
    });
  } else {
    // Si no lo encuentra, no crashea, solo avisa.
    console.warn("\nADVERTENCIA: No se encontró el logo en /server/src/assets/logo.png. El correo se enviará sin logo.\n");
  }
  return attachments;
};

// --- FUNCIÓN DE HTML "A PRUEBA DE BALAS" ---
// (Le pasamos 'attachments' para saber si debe mostrar el logo o no)
const getEmailHtml = (title, headerText, bodyText, otpCode, attachments) => {
  // Mostramos el logo en el HTML SÓLO si se pudo adjuntar
  const logoHtml = attachments.length > 0 
    ? '<img src="cid:edusphere_logo_unique_id" alt="EduSphere Logo" class="logo-img" />' 
    : '';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f0f4f8; color: #334155; }
        .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.08); }
        .header { background-color: #0B1120; padding: 40px 30px; text-align: center; border-bottom: 4px solid #06B6D4; }
        .logo-img { width: 80px; height: auto; margin-bottom: 10px; display: block; margin: auto; }
        .logo-text { color: #ffffff; font-size: 26px; font-weight: 800; letter-spacing: 1px; margin: 0; text-transform: uppercase; display: block; }
        .logo-text span { color: #06B6D4; }
        .content { padding: 40px 30px; }
        .title { color: #1e293b; font-size: 22px; font-weight: 700; margin-top: 0; margin-bottom: 20px; }
        .text { font-size: 16px; line-height: 1.6; color: #64748b; margin-bottom: 20px; }
        .otp-container { margin: 35px 0; text-align: center; }
        .otp-box { display: inline-block; background-color: #F8FAFC; border: 2px dashed #06B6D4; border-radius: 12px; padding: 15px 40px; }
        .otp-code { font-size: 32px; font-weight: 800; color: #0B1120; letter-spacing: 8px; font-family: monospace; margin: 0; }
        .footer { background-color: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          ${logoHtml} 
          <div class="logo-text">EDU<span>SPHERE</span></div>
        </div>
        <div class="content">
          <h2 class="title">${title}</h2>
          <p class="text">${headerText}</p>
          <p class="text">${bodyText}</p>
          <div class="otp-container">
            <div class="otp-box"><p class="otp-code">${otpCode}</p></div>
          </div>
          <p class="text" style="text-align: center; font-size: 14px; color: #ef4444;">
            ⚠️ Este código expira en 10 minutos
          </p>
        </div>
        <div class="footer"><p>© 2025 EduSphere Platform.</p></div>
      </div>
    </body>
    </html>
  `;
};

// --- FUNCIÓN DE VERIFICACIÓN (ACTUALIZADA) ---
export const sendVerificationEmail = async (toEmail, otpCode) => {
  const attachments = getLogoAttachment();
  const html = getEmailHtml(
    "Verificación de Cuenta",
    "¡Hola! Gracias por registrarte en EduSphere.",
    "Usa este código único para completar tu registro:",
    otpCode,
    attachments
  );

  const mailOptions = {
    from: `"EduSphere Security" <${process.env.SMTP_USER}>`,
    to: toEmail, 
    subject: "Tu código de verificación - EduSphere", 
    html: html,
    attachments: attachments,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Correo de verificación enviado a ${toEmail}`);
  } catch (error) {
    console.error("¡ERROR DE SMTP AL ENVIAR VERIFICACIÓN!", error);
    // Propagamos el error de NodeMailer para que auth.controller.js lo capture
    throw new Error("Fallo al enviar el correo. Revisa las credenciales SMTP en .env: " + error.message);
  }
};

// --- FUNCIÓN DE RESETEO (ACTUALIZADA) ---
export const sendPasswordResetEmail = async (toEmail, otpCode) => {
  const attachments = getLogoAttachment();
  const html = getEmailHtml(
    "Solicitud de Reseteo de Contraseña",
    "Hola, recibimos una solicitud para resetear tu contraseña.",
    "Usa el siguiente código para crear una nueva contraseña:",
    otpCode,
    attachments
  );

  const mailOptions = {
    from: `"EduSphere Security" <${process.env.SMTP_USER}>`,
    to: toEmail, 
    subject: "🔑 Tu código de reseteo de contraseña", 
    html: html,
    attachments: attachments,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Correo de reseteo enviado a ${toEmail}`);
  } catch (error) {
    console.error("¡ERROR DE SMTP AL ENVIAR RESETEO!", error);
    // Propagamos el error de NodeMailer
    throw new Error("Fallo al enviar el correo. Revisa las credenciales SMTP en .env: " + error.message);
  }
};