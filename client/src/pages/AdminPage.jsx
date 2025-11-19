import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';
ChartJS.register(ArcElement, Tooltip, Legend);

// --- Iconos ---
const IconUsers = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>;
const IconTeacher = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle></svg>;
const IconBook = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>;
// --------------

export default function AdminPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const statsRes = await api.get('/admin/stats/site');
        setStats(statsRes.data);
      } catch (err) {
        setError('No se pudieron cargar las estadísticas.');
      } finally {
        setLoading(false);
      }
    };
    fetchData(); 
  }, []);

  // --- Lógica de la Gráfica de Torta ---
  const getChartData = () => {
    if (!stats) return null; 

    const data = {
      labels: ['Admins', 'Docentes', 'Estudiantes'],
      datasets: [
        {
          label: 'Usuarios',
          // Hack: Admin count = Total - (Docentes + Estudiantes)
          data: [ 
            (stats.students + stats.teachers) > 0 ? (stats.students + stats.teachers - stats.students - stats.teachers) : 1, // Asumimos 1 admin si no hay otros datos
            stats.teachers, 
            stats.students 
          ], 
          backgroundColor: [
            'rgba(239, 68, 68, 0.7)',  // Rojo (Admin)
            'rgba(59, 130, 246, 0.7)', // Azul (Docente)
            'rgba(6, 182, 212, 0.7)',   // Turquesa (Estudiante)
          ],
          borderColor: ['#ef4444', '#3B82F6', '#06B6D4'],
          borderWidth: 1,
        },
      ],
    };
    return data;
  };

  if (loading) return <p style={{color: 'var(--text-gray)'}}>Cargando estadísticas...</p>;
  if (error) return <p style={{ color: '#fca5a5' }}>{error}</p>;

  return (
    <div className="dashboard-content">
      <div className="dashboard-header">
        <h1>Inicio de Administración</h1>
        <p>Resumen global de la plataforma EduSphere.</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card stat-blue">
          <div className="stat-header"><h3>Estudiantes</h3><div className="stat-icon"><IconUsers /></div></div>
          <p className="stat-value">{stats?.students ?? 0}</p>
        </div>
        <div className="stat-card stat-cyan">
          <div className="stat-header"><h3>Docentes</h3><div className="stat-icon"><IconTeacher /></div></div>
          <p className="stat-value">{stats?.teachers ?? 0}</p>
        </div>
        <div className="stat-card stat-purple">
          <div className="stat-header"><h3>Materiales</h3><div className="stat-icon"><IconBook /></div></div>
          <p className="stat-value">{stats?.materials ?? 0}</p>
        </div>
      </div>
      
      {/* --- SECCIÓN DE GRÁFICA --- */}
      <div className="activity-section" style={{marginTop: '1.5rem'}}>
        <h3>Distribución de Usuarios</h3>
        <div className="chart-container">
          {getChartData() ? (
            <Pie 
              data={getChartData()}
              options={{
                responsive: true,
                maintainAspectRatio: true,
                plugins: { legend: { position: 'top', labels: { color: 'var(--text-gray)' } } }
              }}
            />
          ) : <p>No hay datos para la gráfica.</p> }
        </div>
      </div>
    </div>
  );
}