import React, { useEffect, useState } from 'react';
import api from '../services/api';

// Icono
const IconChart = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"></path><path d="M18.7 8a2.4 2.4 0 0 0-3.4 0L12 11.4l-3-3a2.4 2.4 0 0 0-3.4 0L3 11"></path></svg>;

export default function CourseStatsPage() {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await api.get('/admin/stats/courses');
        setStats(res.data);
      } catch (err) {
        setError('No se pudieron cargar las estadísticas de los cursos.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <p style={{color: 'var(--text-gray)'}}>Cargando estadísticas...</p>;
  if (error) return <p style={{ color: '#fca5a5' }}>{error}</p>;

  return (
    <div className="dashboard-content">
      <div className="dashboard-header">
        <h1>
          <IconChart style={{ display: 'inline-block', marginRight: '10px' }} />
          Estadísticas de Cursos (Exámenes)
        </h1>
        <p>Rendimiento global de todos los exámenes en la plataforma.</p>
      </div>

      <div className="activity-section">
        <h3>Rendimiento de Exámenes</h3>
        <div className="table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Examen (Curso)</th>
                <th>Docente</th>
                <th>Promedio de Nota</th>
                <th>Entregas (Calificadas)</th>
                <th>Entregas (Totales)</th>
              </tr>
            </thead>
            <tbody>
              {stats.map(exam => (
                <tr key={exam.examId}>
                  <td>{exam.title}</td>
                  <td>{exam.authorName}</td>
                  <td>
                    <span style={{ color: 'var(--color-success)', fontWeight: 'bold' }}>
                      {exam.averageGrade} / 100
                    </span>
                  </td>
                  <td>{exam.gradedSubmissions}</td>
                  <td>{exam.totalSubmissions}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}