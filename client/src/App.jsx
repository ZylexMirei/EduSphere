import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import OTPPage from './pages/OTPPage';
import RequestResetPage from './pages/RequestResetPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/DashboardLayout';
import DashboardIndexPage from './pages/DashboardIndexPage';
import DashboardHome from './pages/DashboardHome';
import AdminPage from './pages/AdminPage';
import MaterialsPage from './pages/MaterialsPage';
import AdminUsersPage from './pages/AdminUsersPage';
import AuditLogPage from './pages/AuditLogPage';
import CourseStatsPage from './pages/CourseStatsPage';
import CreateMaterialPage from './pages/CreateMaterialPage';


function App() {
  return (
    <Routes>
      {/* Rutas Públicas */}
      <Route path="/" element={<HomePage />} /> 
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/verify-otp" element={<OTPPage />} />
      <Route path="/request-reset" element={<RequestResetPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      {/* Rutas Privadas Protegidas */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<DashboardLayout />}>
          
          <Route index element={<DashboardIndexPage />} /> 
          
          {/* --- ¡AQUÍ ESTÁ LA MAGIA! --- */}
          {/* Ruta para la lista de materiales */}
          <Route path="materials" element={<MaterialsPage />} />
          {/* Ruta para el formulario de creación */}
          <Route path="materials/new" element={<CreateMaterialPage />} />
          {/* ------------------------------- */}

          {/* Rutas de Admin */}
          <Route path="students" element={<AdminUsersPage role="ESTUDIANTE" />} />
          <Route path="teachers" element={<AdminUsersPage role="DOCENTE" />} />
          <Route path="course-stats" element={<CourseStatsPage />} />
          <Route path="logs" element={<AuditLogPage />} />
          
          {/* Rutas Internas */}
          <Route path="admin-home" element={<AdminPage />} /> 
          <Route path="student-home" element={<DashboardHome />} />

        </Route>
      </Route>

    </Routes>
  )
}

export default App;