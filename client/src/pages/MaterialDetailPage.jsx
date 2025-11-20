import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import BackButton from '../components/BackButton';

// Icono SVG
const IconFile = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>;

export default function MaterialDetailPage() {
  const { id } = useParams();
  const [material, setMaterial] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMaterial = async () => {
      try {
        const res = await api.get(`/materials/${id}`);
        setMaterial(res.data);
      } catch (error) {
        console.error("Error cargando material:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMaterial();
  }, [id]);

  if (loading) return <div style={{padding: '2rem', color: 'var(--text-gray)', textAlign: 'center'}}>Cargando...</div>;
  if (!material) return <div style={{padding: '2rem', color: '#ef4444', textAlign: 'center'}}>Material no encontrado</div>;

  return (
    <div className="dashboard-content">
      <BackButton to="/dashboard/materials" />
      
      <div className="activity-section">
        <div className="dashboard-header">
          <h1 style={{fontSize: '2rem', color: 'white', marginBottom: '0.5rem'}}>{material.title}</h1>
          <p style={{color: 'var(--text-gray)', fontSize: '0.9rem'}}>
            Publicado por: <span style={{color: 'var(--accent)'}}>{material.author?.name}</span> • {new Date(material.createdAt).toLocaleDateString()}
          </p>
        </div>

        <div style={{marginBottom: '2rem', lineHeight: '1.8', color: 'var(--text-white)', whiteSpace: 'pre-wrap', fontSize: '1rem'}}>
          {material.content || "Sin descripción detallada."}
        </div>

        {material.attachments && material.attachments.length > 0 && (
          <div>
            <h3 style={{color: 'var(--accent)', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem'}}>📂 Archivos Adjuntos</h3>
            <div className="features-grid" style={{gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))'}}>
              {material.attachments.map((url, index) => (
                <a 
                  key={index} 
                  href={url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="feature-card"
                  style={{display: 'flex', alignItems: 'center', gap: '15px', padding: '1rem', textDecoration: 'none', transition: 'transform 0.2s'}}
                >
                  <div style={{color: 'var(--accent)', background: 'rgba(6, 182, 212, 0.1)', padding: '10px', borderRadius: '8px'}}><IconFile /></div>
                  <div style={{overflow: 'hidden'}}>
                    <p style={{margin: 0, fontWeight: 'bold', color: 'white', fontSize: '0.9rem'}}>Archivo {index + 1}</p>
                    <p style={{margin: 0, color: 'var(--text-gray)', fontSize: '0.8rem'}}>Clic para descargar</p>
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