import React from 'react';
import { useOutletContext } from 'react-router-dom';

// Importa las dos páginas de "Inicio"
import AdminPage from './AdminPage';
import DashboardHome from './DashboardHome';

export default function DashboardIndexPage() {
  // 1. Lee el rol del "Padre" (DashboardLayout)
  const { isAdmin } = useOutletContext(); 

  // 2. Si es Admin, muestra el panel de Admin
  if (isAdmin) {
    return <AdminPage />;
  }

  // 3. Si no, muestra el panel normal de Estudiante/Docente
  return <DashboardHome />;
}