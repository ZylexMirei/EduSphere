import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import BackButton from '../components/BackButton';
import { useAuth } from '../context/AuthContext'; // Importamos Auth para saber si es docente

// Iconos
const IconFile = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path><polyline points="13 2 13 9 20 9"></polyline></svg>;
const IconTrash = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>;

export default function MaterialDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth(); // Obtenemos el usuario actual
  
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

  // --- FUNCIÓN PARA ELIMINAR ---
  const handleDelete = async () => {
    if (!window.confirm("¿Estás seguro de eliminar este material? Esta acción no se puede deshacer.")) return;

    try {
      await api.delete(`/materials/${id}`);
      alert("Material eliminado correctamente.");
      navigate('/dashboard/materials');
    } catch (error) {
      alert("Error al eliminar (quizás no eres el autor).");
    }
  };

  if (loading) return <p style={{padding:'2rem', color:'white'}}>Cargando...</p>;
  if (!material) return <p style={{padding:'2rem', color:'red'}}>No encontrado.</p>;

  // Verificar si puede borrar (Es Admin o es el Dueño del material)
  const canDelete = user.role === 'ADMIN' || user.id === material.authorId;

  return (
    <div className="dashboard-content">
      <BackButton to="/dashboard/materials" />
      
      <div className="activity-section" style={{position: 'relative'}}>
        
        {/* CABECERA */}
        <div className="dashboard-header" style={{borderBottom:'1px solid rgba(255,255,255,0.1)', paddingBottom:'1rem', marginBottom:'1rem'}}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start'}}>
             <div>
                <h1 style={{fontSize: '2rem', color: 'white', marginBottom: '0.5rem'}}>{material.title}</h1>
                <p style={{color: 'var(--text-gray)', fontSize: '0.9rem'}}>
                  Publicado por: <span style={{color: 'var(--accent)'}}>{material.author?.name || 'Desconocido'}</span>
                </p>
             </div>
             
             {/* BOTÓN DE ELIMINAR (Solo si corresponde) */}
             {canDelete && (
               <button 
                 onClick={handleDelete}
                 className="btn-badge"
                 style={{background: 'rgba(239, 68, 68, 0.2)', color: '#f87171', border: '1px solid #f87171', cursor: 'pointer', display:'flex', gap:'5px', padding:'10px 15px'}}
               >
                 <IconTrash /> Eliminar Material
               </button>
             )}
          </div>
        </div>

        {/* CONTENIDO TEXTO */}
        <div style={{marginBottom: '2rem', lineHeight: '1.8', color: 'var(--text-white)', whiteSpace: 'pre-wrap', fontSize: '1rem', background:'rgba(0,0,0,0.2)', padding:'1.5rem', borderRadius:'12px'}}>
          {material.content || "Sin descripción detallada."}
        </div>

        {/* ARCHIVOS ADJUNTOS (AQUÍ ES DONDE ENTRAS AL DOCUMENTO) */}
        {material.attachments && material.attachments.length > 0 && (
          <div>
            <h3 style={{color: 'var(--accent)', marginBottom: '1rem'}}>📂 Archivos para Descargar/Ver</h3>
            <div className="features-grid" style={{gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))'}}>
              {material.attachments.map((url, index) => (
                <a 
                  key={index} 
                  href={url} 
                  target="_blank"        // <--- ESTO ABRE EN OTRA PESTAÑA
                  rel="noopener noreferrer"
                  className="feature-card"
                  style={{display: 'flex', alignItems: 'center', gap: '15px', padding: '1rem', textDecoration: 'none', transition: 'transform 0.2s', cursor:'pointer'}}
                >
                  <div style={{color: 'var(--accent)', background: 'rgba(6, 182, 212, 0.1)', padding: '10px', borderRadius: '8px'}}><IconFile /></div>
                  <div style={{overflow: 'hidden'}}>
                    <p style={{margin: 0, fontWeight: 'bold', color: 'white', fontSize: '0.9rem'}}>Documento {index + 1}</p>
                    <p style={{margin: 0, color: '#4ade80', fontSize: '0.8rem', textDecoration:'underline'}}>Clic para abrir</p>
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