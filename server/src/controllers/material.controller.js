import prisma from '../prismaClient.js';
import { createAuditLog } from '../services/audit.service.js';
import fs from 'fs';       // Para leer archivos del sistema
import pdf from 'pdf-parse'; // Para leer PDFs
import mammoth from 'mammoth'; // Para leer Words (.docx)

// --- 1. HELPER: Obtener IP Limpia (Adiós al ::1 feo) ---
const getCleanIp = (req) => {
  let ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip || 'Unknown';
  
  // Si es Localhost IPv6, lo mostramos bonito como IPv4
  if (ip === '::1') return '127.0.0.1';
  
  // Si viene con prefijo raro de Windows (::ffff:), lo quitamos
  if (ip.includes('::ffff:')) return ip.split('::ffff:')[1];
  
  return ip;
};

// --- 2. HELPER: Extraer Texto para la IA ---
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
    return ''; // Si es imagen u otro, no extraemos texto
  } catch (error) {
    console.error(`Error leyendo archivo ${file.originalname}:`, error);
    return '';
  }
};

/**
 * CREAR MATERIAL (Con lectura de IA y Log de IP)
 */
export const createMaterial = async (req, res) => {
  console.log("--- INICIO DE CREATE MATERIAL ---");
  
  try {
    // 1. Validar Usuario
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ message: "Usuario no autenticado." });
    }
    const authorId = req.user.userId;
    const { title, content } = req.body; // 'content' es la descripción manual

    if (!title) {
      return res.status(400).json({ message: "El título es obligatorio." });
    }

    // 2. Procesar Archivos
    const uploadedAttachments = [];
    let extractedTextContent = ""; // Aquí guardamos lo que la IA leerá

    if (req.files && req.files.length > 0) {
      const protocol = req.protocol;
      const host = req.get('host'); 
      
      for (const file of req.files) {
        // A. Generar URL para descarga
        const fileUrl = `${protocol}://${host}/uploads/${file.filename}`;
        uploadedAttachments.push(fileUrl);

        // B. Extraer texto para la IA
        const text = await extractTextFromFile(file);
        extractedTextContent += text;
      }
    }

    // 3. Combinar descripción manual + texto de archivos
    const finalContentForAI = (content || "") + "\n" + extractedTextContent;

    // 4. Guardar en Base de Datos
    const newMaterial = await prisma.material.create({
      data: {
        title: title,
        content: finalContentForAI, // Guardamos TODO el texto
        attachments: uploadedAttachments, 
        authorId: authorId,
      }
    });
    
    // 5. Historial con IP Limpia
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
 * OBTENER TODOS LOS MATERIALES
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
 * OBTENER UN MATERIAL POR ID
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
 * ACTUALIZAR MATERIAL
 */
export const updateMaterial = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;
    const userId = req.user.userId;
    const userRole = req.user.role;
    
    const material = await prisma.material.findUnique({ where: { id } });
    if (!material) return res.status(404).json({ message: "Material no encontrado." });
    
    // Validar permisos
    if (material.authorId !== userId && userRole !== 'ADMIN') {
        return res.status(403).json({ message: "No tienes permisos." });
    }

    const updatedMaterial = await prisma.material.update({
      where: { id: id },
      data: { title, content } 
    });
    
    // Log con IP Limpia
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
 * ELIMINAR MATERIAL
 */
export const deleteMaterial = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const userRole = req.user.role;

    // 1. Buscar el material
    const material = await prisma.material.findUnique({ where: { id } });

    if (!material) return res.status(404).json({ message: "Material no encontrado." });

    // 2. Verificar permisos (Solo el autor o un Admin pueden borrar)
    if (material.authorId !== userId && userRole !== 'ADMIN') {
      return res.status(403).json({ message: "No tienes permiso para eliminar este material." });
    }

    // 3. Eliminar de la base de datos
    await prisma.material.delete({ where: { id } });

    // Log con IP Limpia
    try {
        if (createAuditLog) {
            const userIp = getCleanIp(req);
            await createAuditLog(userId, 'MATERIAL_DELETED', { details: `Material eliminado: ${material.title}` }, id, userIp);
        }
    } catch (e) {}

    res.status(204).send(); // Éxito sin contenido
  } catch (error) {
    console.error("Error al eliminar material:", error);
    res.status(500).json({ message: "Error interno." });
  }
};