import prisma from '../prismaClient.js';

/**
 * Función "WAOOO" para crear un registro en el historial.
 * @param {string} actorId - ID del usuario que hace la acción
 * @param {string} action - Ej: "USER_LOGIN_SUCCESS"
 * @param {object} details - Objeto JSON con detalles
 * @param {string} targetId - ID del objeto afectado (ej. el usuario baneado)
 * @param {string} ipAddress - IP del solicitante
 */
export const createAuditLog = async (actorId, action, details, targetId, ipAddress) => {
  try {
    // Si actorId es null (ej. un registro), no podemos crear la relación
    if (!actorId) {
      console.warn(`AuditLog omitido (actor nulo): ${action}`);
      return;
    }
    
    await prisma.auditLog.create({
      data: {
        action: action,
        details: details || {}, // Asegura que sea un JSON
        actorId: actorId,
        targetId: targetId,
        ipAddress: ipAddress || 'unknown' // Guarda la IP
      }
    });
  } catch (error) {
    // Si la tabla AuditLog no existe o el actorId no existe, solo avisa en consola
    console.warn(`Falló la creación del AuditLog (¿Migraste la BD?): ${error.message}`);
  }
};