import React from 'react';
import Navbar from '../components/Navbar';
import FeaturesSection from '../components/FeaturesSection'; // Reutilizamos tu componente
import BackButton from '../components/BackButton';

export default function FeaturesPage() {
  return (
    <div>
      <Navbar />
      <div style={{paddingTop: '100px'}}>
        <div style={{maxWidth:'1200px', margin:'0 auto', padding:'0 2rem'}}>
            <BackButton to="/" />
        </div>
        {/* Reutilizamos la sección que ya tenías porque estaba muy bien hecha */}
        <FeaturesSection /> 
        
        <div style={{textAlign:'center', padding:'4rem 2rem', background:'#0B1120'}}>
            <h2 style={{color:'white', marginBottom:'1rem'}}>¿Listo para empezar?</h2>
            <p style={{color:'gray', marginBottom:'2rem'}}>Únete a cientos de estudiantes que ya usan EduSphere.</p>
            <a href="/register" className="btn-primary">Crear Cuenta Gratis</a>
        </div>
      </div>
    </div>
  );
}