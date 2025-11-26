import express from 'express';
import cors from 'cors';
import path from 'path'; 
import { fileURLToPath } from 'url';


import authRoutes from './routes/auth.routes.js';
import materialRoutes from './routes/material.routes.js';
import examRoutes from './routes/exam.routes.js';
import submissionRoutes from './routes/submission.routes.js';
import assistantRoutes from './routes/assistant.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import adminRoutes from './routes/admin.routes.js';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.set('trust proxy', 1);

// Middlewares
app.use(cors());
app.use(express.json());

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
// --------------------------------

// === Rutas de la API ===
app.use('/api/auth', authRoutes);
app.use('/api/materials', materialRoutes);
// ... (el resto de tus rutas)
app.use('/api/exams', examRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/assistant', assistantRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/admin', adminRoutes);

export default app;