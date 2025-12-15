import prisma from '../prismaClient.js';
import { createAuditLog } from '../services/audit.service.js';
import fs from 'fs';       
import mammoth from 'mammoth'; 

// --- CORRECCIÓN DEL REQUIRE (Para que no falle pdf-parse) ---
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdf = require('pdf-parse'); 
// -----------------------------------------------------------

// --- TRUCO IP: SIMULAR IP PÚBLICA ---
const getCleanIp = (req) => {
  let ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip || 'Unknown';
  
  if (ip === '::1' || ip === '127.0.0.1' || ip.includes('127.0.0.1')) {
     return '177.222.63.154'; 
  }
  
  if (ip.includes('::ffff:')) return ip.split('::ffff:')[1];
  return ip;
};

// --- Helper: Extraer Texto para IA ---
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

/**
 * CREAR MATERIAL
 */
export const createMaterial = async (req, res) => {
  console.log("--- INICIO DE CREATE MATERIAL ---");
  
  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ message: "Usuario no autenticado." });
    }
    const authorId = req.user.userId;
    const { title, content } = req.body; 

    if (!title) {
      return res.status(400).json({ message: "El título es obligatorio." });
    }

    const uploadedAttachments = [];
    let extractedTextContent = ""; 

    if (req.files && req.files.length > 0) {
      const protocol = req.protocol;
      const host = req.get('host'); 
      
      for (const file of req.files) {
        const fileUrl = `${protocol}://${host}/uploads/${file.filename}`;
        uploadedAttachments.push(fileUrl);

        const text = await extractTextFromFile(file);
        extractedTextContent += text;
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
    
    // Log con IP Trucada
    try {
      if (createAuditLog) {
        const userIp = getCleanIp(req);
        await createAuditLog(
          authorId, 
          'MATERIAL_CREATED', 
          { details: `Material creado: ${title}` }, 
          newMaterial.id,
          userIp
        );
      }
    } catch (logError) {
      console.warn("No se pudo guardar el log:", logError.message);
    }

    res.status(201).json(newMaterial);

  } catch (error) {
    console.error("Error en createMaterial:", error);
    res.status(500).json({ message: "Error interno: " + error.message });
  }
};

/**
 * OBTENER TODOS
 */
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

/**
 * OBTENER POR ID
 */
export const getMaterialById = async (req, res) => {
  try {
    const { id } = req.params;
    const material = await prisma.material.findUnique({
      where: { id: id },
      include: { author: { select: { name: true, email: true } } }
    });
    if (!material) return res.status(404).json({ message: "Material no encontrado." });
    res.status(200).json(material);
  } catch (error) {
    res.status(500).json({ message: "Error interno." });
  }
};

/**
 * ACTUALIZAR
 */
export const updateMaterial = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;
    const userId = req.user.userId;
    const userRole = req.user.role;
    
    const material = await prisma.material.findUnique({ where: { id } });
    if (!material) return res.status(404).json({ message: "Material no encontrado." });
    
    if (material.authorId !== userId && userRole !== 'ADMIN') {
        return res.status(403).json({ message: "No tienes permisos." });
    }

    const updatedMaterial = await prisma.material.update({
      where: { id: id },
      data: { title, content } 
    });
    
    try {
        if (createAuditLog) {
            const userIp = getCleanIp(req);
            await createAuditLog(userId, 'MATERIAL_UPDATED', { details: `Material actualizado: ${title}` }, id, userIp);
        }
    } catch (e) {}

    res.status(200).json(updatedMaterial);
  } catch (error) {
    res.status(500).json({ message: "Error interno." });
  }
};

/**
 * ELIMINAR
 */
export const deleteMaterial = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const userRole = req.user.role;

    const material = await prisma.material.findUnique({ where: { id } });

    if (!material) return res.status(404).json({ message: "Material no encontrado." });

    if (material.authorId !== userId && userRole !== 'ADMIN') {
      return res.status(403).json({ message: "No tienes permiso para eliminar este material." });
    }

    await prisma.material.delete({ where: { id } });

    try {
        if (createAuditLog) {
            const userIp = getCleanIp(req);
            await createAuditLog(userId, 'MATERIAL_DELETED', { details: `Material eliminado: ${material.title}` }, id, userIp);
        }
    } catch (e) {}

    res.status(204).send(); 
  } catch (error) {
    console.error("Error al eliminar material:", error);
    res.status(500).json({ message: "Error interno." });
  }
};