import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

// Iconos
const IconUsers = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>;

export default function AdminUsersPage({ role }) {
  const [users, setUsers] =useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user: adminUser } = useAuth();

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      const usersRes = await api.get('/admin/users');
      // Filtramos por el rol que nos piden (ESTUDIANTE o DOCENTE)
      // Y nos aseguramos de no incluir al admin logueado
      setUsers(usersRes.data.filter(u => u.role === role && u.id !== adminUser.id));
    } catch (err) {
      setError(`No se pudieron cargar los ${role.toLowerCase()}s.`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [role, adminUser.id]); // Recarga si cambia el rol

  // --- Funciones de Botones "WAOOO" ---
  const handleToggleActivate = async (userId, currentStatus) => {
    if (!window.confirm(`¿Seguro que quieres ${currentStatus ? 'DESACTIVAR' : 'ACTIVAR'} a este usuario?`)) return;
    try {
      await api.patch(`/admin/users/${userId}/activation`, { isActive: !currentStatus });
      fetchData(); // Recarga la tabla
    } catch (err) {
      alert('Error al actualizar usuario.');
    }
  };

  const handleChangeRole = async (userId, currentRole) => {
    const newRole = prompt(`Ingresa el nuevo rol (actual: ${currentRole}).\nOpciones: ADMIN, DOCENTE, ESTUDIANTE`, currentRole);
    if (newRole && ['ADMIN', 'DOCENTE', 'ESTUDIANTE'].includes(newRole.toUpperCase())) {
      try {
        await api.patch(`/admin/users/${userId}/role`, { role: newRole.toUpperCase() });
        fetchData(); // Recarga la tabla
      } catch (err) {
        alert('Error al cambiar el rol.');
      }
    } else if (newRole) {
      alert('Rol inválido.');
    }
  };

  if (loading) return <p style={{color: 'var(--text-gray)'}}>Cargando lista...</p>;
  if (error) return <p style={{ color: '#fca5a5' }}>{error}</p>;

  return (
    <div className="dashboard-content">
      <div className="dashboard-header">
        <h1>
          <IconUsers style={{ display: 'inline-block', marginRight: '10px' }} />
          Gestión de {role === 'DOCENTE' ? 'Docentes' : 'Estudiantes'}
        </h1>
        <p>Activa, desactiva o cambia roles.</p>
      </div>

      <div className="activity-section">
        <h3>Lista de {role === 'DOCENTE' ? 'Docentes' : 'Estudiantes'} ({users.length})</h3>
        <div className="table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Email</th>
                <th>Rol</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>
                    <span className={`role-badge role-${user.role.toLowerCase()}`}>
                      {user.role}
                    </span>
                  </td>
                  <td>
                    {user.isVerified ? 
                      <span className="status-badge status-active">Activo</span> : 
                      <span className="status-badge status-inactive">Inactivo</span>
                    }
                  </td>
                  <td className="table-actions">
                    {/* --- ¡BOTONES "WAOOO"! --- */}
                    <button onClick={() => handleChangeRole(user.id, user.role)} className="btn-badge btn-badge-blue">
                      Rol
                    </button>
                    <button onClick={() => handleToggleActivate(user.id, user.isVerified)} className={user.isVerified ? "btn-badge btn-badge-orange" : "btn-badge btn-badge-green"}>
                      {user.isVerified ? 'Desactivar' : 'Activar'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}