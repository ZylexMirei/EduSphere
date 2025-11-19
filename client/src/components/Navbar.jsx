import React from 'react';
import { Link } from 'react-router-dom';
import Logo from '../assets/logo.png'; // Asegúrate que el nombre y la extensión sean correctos (logo.png)

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* LOGO Y TEXTO */}
        <Link to="/" className="navbar-logo-group"> {/* <- NUEVA CLASE PARA EL CONTENEDOR */}
          <img src={Logo} alt="EduSphere" className="navbar-logo" />
          <span className="navbar-logo-text">EDUSPHERE</span> {/* <- TEXTO DEL LOGO AÑADIDO */}
        </Link>

        {/* Links */}
        <div className="navbar-links">
          <Link to="/features" className="navbar-link">CARACTERÍSTICAS</Link>
          <Link to="/about" className="navbar-link">NOSOTROS</Link>
          <Link to="/login" className="navbar-btn-acc">ACCEDER</Link>
        </div>
      </div>
    </nav>
  );
}