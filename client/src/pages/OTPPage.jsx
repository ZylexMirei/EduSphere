import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import Navbar from '../components/Navbar';
import BackButton from '../components/BackButton';

// Icono
const IconKey = () => ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '24px', height: '24px' }}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" /></svg> );

export default function OTPPage() {
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  // Lee el email guardado (a prueba de recargas)
  useEffect(() => {
    const storedEmail = localStorage.getItem('otp_email');
    if (!storedEmail) {
      navigate('/register'); // Si no hay email, no puede estar aquí
    } else {
      setEmail(storedEmail);
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    try {
      const res = await api.post('/auth/verify-otp', { email, code: otp });
      setMessage(res.data.message + " Iniciando sesión...");
      
      // ¡Login forzado!
      const { token, user } = res.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.removeItem('otp_email'); // Limpia el email temporal
      
      // Recargamos la página al dashboard para que el "Cerebro" (AuthContext) se actualice
      window.location.href = '/dashboard';
      
    } catch (err) {
      setError(err.response?.data?.message || 'Error al verificar el código.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setError('');
    setMessage('');
    setResending(true);
    try {
      const res = await api.post('/auth/resend-otp', { email });
      setMessage(res.data.message);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al reenviar el código.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="page-container">
      <Navbar />
      <div className="hero-section login-page-container" style={{ minHeight: 'calc(100vh - 80px)' }}>
        <div className="login-card" style={{ maxWidth: '420px' }}> 
          <BackButton to="/register" />
          
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '2.2rem', fontWeight: '800', color: 'white', marginBottom: '0.5rem' }}>
              Verifica tu Cuenta
            </h2>
            <p style={{ color: 'var(--text-gray)', fontSize: '1.1rem' }}>
              Hemos enviado un código a <span style={{ fontWeight: 'bold', color: 'white' }}>{email}</span>
            </p>
          </div>

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

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label>Código OTP</label>
              <div style={{ position: 'relative' }}>
                <span className="input-icon"><IconKey /></span>
                <input 
                  type="text" 
                  value={otp} 
                  onChange={(e) => setOtp(e.target.value)} 
                  className="login-input" 
                  placeholder="------" 
                  maxLength="6" 
                  required 
                  disabled={loading} 
                />
              </div>
            </div>
            <button type="submit" className="login-button" disabled={loading}>
              {loading ? 'Verificando...' : 'Verificar Cuenta'}
            </button>
          </form>
          
          <div style={{ marginTop: '1.5rem', textAlign: 'center', color: 'var(--text-gray)' }}>
            ¿No recibiste el código?{' '}
            <button onClick={handleResendOTP} disabled={resending} style={{ background: 'none', border: 'none', color: 'var(--accent)', textDecoration: 'underline', cursor: 'pointer', fontSize: '1rem', fontWeight: 'bold' }}>
              {resending ? 'Reenviando...' : 'Reenviar Código'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}