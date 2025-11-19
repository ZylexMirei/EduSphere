import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

// Icono para la cabecera
const IconHistory = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 4v6h6"></path><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path></svg>;
const IconUser = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>;

export default function AuditLogPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth(); // Necesitamos esto para filtrar al admin

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true);
        const res = await api.get('/admin/audit-logs');
        // Filtramos para no mostrar los logs del propio admin (opcional)
        // setLogs(res.data.filter(log => log.actorId !== user.id));
        setLogs(res.data);
      } catch (err) {
        setError('No se pudo cargar el historial.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, [user.id]);

  if (loading) return <p style={{color: 'var(--text-gray)'}}>Cargando historial de auditoría...</p>;
  if (error) return <p style={{ color: '#fca5a5' }}>{error}</p>;

  // Función para formatear la fecha
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
  };

  return (
    <div className="dashboard-content">
      <div className="dashboard-header">
        <h1>
          <IconHistory style={{ display: 'inline-block', marginRight: '10px' }} />
          Historial de Auditoría
        </h1>
        <p>Registro de acciones importantes en la plataforma.</p>
      </div>

      <div className="activity-section">
        <h3>Últimos Eventos</h3>
        {/* Reutilizamos la tabla de admin */}
        <table className="admin-table">
          <thead>
            <tr>
              <th>Acción</th>
              <th>Actor (Admin)</th>
              <th>Detalles</th>
              <th>Fecha y Hora</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 && (
              <tr><td colSpan="4" style={{textAlign: 'center', color: 'var(--text-gray)'}}>No hay eventos en el historial.</td></tr>
            )}
            {logs.map(log => (
              <tr key={log.id}>
                <td>
                  <span className={`status-badge ${log.action.includes('DELETE') ? 'status-inactive' : 'status-active'}`}>
                    {log.action}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <IconUser />
                    {log.actor.name}
                  </div>
                </td>
                <td>
                  {/* Mostramos los detalles del JSON (si existen) */}
                  {log.details && log.details.message ? 
                    log.details.message : 
                    (log.targetId || 'N/A')
                  }
                </td>
                <td>{formatDate(log.timestamp)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}