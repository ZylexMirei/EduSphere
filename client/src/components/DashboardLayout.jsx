import React from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; 

// --- ICONOS SVG ---
const IconHome = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>;
const IconBook = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>;
const IconEdit = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>;
const IconBot = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="10" rx="2"></rect><circle cx="12" cy="5" r="2"></circle><path d="M12 7v4"></path><line x1="8" y1="16" x2="8" y2="16"></line><line x1="16" y1="16" x2="16" y2="16"></line></svg>;
const IconLogOut = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>;
const IconHistory = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 4v6h6"></path><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path></svg>;
const IconUsers = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>;
const IconTeacher = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="7" r="4"></circle><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path></svg>;
// -----------

export default function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth(); 
  
  if (!user) {
    return <div className="dashboard-layout" style={{ justifyContent: 'center', alignItems: 'center' }}>Cargando...</div>;
  }

  const isStudent = user.role === 'ESTUDIANTE';
  const isTeacher = user.role === 'DOCENTE';
  const isAdmin = user.role === 'ADMIN'; 

  const handleLogout = () => {
    logout(); 
    navigate('/login');
  };
  
  const getLinkClass = (path) => {
    const baseClass = "sidebar-link";
    const isActive = location.pathname === path || (path !== '/dashboard' && location.pathname.startsWith(path));
    return isActive ? `${baseClass} active` : baseClass;
  };

  return (
    <div className="dashboard-layout">
      
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo-icon">E</div>
          <h1 className="navbar-logo-text" style={{ fontSize: '1.2rem' }}>EDUSPHERE</h1>
        </div>

        <nav className="sidebar-menu">
          <p className="menu-label">Menu Principal</p>
          
          <Link to="/dashboard" className={getLinkClass('/dashboard')}>
            <IconHome /> Inicio
          </Link>
          
          {/* VISTAS DE ESTUDIANTE */}
          {isStudent && (
            <>
              <Link to="/dashboard/materials" className={getLinkClass('/dashboard/materials')}>
                <IconBook /> Materiales
              </Link>
              <Link to="/dashboard/exams" className={getLinkClass('/dashboard/exams')}>
                <IconEdit /> Exámenes
              </Link>
              <Link to="/dashboard/assistant" className={getLinkClass('/dashboard/assistant')}>
                <IconBot /> Asistente IA
              </Link>
            </>
          )}

          {/* VISTAS DE DOCENTE */}
          {isTeacher && (
            <>
              <Link to="/dashboard/materials" className={getLinkClass('/dashboard/materials')}>
                <IconBook /> Materiales (Crear)
              </Link>
              <Link to="/dashboard/exams" className={getLinkClass('/dashboard/exams')}>
                <IconEdit /> Exámenes (Calificar)
              </Link>
            </>
          )}
          
          {/* --- ¡NUEVO MENÚ DE ADMIN "WAOOO"! --- */}
          {isAdmin && (
            <>
              <p className="menu-label" style={{ marginTop: '1.5rem' }}>Administración</p>
              <Link to="/dashboard/students" className={getLinkClass('/dashboard/students')}>
                <IconUsers /> G. Estudiantes
              </Link>
              <Link to="/dashboard/teachers" className={getLinkClass('/dashboard/teachers')}>
                <IconTeacher /> G. Docentes
              </Link>
              <Link to="/dashboard/course-stats" className={getLinkClass('/dashboard/course-stats')}>
                <IconEdit /> Stats Cursos
              </Link>
              <Link to="/dashboard/logs" className={getLinkClass('/dashboard/logs')}>
                <IconHistory /> Historial
              </Link>
            </>
          )}
        </nav>

        <div className="sidebar-footer">
          <button onClick={handleLogout} className="logout-btn">
            <IconLogOut /> Cerrar Sesión
          </button>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <h2 style={{ fontWeight: '600', color: 'var(--text-gray)' }}>
            Panel de {isAdmin ? 'Administración' : (isTeacher ? 'Docente' : 'Estudiante')}
          </h2>
          <div className="user-info">
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: '0.9rem', fontWeight: 'bold', color: 'white', margin: 0 }}>{user.name || 'Usuario'}</p>
              <p style={{ fontSize: '0.75rem', color: 'var(--accent)', margin: 0, textTransform: 'uppercase' }}>{user.role}</p>
            </div>
            <div className="avatar-circle">
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
          </div>
        </header>

        <div className="dashboard-page">
          {/* Pasa los datos de rol a TODOS los hijos */}
          <Outlet context={{ user, isAdmin, isTeacher }} />
        </div>
      </main>
    </div>
  );
}