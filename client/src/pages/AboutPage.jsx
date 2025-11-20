import React from 'react';
import Navbar from '../components/Navbar';
import BackButton from '../components/BackButton';

export default function AboutPage() {
  return (
    <div>
      <Navbar />
      <div className="page-container" style={{paddingTop: '100px', paddingBottom:'4rem', maxWidth:'800px', margin:'0 auto', color:'white'}}>
        <BackButton to="/" />
        <h1 style={{fontSize:'3rem', marginBottom:'1rem', color:'var(--accent)'}}>Sobre Nosotros</h1>
        <p style={{fontSize:'1.2rem', lineHeight:'1.8', color:'var(--text-gray)'}}>
          EduSphere nació con una misión clara: <strong>democratizar el acceso a la educación de calidad</strong> utilizando el poder de la Inteligencia Artificial.
        </p>
        <br />
        <p style={{fontSize:'1.1rem', lineHeight:'1.8', color:'var(--text-gray)'}}>
          Somos un equipo apasionado por la tecnología educativa. Creemos que cada estudiante aprende de manera diferente, y nuestra plataforma se adapta a esas necesidades únicas mediante algoritmos avanzados y herramientas intuitivas.
        </p>
        
        <div style={{marginTop:'3rem', display:'grid', gridTemplateColumns:'1fr 1fr', gap:'2rem'}}>
          <div style={{background:'var(--card-bg)', padding:'2rem', borderRadius:'16px', border:'1px solid rgba(255,255,255,0.1)'}}>
            <h3 style={{color:'white', marginBottom:'0.5rem'}}>Nuestra Visión</h3>
            <p style={{color:'gray'}}>Un mundo donde el aprendizaje no tiene barreras ni límites.</p>
          </div>
          <div style={{background:'var(--card-bg)', padding:'2rem', borderRadius:'16px', border:'1px solid rgba(255,255,255,0.1)'}}>
            <h3 style={{color:'white', marginBottom:'0.5rem'}}>Nuestra Misión</h3>
            <p style={{color:'gray'}}>Potenciar a educadores y estudiantes con herramientas del futuro.</p>
          </div>
        </div>
      </div>
    </div>
  );
}