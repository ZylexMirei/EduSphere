import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Navbar from '../components/Navbar';
import BackButton from '../components/BackButton';

// Iconos
const IconKey = () => ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '24px', height: '24px' }}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" /></svg> );
const IconLock = () => ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '24px', height: '24px' }}><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" /></svg> );

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Recuperar el email que guardamos en el paso anterior (RequestResetPage)
  useEffect(() => {
    const storedEmail = localStorage.getItem('reset_email');
    if (storedEmail) setEmail(storedEmail);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    
    try {
      // Llamamos a la ruta correcta del backend
      await api.post('/auth/reset-password', { email, code, newPassword });
      
      setMessage('¡Contraseña cambiada con éxito! Redirigiendo al login...');
      localStorage.removeItem('reset_email'); // Limpiamos storage
      
      setTimeout(() => {
        navigate('/login');
      }, 3000);

    } catch (err) {
      setError(err.response?.data?.message || 'Error al cambiar la contraseña.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <Navbar />
      <div className="hero-section login-page-container" style={{ minHeight: 'calc(100vh - 80px)' }}>
        <div className="login-card" style={{ maxWidth: '420px' }}> 
          <BackButton to="/request-reset" />
          
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: '800', color: 'white', marginBottom: '0.5rem' }}>
              Nueva Contraseña
            </h2>
            <p style={{ color: 'var(--text-gray)' }}>
              Ingresa el código que recibiste y tu nueva clave.
            </p>
          </div>

          {error && <div style={{ marginBottom: '1rem', padding: '1rem', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.2)', border: '1px solid rgba(239, 68, 68, 0.5)', color: '#fca5a5', textAlign: 'center' }}>{error}</div>}
          {message && <div style={{ marginBottom: '1rem', padding: '1rem', borderRadius: '8px', background: 'rgba(34, 197, 94, 0.2)', border: '1px solid rgba(34, 197, 94, 0.5)', color: '#4ade80', textAlign: 'center' }}>{message}</div>}

          <form onSubmit={handleSubmit}>
            {/* Email (Editable por si acaso el usuario quiere corregirlo) */}
            <div className="input-group">
              <label>Correo Electrónico</label>
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                className="login-input" 
                placeholder="tu@email.com"
                required 
              />
            </div>

            <div className="input-group">
              <label>Código de Verificación</label>
              <div style={{ position: 'relative' }}>
                <span className="input-icon"><IconKey /></span>
                <input 
                  type="text" 
                  value={code} 
                  onChange={(e) => setCode(e.target.value)} 
                  className="login-input" 
                  placeholder="123456" 
                  maxLength="6" 
                  required 
                  disabled={loading} 
                />
              </div>
            </div>

            <div className="input-group">
              <label>Nueva Contraseña</label>
              <div style={{ position: 'relative' }}>
                <span className="input-icon"><IconLock /></span>
                <input 
                  type="password" 
                  value={newPassword} 
                  onChange={(e) => setNewPassword(e.target.value)} 
                  className="login-input" 
                  placeholder="••••••••" 
                  required 
                  disabled={loading} 
                />
              </div>
            </div>

            <button type="submit" className="login-button" disabled={loading}>
              {loading ? 'Actualizando...' : 'Cambiar Contraseña'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}