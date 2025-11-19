import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

// --- Iconos ---
const IconBookOpen = () => ( 
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="28" height="28" style={{ display: 'inline-block', marginRight: '10px' }}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18c-2.305 0-4.408.867-6 2.292m0-14.25v14.25" />
  </svg> 
);
const IconDocument = () => ( 
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="feature-icon">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m.75 12l3 3m0 0l3-3m-3 3v-6m-1.5-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
  </svg> 
);
// ¡ESTE ES EL ICONO QUE FALTABA!
const IconPlus = () => ( 
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: '20px', height: '20px', marginRight: '5px' }}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
  </svg> 
);

export default function MaterialsPage() {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const { user } = useAuth(); // Obtenemos el usuario para saber si es profe
  const isTeacher = user?.role === 'DOCENTE' || user?.role === 'ADMIN';

  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        setLoading(true);
        const response = await api.get('/materials');
        setMaterials(response.data);
      } catch (err) {
        setError('Error al cargar los materiales.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchMaterials();
  }, []); 

  if (loading) return <div style={{ textAlign: 'center', color: 'var(--text-gray)', padding: '2rem' }}>Cargando materiales...</div>;
  if (error) return <div style={{ textAlign: 'center', color: '#fca5a5', padding: '2rem' }}>{error}</div>;

  return (
    <div className="dashboard-content">
      
      {/* CABECERA CON BOTÓN (Aquí estaba el cambio clave) */}
      <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1>
            <IconBookOpen />
            Biblioteca de Materiales
          </h1>
          <p>Explora todos los recursos de estudio disponibles.</p>
        </div>
        
        {/* --- BOTÓN SOLO PARA DOCENTES --- */}
        {isTeacher && (
          <Link 
            to="/dashboard/materials/new" 
            className="btn-primary" 
            style={{ display: 'flex', alignItems: 'center', padding: '0.8rem 1.5rem', fontSize: '1rem' }}
          >
            <IconPlus /> Crear Material
          </Link>
        )}
      </div>

      {/* Grid de Tarjetas */}
      <div className="features-grid">
        {materials.length === 0 ? (
          <p style={{ color: 'var(--text-gray)' }}>Aún no hay materiales disponibles.</p>
        ) : (
          materials.map((material) => (
            <div key={material.id} className="feature-card">
              <div className="feature-icon">
                <IconDocument />
              </div>
              <h3>{material.title}</h3>
              <p>
                {material.content ? material.content.substring(0, 100) + '...' : 'Sin descripción.'}
              </p>
              
              {/* Mostrar si tiene adjuntos */}
              {material.attachments && material.attachments.length > 0 && (
                 <div style={{ margin: '10px 0', fontSize: '0.8rem', color: 'var(--accent)' }}>
                    📎 {material.attachments.length} archivo(s) adjunto(s)
                 </div>
              )}

              <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {/* Por ahora el botón solo es visual, luego haremos la vista de detalle */}
                <button className="btn-outline" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
                  Ver Detalles
                </button>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-gray)' }}>
                  Por: {material.author?.name || 'Autor Desconocido'}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}