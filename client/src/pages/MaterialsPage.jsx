import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom'; // <--- IMPORTANTE
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

// Iconos
const IconPlus = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;
const IconEye = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>;

export default function MaterialsPage() {
  const [materials, setMaterials] = useState([]);
  const { user } = useAuth();
  const isTeacher = user.role === 'DOCENTE' || user.role === 'ADMIN';

  useEffect(() => {
    api.get('/materials').then(res => setMaterials(res.data)).catch(console.error);
  }, []);

  return (
    <div className="dashboard-content">
      <div className="dashboard-header" style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
        <div>
           <h1>Materiales de Estudio</h1>
           <p>Recursos compartidos por tus docentes.</p>
        </div>
        {isTeacher && (
          <Link to="/dashboard/materials/new" className="btn-primary" style={{display:'flex', alignItems:'center', gap:'8px'}}>
            <IconPlus /> Subir Nuevo
          </Link>
        )}
      </div>

      <div className="features-grid">
        {materials.length === 0 ? <p style={{color:'gray'}}>No hay materiales aún.</p> : materials.map(m => (
          <div key={m.id} className="feature-card">
            <h3>{m.title}</h3>
            <p style={{fontSize:'0.9rem', color:'gray', marginBottom:'1rem'}}>
              Por: {m.author?.name || 'Anónimo'}
            </p>
            <p style={{fontSize:'0.9rem', color:'white', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', marginBottom:'1.5rem'}}>
               {m.content ? m.content.substring(0, 50) + '...' : 'Sin descripción'}
            </p>
            
            {/* ESTE BOTÓN ES EL QUE TE LLEVA AL DETALLE */}
            <Link 
              to={`/dashboard/materials/${m.id}`} 
              className="btn-outline" 
              style={{width:'100%', textAlign:'center', display:'flex', justifyContent:'center', alignItems:'center', gap:'8px'}}
            >
              <IconEye /> Ver Detalles y Archivos
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}