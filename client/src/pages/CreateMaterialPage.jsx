import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import BackButton from '../components/BackButton';

// --- Iconos ---
const IconCloudUp = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '20px', height: '20px', marginRight: '8px' }}><path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" /></svg>;
const IconUpload = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '48px', height: '48px', color: 'var(--text-gray)' }}><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" /></svg>;
const IconFile = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '20px', height: '20px', color: 'var(--accent)', flexShrink: 0 }}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m.75 12l3 3m0 0l3-3m-3 3v-6m-1.5-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>;
// ---------------

export default function CreateMaterialPage() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [files, setFiles] = useState([]); 
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title) {
      setError('El título es obligatorio.');
      return;
    }
    setLoading(true);
    setError('');

    const formData = new FormData();
    // ¡IMPORTANTE! Añadir campos de texto PRIMERO
    formData.append('title', title);
    formData.append('content', content);
    
    // Luego los archivos
    files.forEach((file) => {
      formData.append('attachments', file);
    });

    try {
      // Imprime lo que enviamos para depurar
      for (var pair of formData.entries()) {
        console.log(pair[0]+ ', ' + pair[1]); 
      }

      await api.post('/materials', formData, {
        headers: { 'Content-Type': 'multipart/form-data' } 
      });
      
      alert('¡Material publicado exitosamente!');
      navigate('/dashboard/materials'); 
      
    } catch (err) {
      console.error(err);
      // Mejor manejo de errores para mostrar lo que dice el backend
      const msg = err.response?.data?.message || err.message || 'Error al subir el material.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-content">
      <div style={{ marginBottom: '1rem' }}>
        <BackButton to="/dashboard/materials" />
      </div>
      
      <div className="dashboard-header">
        <h1>Crear Nuevo Material</h1>
        <p>Sube documentos, imágenes o recursos para tus estudiantes.</p>
      </div>

      <div className="activity-section" style={{ maxWidth: '800px' }}>
        <form onSubmit={handleSubmit}>
          
          <div className="input-group">
            <label>Título del Material (Obligatorio)</label>
            <input 
              type="text"
              className="login-input" 
              placeholder="Ej: Guía de Estudio - Unidad 1"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{ paddingLeft: '1.5rem' }} 
            />
          </div>

          <div className="input-group">
            <label>Descripción (Opcional)</label>
            <textarea
              className="login-input"
              rows="4"
              placeholder="Escribe detalles sobre este material..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              style={{ paddingLeft: '1.5rem', height: 'auto', fontFamily: 'inherit' }} 
            ></textarea>
          </div>

          <div className="input-group">
            <label>Archivos (PDF, DOCX, PNG, etc. Max 5)</label>
            <label htmlFor="file-upload" className="file-drop-zone">
              <IconUpload />
              <p>Arrastra tus archivos aquí o <strong>haz clic para seleccionar</strong></p>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-gray)' }}>Límite: 10MB por archivo</span>
            </label>
            <input 
              id="file-upload"
              type="file"
              multiple 
              onChange={handleFileChange}
              style={{ display: 'none' }} 
            />
          </div>

          {files.length > 0 && (
            <div className="file-preview-list">
              <h4 style={{ color: 'var(--text-white)', marginBottom: '10px', fontSize: '0.9rem' }}>ARCHIVOS SELECCIONADOS:</h4>
              {files.map((file, index) => (
                <div key={index} className="file-preview-item">
                  <IconFile />
                  <span>{file.name}</span>
                  <span style={{ marginLeft: 'auto', color: 'var(--text-gray)', fontSize: '0.8rem' }}>
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </span>
                </div>
              ))}
            </div>
          )}

          {error && (
            <div style={{ margin: '1rem 0', padding: '1rem', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.2)', border: '1px solid rgba(239, 68, 68, 0.5)', color: '#fca5a5', textAlign: 'center' }}>
              {error}
            </div>
          )}

          <button 
            type="submit" 
            className="login-button" 
            disabled={loading}
            style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}
          >
            <IconCloudUp />
            {loading ? 'Subiendo...' : 'PUBLICAR MATERIAL'}
          </button>
          
        </form>
      </div>
    </div>
  );
}