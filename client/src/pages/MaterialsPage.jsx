import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

// --- ICONOS SVG (Tamaño fijo 20px para que no se deformen) ---
const IconPlus = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>;
const IconEye = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>;
const IconUser = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;

export default function MaterialsPage() {
  const [materials, setMaterials] = useState([]);
  const { user } = useAuth();
  const isTeacher = user.role === 'DOCENTE' || user.role === 'ADMIN';

  useEffect(() => {
    api.get('/materials').then(res => setMaterials(res.data)).catch(console.error);
  }, []);

  return (
    <div className="dashboard-content">
      {/* CABECERA */}
      <div style={{
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '2rem',
        background: 'rgba(255,255,255,0.05)', // Fondo sutil para separar cabecera
        padding: '1.5rem',
        borderRadius: '12px'
      }}>
        <div>
           <h1 style={{margin: 0, fontSize: '1.8rem'}}>Materiales de Estudio</h1>
           <p style={{margin: '5px 0 0 0', color: 'var(--text-gray)'}}>Recursos compartidos por tus docentes.</p>
        </div>
        {isTeacher && (
          <Link to="/dashboard/materials/new" className="btn-primary" style={{display:'flex', alignItems:'center', gap:'8px', padding:'10px 20px', textDecoration:'none', height: 'fit-content'}}>
            <IconPlus /> <span>Subir Material</span>
          </Link>
        )}
      </div>

      {/* GRID DE TARJETAS (Más compacto) */}
      <div style={{
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
        gap: '20px'
      }}>
        {materials.length === 0 ? (
          <p style={{color:'gray', gridColumn:'1/-1', textAlign:'center', padding:'2rem'}}>No hay materiales disponibles.</p>
        ) : (
          materials.map(m => (
            <div key={m.id} className="feature-card" style={{
              display:'flex', 
              flexDirection:'column', 
              padding: '1.5rem',
              background: '#1e293b', // Color oscuro sólido para que se lea bien
              borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.05)'
            }}>
              
              <h3 style={{fontSize:'1.1rem', marginBottom:'0.5rem', color:'white', fontWeight:'bold'}}>{m.title}</h3>
              
              <div style={{display:'flex', alignItems:'center', gap:'6px', color:'#94a3b8', fontSize:'0.85rem', marginBottom:'1rem'}}>
                <IconUser /> <span>{m.author?.name || 'Docente'}</span>
              </div>

              <p style={{
                fontSize:'0.9rem', 
                color:'#cbd5e1', 
                marginBottom:'1.5rem', 
                flex: 1, 
                lineHeight: '1.5',
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }}>
                 {m.content || 'Sin descripción.'}
              </p>
              
              {/* BOTÓN MÁS DELGADO Y ELEGANTE */}
              <Link 
                to={`/dashboard/materials/${m.id}`} 
                style={{
                  marginTop: 'auto',
                  width:'100%', 
                  display:'flex', 
                  justifyContent:'center', 
                  alignItems:'center', 
                  gap:'8px',
                  padding: '10px', // Menos padding vertical
                  borderRadius: '8px',
                  background: 'transparent',
                  border: '1px solid var(--accent)',
                  color: 'var(--accent)',
                  textDecoration: 'none',
                  fontWeight: '600',
                  fontSize: '0.9rem',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => { e.currentTarget.style.background = 'var(--accent)'; e.currentTarget.style.color = '#000'; }}
                onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--accent)'; }}
              >
                <IconEye /> Ver Detalles
              </Link>
            </div>
          ))
        )}
      </div>
    </div>
  );
}