import multer from 'multer';
import path from 'path';
import fs from 'fs';

// 1. Configuración de almacenamiento
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Usamos process.cwd() para ir a la raíz del servidor
    const uploadPath = path.join(process.cwd(), 'uploads');
    
    // ¡MAGIA! Si la carpeta no existe, la crea automáticamente
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
      console.log("Carpeta 'uploads' creada en:", uploadPath);
    }
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Nombre único para evitar conflictos
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    // Limpiamos el nombre original de caracteres raros
    const cleanName = file.originalname.replace(/[^a-zA-Z0-9.]/g, "_");
    cb(null, uniqueSuffix + '-' + cleanName);
  }
});

// 2. Exportamos 'upload'
export const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});