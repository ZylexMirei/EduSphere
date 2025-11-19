import jwt from 'jsonwebtoken';
import 'dotenv/config';

export const authenticateToken = (req, res, next) => {
  // Busca el token en el header 'Authorization'
  const authHeader = req.headers['authorization'];
  // El formato es "Bearer TOKEN_LARGO"
  const token = authHeader && authHeader.split(' ')[1]; 

  if (token == null) {
    // 401 Unauthorized (No hay token)
    return res.status(401).json({ message: 'No estás autorizado. Token no proporcionado.' });
  }

  // Verifica el token usando el secreto
  jwt.verify(token, process.env.JWT_SECRET, (err, userPayload) => {
    if (err) {
      // 403 Forbidden (El token no es válido o expiró)
      return res.status(403).json({ message: 'Token inválido o expirado.' });
    }
    req.user = userPayload; 
    
    // Pasa a la siguiente función o middleware
    next(); 
  });
};


export const authorizeRole = (allowedRoles) => {
  // Devuelve la función middleware real
  return (req, res, next) => {
    
    // Si 'allowedRoles' no es un array, lo convierte en uno
    if (typeof allowedRoles === 'string') {
      allowedRoles = [allowedRoles];
    }

    // req.user fue añadido por el middleware authenticateToken
    const userRole = req.user.role; 

    if (!allowedRoles.includes(userRole)) {
      // 403 Forbidden (El rol del usuario no está en la lista de permitidos)
      return res.status(403).json({ 
        message: 'No tienes permisos suficientes para realizar esta acción.' 
      });
    }

    // ¡Éxito! El usuario tiene el rol correcto.
    next();
  };
};

