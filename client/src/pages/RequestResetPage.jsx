import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Navbar from '../components/Navbar';
import BackButton from '../components/BackButton';

// Icono
const IconMail = () => ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '24px', height: '24px' }}><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.902l-5.4 2.7a2.25 2.25 0 01-2.13 0l-5.4-2.7a2.25 2.25 0 01-1.07-1.902V6.75" /></svg> );

export default function RequestResetPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    try {
      // Guardamos el email en localStorage por si el usuario recarga
      localStorage.setItem('reset_email', email);
      await api.post('/auth/request-password-reset', { email });
      setMessage('¡Hecho! Si tu correo existe, recibirás un código. Serás redirigido para ingresarlo.');
      setTimeout(() => {
        navigate('/reset-password');
      }, 3000);
    } catch (err) {
      setError('Error al solicitar reseteo.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="page-container">
      <Navbar />
      <div className="hero-section login-page-container" style={{ minHeight: 'calc(100vh - 80px)' }}>
        <div className="login-card" style={{ maxWidth: '420px' }}> 
          <BackButton to="/login" />
          
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '2.2rem', fontWeight: '800', color: 'white', marginBottom: '0.5rem' }}>
              Resetear Contraseña
            </h2>
            <p style={{ color: 'var(--text-gray)', fontSize: '1.1rem' }}>
              Ingresa tu correo para recibir un código.
            </p>
          </div>

          {/* MENSAJES DE ERROR Y ÉXITO (CÓDIGO CORREGIDO) */}
          {error && (
            <div style={{ marginBottom: '1rem', padding: '1rem', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.2)', border: '1px solid rgba(239, 68, 68, 0.5)', color: '#fca5a5', textAlign: 'center' }}>
              {error}
            </div>
          )}
          {message && (
            <div style={{ marginBottom: '1rem', padding: '1rem', borderRadius: '8px', background: 'rgba(34, 197, 94, 0.2)', border: '1px solid rgba(34, 197, 94, 0.5)', color: '#4ade80', textAlign: 'center' }}>
              {message}
            </div>
          )}
          {/* -------------------------------------- */}

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label>Correo Electrónico</label>
              <div style={{ position: 'relative' }}>
                <span className="input-icon"><IconMail /></span>
                <input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  className="login-input" 
                  placeholder="ejemplo@correo.com" 
                  required 
                  disabled={loading} 
                />
              </div>
            </div>
            <button type="submit" className="login-button" disabled={loading}>
              {loading ? 'Enviando...' : 'Enviar Código'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}