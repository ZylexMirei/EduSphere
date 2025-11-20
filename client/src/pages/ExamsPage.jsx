import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

// --- ICONOS SVG PROFESIONALES ---
const IconPlus = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>;
const IconLock = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>;
const IconGlobe = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const IconInbox = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>;
const IconClipboard = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>;
const IconPencil = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>;
const IconPen = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>;

export default function ExamsPage() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  
  const isTeacher = user.role === 'DOCENTE' || user.role === 'ADMIN';

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const res = await api.get('/exams');
        setExams(res.data);
      } catch (error) {
        console.error("Error al cargar exámenes:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchExams();
  }, []);

  if (loading) {
    return <p style={{ color: 'var(--text-gray)', padding: '2rem', textAlign: 'center' }}>Cargando exámenes...</p>;
  }

  return (
    <div className="dashboard-content">
      {/* --- CABECERA --- */}
      <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1>Exámenes Virtuales</h1>
          <p>Gestión y evaluación académica.</p>
        </div>
        
        {isTeacher && (
          <Link to="/dashboard/exams/new" className="btn-primary" style={{ fontSize: '0.9rem', padding: '0.6rem 1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <IconPlus /> Crear Examen
          </Link>
        )}
      </div>

      {/* --- LISTA DE EXÁMENES --- */}
      <div className="features-grid">
        {exams.length === 0 ? (
          <p style={{ color: 'var(--text-gray)', gridColumn: '1 / -1', textAlign: 'center' }}>No hay exámenes disponibles.</p>
        ) : (
          exams.map(exam => (
            <div key={exam.id} className="feature-card" style={{ position: 'relative' }}>
              
              <h3 style={{ marginBottom: '0.5rem' }}>{exam.title}</h3>
              <p style={{ color: 'var(--text-gray)', fontSize: '0.9rem', marginBottom: '1rem' }}>
                Autor: {exam.author?.name || 'Desconocido'}
              </p>
              
              {isTeacher && (
                <div style={{ marginBottom: '1.2rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 'bold', color: exam.assignedTo && exam.assignedTo.length > 0 ? '#fbbf24' : '#4ade80', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {exam.assignedTo && exam.assignedTo.length > 0 
                      ? <><IconLock /> Asignado a {exam.assignedTo.length} estudiante(s)</> 
                      : <><IconGlobe /> Público (Todos)</>}
                  </div>
                  
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-gray)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <IconInbox /> {exam._count?.submissions || 0} entregas recibidas
                  </div>
                </div>
              )}

              <div style={{ marginTop: 'auto', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {isTeacher ? (
                  <>
                    <Link 
                      to={`/dashboard/exams/${exam.id}/submissions`} 
                      className="btn-badge btn-badge-green" 
                      style={{ textDecoration: 'none', flex: 1, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}
                    >
                      <IconClipboard /> Notas
                    </Link>

                    <Link 
                      to={`/dashboard/exams/${exam.id}/edit`} 
                      className="btn-badge btn-badge-orange" 
                      style={{ textDecoration: 'none', flex: 1, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}
                    >
                      <IconPencil /> Editar
                    </Link>
                  </>
                ) : (
                  <Link 
                    to={`/dashboard/exams/${exam.id}/take`} 
                    className="btn-badge btn-badge-blue" 
                    style={{ textDecoration: 'none', width: '100%', textAlign: 'center', padding: '0.6rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}
                  >
                    <IconPen /> Realizar Examen
                  </Link>
                )}
              </div>

            </div>
          ))
        )}
      </div>
    </div>
  );
}