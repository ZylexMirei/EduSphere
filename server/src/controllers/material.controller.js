import prisma from '../prismaClient.js';
import { createAuditLog } from '../services/audit.service.js';

/**
 * Crea un nuevo material (Guardado localmente)
 */
export const createMaterial = async (req, res) => {
  console.log("--- INICIO DE CREATE MATERIAL ---");
  console.log("Headers:", req.headers['content-type']); // Debería decir multipart/form-data...
  
  try {
    // 1. Verificar Usuario
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ message: "Usuario no autenticado." });
    }
    const authorId = req.user.userId;

    // 2. Verificar Body (Aquí es donde fallaba)
    // Si multer funciona, req.body ya debería tener los datos de texto
    console.log("Body Recibido:", req.body); 
    
    const { title, content } = req.body;

    if (!title) {
      console.error("ERROR: Título no encontrado en req.body");
      return res.status(400).json({ message: "El título es obligatorio. (Asegúrate de enviarlo en el form-data)" });
    }

    // 3. Procesar Archivos
    const uploadedAttachments = []; 
    if (req.files && req.files.length > 0) {
      console.log(`Procesando ${req.files.length} archivos...`);
      for (const file of req.files) {
        // IMPORTANTE: Asegúrate de que este puerto (3001) sea el correcto
        const fileUrl = `http://localhost:3001/uploads/${file.filename}`;
        uploadedAttachments.push(fileUrl);
      }
    } else {
      console.log("No se recibieron archivos.");
    }

    // 4. Guardar en Base de Datos
    const newMaterial = await prisma.material.create({
      data: {
        title: title,
        content: content || "", 
        attachments: uploadedAttachments, 
        authorId: authorId,
      }
    });
    
    // 5. Historial
    try {
      if (createAuditLog) {
        await createAuditLog(
          authorId, 
          'MATERIAL_CREATED', 
          { details: `Material creado: ${title}` }, 
          newMaterial.id,
          req.ip
        );
      }
    } catch (logError) {
      console.warn("No se pudo guardar el log:", logError.message);
    }

    console.log("--- ÉXITO: Material creado ---");
    res.status(201).json(newMaterial);

  } catch (error) {
    console.error("🔴🔴🔴 ¡CRASH EN EL CONTROLADOR! 🔴🔴🔴");
    console.error(error);
    res.status(500).json({ message: "Error interno del servidor: " + error.message });
  }
};

// ... (Mantén el resto de funciones: getAllMaterials, getMaterialById, etc.)
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
    if (!material) return res.status(404).json({ message: "Material no encontrado." });
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
    if (!material) return res.status(404).json({ message: "Material no encontrado." });
    if (material.authorId !== userId && userRole !== 'ADMIN') return res.status(403).json({ message: "No tienes permisos." });

    const updatedMaterial = await prisma.material.update({
      where: { id: id },
      data: { title, content } 
    });
    if (createAuditLog) await createAuditLog(userId, 'MATERIAL_UPDATED', { details: `Material actualizado: ${title}` }, id, req.ip);
    res.status(200).json(updatedMaterial);
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
    if (!material) return res.status(404).json({ message: "Material no encontrado." });
    if (material.authorId !== userId && userRole !== 'ADMIN') return res.status(403).json({ message: "No tienes permisos." });

    await prisma.material.delete({ where: { id: id } });
    if (createAuditLog) await createAuditLog(userId, 'MATERIAL_DELETED', { details: `Material eliminado: ${material.title}` }, id, req.ip);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: "Error interno." });
  }
};