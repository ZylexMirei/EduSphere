import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import BackButton from '../components/BackButton';
import { useAuth } from '../context/AuthContext';

// --- ICONOS SVG ---
const IconFile = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
const IconTrash = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;
const IconDownload = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>;

export default function MaterialDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [material, setMaterial] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMaterial = async () => {
      try {
        const res = await api.get(`/materials/${id}`);
        setMaterial(res.data);
      } catch (error) {
        alert("Error al cargar material.");
        navigate('/dashboard/materials');
      } finally {
        setLoading(false);
      }
    };
    fetchMaterial();
  }, [id, navigate]);

  const handleDelete = async () => {
    if (!window.confirm("¿Estás seguro de eliminar este material?")) return;
    try {
      await api.delete(`/materials/${id}`);
      navigate('/dashboard/materials');
    } catch (error) {
      alert("Error al eliminar.");
    }
  };

  if (loading) return <p style={{padding:'2rem', color:'white'}}>Cargando...</p>;
  if (!material) return <p style={{padding:'2rem', color:'red'}}>No encontrado.</p>;

  const canDelete = user.role === 'ADMIN' || user.id === material.authorId;

  return (
    <div className="dashboard-content">
      <BackButton to="/dashboard/materials" />
      
      <div className="activity-section" style={{background: '#1e293b', padding: '2rem', borderRadius: '16px'}}>
        
        {/* CABECERA FLEXIBLE */}
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', borderBottom:'1px solid rgba(255,255,255,0.1)', paddingBottom:'1.5rem', marginBottom:'1.5rem', gap:'1rem'}}>
           <div>
              <h1 style={{fontSize: '2rem', color: 'white', marginBottom: '0.5rem', marginTop:0}}>{material.title}</h1>
              <p style={{color: '#94a3b8', fontSize: '0.9rem', margin:0}}>
                Publicado por: <span style={{color: 'var(--accent)', fontWeight:'bold'}}>{material.author?.name}</span>
              </p>
           </div>
           
           {/* BOTÓN ELIMINAR */}
           {canDelete && (
             <button 
               onClick={handleDelete}
               style={{
                 background: 'rgba(239, 68, 68, 0.15)', 
                 color: '#f87171', 
                 border: '1px solid #ef4444', 
                 cursor: 'pointer', 
                 display:'flex', 
                 alignItems:'center', 
                 gap:'8px', 
                 padding:'8px 16px',
                 fontSize: '0.85rem',
                 fontWeight: '600',
                 borderRadius: '8px',
                 height: 'fit-content',
                 whiteSpace: 'nowrap'
               }}
             >
               <IconTrash /> Eliminar
             </button>
           )}
        </div>

        {/* CONTENIDO */}
        <div style={{marginBottom: '2.5rem', lineHeight: '1.8', color: '#e2e8f0', whiteSpace: 'pre-wrap', fontSize: '1rem', background:'rgba(0,0,0,0.2)', padding:'1.5rem', borderRadius:'8px'}}>
          {material.content || "Sin descripción detallada."}
        </div>

        {/* LISTA DE ARCHIVOS */}
        {material.attachments && material.attachments.length > 0 && (
          <div>
            <h3 style={{color: 'var(--accent)', marginBottom: '1rem', display:'flex', alignItems:'center', gap:'10px'}}>
              📂 Archivos Adjuntos
            </h3>
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '15px'}}>
              {material.attachments.map((url, index) => (
                <a 
                  key={index} 
                  href={url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '12px', 
                    padding: '1rem', 
                    textDecoration: 'none', 
                    background: '#0f172a', // Fondo más oscuro para el archivo
                    border: '1px solid #334155',
                    borderRadius: '10px',
                    transition: 'border-color 0.2s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--accent)'}
                  onMouseOut={(e) => e.currentTarget.style.borderColor = '#334155'}
                >
                  <div style={{
                    color: 'var(--accent)', 
                    background: 'rgba(6, 182, 212, 0.1)', 
                    padding: '10px', 
                    borderRadius: '8px',
                    display: 'flex',
                  }}>
                    <IconFile />
                  </div>
                  <div style={{overflow: 'hidden'}}>
                    <p style={{margin: 0, fontWeight: 'bold', color: 'white', fontSize: '0.9rem'}}>Documento {index + 1}</p>
                    <p style={{margin: '2px 0 0 0', color: '#4ade80', fontSize: '0.75rem', display:'flex', alignItems:'center', gap:'4px'}}>
                       <IconDownload /> Abrir archivo
                    </p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}