// client/src/pages/StudentGradesPage.jsx
import React, { useEffect, useState } from 'react';
import api from '../services/api';

export default function StudentGradesPage() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/submissions/my-results')
      .then(res => setSubmissions(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p style={{color:'white', padding:'2rem'}}>Cargando mis notas...</p>;

  return (
    <div className="dashboard-content">
      <div className="dashboard-header">
        <h1>Mis Calificaciones</h1>
        <p>Historial de tus exámenes y retroalimentación.</p>
      </div>

      <div className="features-grid">
        {submissions.length === 0 && <p style={{color:'gray'}}>No has realizado exámenes aún.</p>}
        
        {submissions.map(sub => (
          <div key={sub.id} className="feature-card" style={{borderLeft: sub.grade >= 51 ? '4px solid #4ade80' : '4px solid #fbbf24'}}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'start'}}>
              <h3 style={{margin:0}}>{sub.exam.title}</h3>
              <span style={{fontSize:'1.5rem', fontWeight:'bold', color: sub.grade ? 'white' : 'gray'}}>
                {sub.grade !== null ? sub.grade : '--'}
              </span>
            </div>
            
            <p style={{fontSize:'0.8rem', color:'var(--text-gray)', marginBottom:'1rem'}}>
              Entregado: {new Date(sub.submittedAt).toLocaleDateString()}
            </p>

            {sub.feedback ? (
              <div style={{background:'rgba(255,255,255,0.05)', padding:'10px', borderRadius:'8px', fontSize:'0.9rem'}}>
                <strong style={{color:'var(--accent)'}}>Feedback:</strong>
                <p style={{marginTop:'5px', color:'#e2e8f0'}}>{sub.feedback}</p>
              </div>
            ) : (
              <p style={{fontSize:'0.8rem', fontStyle:'italic', color:'gray'}}>
                {sub.grade !== null ? "Sin comentarios." : "Esperando calificación del docente..."}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
