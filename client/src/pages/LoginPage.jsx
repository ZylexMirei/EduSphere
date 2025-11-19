import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import BackButton from '../components/BackButton'; // <-- 1. Importa el botón "Volver"

// --- Iconos ---
const IconMail = () => ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '24px', height: '24px' }}><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.902l-5.4 2.7a2.25 2.25 0 01-2.13 0l-5.4-2.7a2.25 2.25 0 01-1.07-1.902V6.75" /></svg> );
const IconLock = () => ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '24px', height: '24px' }}><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" /></svg> );
// --------------

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false); // Estado de carga
  const navigate = useNavigate();
  const { login } = useAuth(); 

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true); // Activa la carga
    try {
      await login(email, password); 
      navigate('/dashboard'); 
    } catch (err) {
      if (err.response && err.response.data) {
        setError(err.response.data.message);
      } else {
        setError('Error al conectar con el servidor.');
      }
    } finally {
      setLoading(false); // Desactiva la carga
    }
  };
  
  return (
    <div className="page-container">
      <Navbar />
      <div className="hero-section login-page-container" style={{ minHeight: 'calc(100vh - 80px)' }}>
        
        <div className="login-card" style={{ maxWidth: '420px' }}> 
          
          <BackButton to="/" /> {/* <-- 2. AÑADE EL BOTÓN VOLVER */}

          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '2.2rem', fontWeight: '800', color: 'white', marginBottom: '0.5rem' }}>
              Bienvenido de nuevo
            </h2>
            <p style={{ color: 'var(--text-gray)', fontSize: '1.1rem' }}>
              Ingresa a tu cuenta para continuar
            </p>
          </div>

          {error && (
            <div style={{ marginBottom: '1rem', padding: '1rem', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.2)', border: '1px solid rgba(239, 68, 68, 0.5)', color: '#fca5a5', textAlign: 'center' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label>Correo Electrónico</label>
              <div style={{ position: 'relative' }}>
                <span className="input-icon"><IconMail /></span>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="login-input" placeholder="ejemplo@correo.com" required disabled={loading} />
              </div>
            </div>
            <div className="input-group">
              <label>Contraseña</label>
              <div style={{ position: 'relative' }}>
                <span className="input-icon"><IconLock /></span>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="login-input" placeholder="••••••••" required disabled={loading} />
              </div>
            </div>

            {/* --- 3. AÑADE EL ENLACE "OLVIDÉ CONTRASEÑA" --- */}
            <Link to="/request-reset" className="forgot-password-link">
              ¿Olvidaste tu contraseña?
            </Link>

            <button type="submit" className="login-button" disabled={loading}>
              {loading ? 'Iniciando...' : 'Iniciar Sesión'}
            </button>
          </form>
          <div style={{ marginTop: '2rem', textAlign: 'center', color: 'var(--text-gray)' }}>
            ¿No tienes cuenta?{' '}
            <Link to="/register" className="register-link">
              Regístrate aquí
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}