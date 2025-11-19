import React from 'react';
import { useOutletContext } from 'react-router-dom'; // <--- USA ESTO

// --- ICONOS SVG ---
const IconCourses = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="24" height="24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18c-2.305 0-4.408.867-6 2.292m0-14.25v14.25" /></svg>;
const IconTasks = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="24" height="24"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></svg>;
const IconTrophy = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="24" height="24"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0V5.625a2.25 2.25 0 11-4.5 0v3.375M12 11.25c7.021 0 10.587-5 10.587-5 .754 0 1.163.813.623 1.235-.473.37-1.732.986-2.582 1.058-1.94.164-3.378-1.09-2.632-3.368.746-2.276-1.622-4.314-4.003-3.445a19.082 19.082 0 00-1.997.896c-1.774.94-1.774 2.564 0 3.504.666.353 1.333.657 1.997.896 2.381.869 4.749-1.169 4.003-3.445-.746-2.278-2.184-3.532-2.632-3.368-.85.072-2.109-.688-2.582-1.058-.54-.422-.131-1.235.623-1.235 0 0 3.566 5 10.587 5z" /></svg>;
const IconCheck = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" width="20" height="20"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>;
// ------------------------------

export default function DashboardHome() {
  const { user } = useOutletContext(); // <-- Lee del Padre

  return (
    <div className="dashboard-content">
      <div className="dashboard-header">
        <h1>
          Hola, <span className="highlight-text">{user?.name || 'Estudiante'}</span>
        </h1>
        <p>Resumen de tu actividad reciente.</p>
      </div>
      
      <div className="stats-grid">
        {/* ... (Tarjeta 1) ... */}
        <div className="stat-card stat-blue">
          <div className="stat-header">
            <h3>Cursos Activos</h3>
            <div className="stat-icon"><IconCourses /></div>
          </div>
          <p className="stat-value">4</p>
        </div>
        {/* ... (Tarjeta 2) ... */}
        <div className="stat-card stat-cyan">
          <div className="stat-header">
            <h3>Pendientes</h3>
            <div className="stat-icon"><IconTasks /></div>
          </div>
          <p className="stat-value">2</p>
        </div>
        {/* ... (Tarjeta 3) ... */}
        <div className="stat-card stat-purple">
          <div className="stat-header">
            <h3>Promedio</h3>
            <div className="stat-icon"><IconTrophy /></div>
          </div>
          <p className="stat-value">92</p>
        </div>
      </div>
      
      <div className="activity-section">
        <h3>Actividad Reciente</h3>
        <div className="activity-item">
          <div className="activity-icon icon-green"><IconCheck /></div>
          <div>
            <p className="activity-title">Completaste el examen de Física</p>
            <p className="activity-time">Hace 2 horas</p>
          </div>
        </div>
        <div className="activity-item">
          <div className="activity-icon icon-blue"><IconCourses /></div>
          <div>
            <p className="activity-title">Nuevo material: Matemáticas Avanzadas</p>
            <p className="activity-time">Ayer</p>
          </div>
        </div>
      </div>
    </div>
  );
}