import prisma from '../prismaClient.js';
import { createAuditLog } from '../services/audit.service.js';
import fs from 'fs';       
import mammoth from 'mammoth'; 

// Importación compatible para pdf-parse
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdf = require('pdf-parse'); 

// --- HELPER IP REAL ---
const getCleanIp = (req) => {
  let ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip || 'Unknown';
  if (ip.includes('::ffff:')) ip = ip.split('::ffff:')[1];
  if (ip === '::1') return '127.0.0.1';
  return ip;
};

// --- Extraer Texto para IA ---
const extractTextFromFile = async (file) => {
  try {
    const filePath = file.path;
    const mimeType = file.mimetype;

    if (mimeType === 'application/pdf') {
      const dataBuffer = fs.readFileSync(filePath);
      const data = await pdf(dataBuffer);
      return `\n--- Contenido del archivo ${file.originalname} ---\n${data.text}\n`;
    } 
    else if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      const result = await mammoth.extractRawText({ path: filePath });
      return `\n--- Contenido del archivo ${file.originalname} ---\n${result.value}\n`;
    }
    return ''; 
  } catch (error) {
    console.error(`Error leyendo archivo ${file.originalname}:`, error);
    return '';
  }
};

export const createMaterial = async (req, res) => {
  try {
    if (!req.user || !req.user.userId) return res.status(401).json({ message: "No autenticado." });
    
    const authorId = req.user.userId;
    const { title, content } = req.body; 

    if (!title) return res.status(400).json({ message: "Título obligatorio." });

    const uploadedAttachments = [];
    let extractedTextContent = ""; 

    if (req.files && req.files.length > 0) {
      const protocol = req.protocol;
      const host = req.get('host'); 
      for (const file of req.files) {
        uploadedAttachments.push(`${protocol}://${host}/uploads/${file.filename}`);
        extractedTextContent += await extractTextFromFile(file);
      }
    }

    const finalContentForAI = (content || "") + "\n" + extractedTextContent;

    const newMaterial = await prisma.material.create({
      data: {
        title: title,
        content: finalContentForAI, 
        attachments: uploadedAttachments, 
        authorId: authorId,
      }
    });
    
    try {
      if (createAuditLog) {
        await createAuditLog(authorId, 'MATERIAL_CREATED', { details: `Material: ${title}` }, newMaterial.id, getCleanIp(req));
      }
    } catch (e) {}

    res.status(201).json(newMaterial);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error interno." });
  }
};

export const getAllMaterials = async (req, res) => {
  try {
    const materials = await prisma.material.findMany({
      include: { author: { select: { name: true, email: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.status(200).json(materials);
  } catch (error) {
    res.status(500).json({ message: "Error interno." });
  }
};

export const getMaterialById = async (req, res) => {
  try {
    const { id } = req.params;
    const material = await prisma.material.findUnique({
      where: { id: id },
      include: { author: { select: { name: true, email: true } } }
    });
    if (!material) return res.status(404).json({ message: "No encontrado." });
    res.status(200).json(material);
  } catch (error) {
    res.status(500).json({ message: "Error interno." });
  }
};

export const updateMaterial = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;
    const userId = req.user.userId;
    const userRole = req.user.role;
    
    const material = await prisma.material.findUnique({ where: { id } });
    if (!material) return res.status(404).json({ message: "No encontrado." });
    
    if (material.authorId !== userId && userRole !== 'ADMIN') return res.status(403).json({ message: "Sin permisos." });

    const updated = await prisma.material.update({ where: { id }, data: { title, content } });
    
    try { if (createAuditLog) await createAuditLog(userId, 'MATERIAL_UPDATED', { details: `Actualizado: ${title}` }, id, getCleanIp(req)); } catch (e) {}

    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: "Error interno." });
  }
};

export const deleteMaterial = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const userRole = req.user.role;

    const material = await prisma.material.findUnique({ where: { id } });
    if (!material) return res.status(404).json({ message: "No encontrado." });

    if (material.authorId !== userId && userRole !== 'ADMIN') return res.status(403).json({ message: "Sin permisos." });

    await prisma.material.delete({ where: { id } });

    try { if (createAuditLog) await createAuditLog(userId, 'MATERIAL_DELETED', { details: `Eliminado: ${material.title}` }, id, getCleanIp(req)); } catch (e) {}

    res.status(204).send(); 
  } catch (error) {
    res.status(500).json({ message: "Error interno." });
  }
};