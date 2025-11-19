import React from 'react';
import Navbar from '../components/Navbar';
import { Link } from 'react-router-dom';
import FeaturesSection from '../components/FeaturesSection';

export default function HomePage() {
  return (
    <div>
      <Navbar />
      
      <div className="hero-section">
        {/* --- ¡ESTOS DIVS YA NO SON NECESARIOS AQUÍ! --- */}
        {/* <div className="hero-content-aura-top"></div> */}
        {/* <div className="hero-content-aura-bottom"></div> */}
        {/* --------------------------------------------- */}

        <div className="hero-content">
          <h1 className="hero-title">
            BIENVENIDO A <br />
            <span className="highlight">EDUSPHERE</span>
          </h1>
          <p className="hero-subtitle">
            Tu plataforma de aprendizaje asistido por IA. ¡Prepárate para el futuro!
          </p>

          <div className="hero-buttons">
            <Link to="/register" className="btn-primary">
              REGISTRARSE AHORA
            </Link>
            <Link to="/login" className="btn-outline">
              Iniciar Sesión
            </Link>
          </div>
        </div>
      </div>
      
      <FeaturesSection />

    </div>
  );
}