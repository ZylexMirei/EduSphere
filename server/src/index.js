import app from './app.js';
import 'dotenv/config'; // Asegura que las variables de .env se carguen

// Definimos el puerto. Lo tomará del .env o usará 3001 por defecto
const PORT = process.env.PORT || 3001;

// Ponemos el servidor a escuchar
app.listen(PORT, () => {
  console.log(`🚀 Servidor de EduSphere corriendo en http://localhost:${PORT}`);
});