import React from 'react';

// Iconos SVG (puedes buscar más en https://heroicons.com/ y copiar el SVG)
const IconBookOpen = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="feature-icon">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18c-2.305 0-4.408.867-6 2.292m0-14.25v14.25" />
  </svg>
);

const IconLightBulb = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="feature-icon">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a.97.97 0 01-.629.895l-.194.055a.97.97 0 01-.63.002 1.114 1.114 0 01-.734-.055m-3.264-.002a.97.97 0 01-.63-.002 1.114 1.114 0 01-.734.055m3.264-.002-.194.055m0-7.478a8.072 8.072 0 01-6.184 1.902A8.965 8.965 0 0012 18a8.965 8.965 0 006.184-1.902 8.072 8.072 0 01-6.184-1.902Z" />
  </svg>
);

const IconAcademicCap = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="feature-icon">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.902a48.627 48.627 0 018.673-4.408 60.462 60.462 0 00-.491-6.347m-15.482 0A50.573 50.573 0 0012 13.402a50.572 50.572 0 007.74-3.255M4.26 10.147L12 18.902l7.74-8.755M12 18.902V5.69M12 18.902h.008M12 6.345M12 18.902h-1.008M12 6.345V3.75M6.75 10.875a.75.75 0 00-1.5 0v3.75a.75.75 0 001.5 0V10.875zM15.75 10.875a.75.75 0 00-1.5 0v3.75a.75.75 0 001.5 0V10.875z" />
  </svg>
);


export default function FeaturesSection() {
  return (
    <section className="features-section">
      <div className="features-container">
        <h2 className="features-title">¿Qué hace EduSphere por ti?</h2>
        <p className="features-subtitle">
          Transformamos tu forma de aprender con herramientas innovadoras y personalizadas.
        </p>

        <div className="features-grid">
          <div className="feature-card">
            <IconLightBulb />
            <h3>Aprendizaje Personalizado</h3>
            <p>Nuestra IA adapta el contenido a tu ritmo y estilo, asegurando un aprendizaje efectivo.</p>
          </div>
          <div className="feature-card">
            <IconBookOpen />
            <h3>Recursos Interactivos</h3>
            <p>Accede a una vasta biblioteca de cursos, videos y ejercicios gamificados para cada materia.</p>
          </div>
          <div className="feature-card">
            <IconAcademicCap />
            <h3>Soporte Inteligente</h3>
            <p>Recibe ayuda instantánea con dudas y explicaciones claras gracias a nuestros tutores IA.</p>
          </div>
        </div>
      </div>
    </section>
  );
}