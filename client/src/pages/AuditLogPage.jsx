import React, { useEffect, useState } from 'react';
import api from '../services/api';
import Navbar from '../components/Navbar';

export default function AuditLogPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Pedimos los logs al backend
    api.get('/admin/audit-logs')
      .then(res => setLogs(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="dashboard-content">
      <div className="dashboard-header">
        <h1>🛡️ Historial de Auditoría</h1>
        <p>Registro de seguridad e IPs de todos los usuarios.</p>
      </div>

      <div className="activity-section">
        {loading ? <p>Cargando registros...</p> : (
          <div style={{overflowX: 'auto'}}>
            <table style={{width: '100%', borderCollapse: 'collapse', minWidth: '600px'}}>
              <thead>
                <tr style={{borderBottom: '2px solid rgba(255,255,255,0.1)', color: 'var(--text-gray)', textAlign: 'left'}}>
                  <th style={{padding: '1rem'}}>ACCIÓN</th>
                  <th style={{padding: '1rem'}}>USUARIO</th>
                  {/* NUEVA COLUMNA IP */}
                  <th style={{padding: '1rem', color: 'var(--accent)'}}>DIRECCIÓN IP</th>
                  <th style={{padding: '1rem'}}>DETALLES</th>
                  <th style={{padding: '1rem'}}>FECHA</th>
                </tr>
              </thead>
              <tbody>
                {logs.map(log => (
                  <tr key={log.id} style={{borderBottom: '1px solid rgba(255,255,255,0.05)'}}>
                    <td style={{padding: '1rem'}}>
                      <span style={{
                        padding: '4px 8px', 
                        borderRadius: '4px', 
                        fontSize: '0.8rem', 
                        background: log.action.includes('DELETE') ? 'rgba(239,68,68,0.2)' : 'rgba(34,197,94,0.2)',
                        color: log.action.includes('DELETE') ? '#f87171' : '#4ade80'
                      }}>
                        {log.action}
                      </span>
                    </td>
                    <td style={{padding: '1rem', fontWeight: 'bold'}}>{log.user?.name || 'Desconocido'}</td>
                    
                    {/* AQUÍ MOSTRAMOS LA IP QUE RASTREAMOS */}
                    <td style={{padding: '1rem', fontFamily: 'monospace', color: '#fbbf24'}}>
                        {log.ipAddress || 'Unknown'}
                    </td>
                    
                    <td style={{padding: '1rem', fontSize: '0.9rem', color: 'gray'}}>{log.details?.details || '-'}</td>
                    <td style={{padding: '1rem', fontSize: '0.8rem'}}>{new Date(log.timestamp).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}