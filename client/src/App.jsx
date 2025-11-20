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
import ExamsPage from './pages/ExamsPage';
import CreateExamPage from './pages/CreateExamPage';
import EditExamPage from './pages/EditExamPage';
import TakeExamPage from './pages/TakeExamPage';
import ExamSubmissionsPage from './pages/ExamSubmissionsPage';
import GradeSubmissionPage from './pages/GradeSubmissionPage';
import StudentGradesPage from './pages/StudentGradesPage';
import MaterialDetailPage from './pages/MaterialDetailPage'; 
import AboutPage from './pages/AboutPage';
import FeaturesPage from './pages/FeaturesPage';

// --- IMPORTANTE: IMPORTA LA PÁGINA DEL ASISTENTE ---
import StudentAssistantPage from './pages/StudentAssistantPage'; 

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
      <Route path="/about" element={<AboutPage />} />
      <Route path="/features" element={<FeaturesPage />} /> 
      {/* Rutas Privadas Protegidas */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<DashboardLayout />}>
          
          <Route index element={<DashboardIndexPage />} /> 
          
          {/* Rutas de Materiales */}
          <Route path="materials" element={<MaterialsPage />} />
          <Route path="materials/new" element={<CreateMaterialPage />} />
          <Route path="materials/:id" element={<MaterialDetailPage />} />

          {/* Rutas de Exámenes */}
          <Route path="exams" element={<ExamsPage />} />
          <Route path="exams/new" element={<CreateExamPage />} />
          <Route path="exams/:id/edit" element={<EditExamPage />} />
          <Route path="exams/:id/take" element={<TakeExamPage />} />
          
          {/* Rutas de Calificación */}
          <Route path="exams/:id/submissions" element={<ExamSubmissionsPage />} />
          <Route path="grading/:submissionId" element={<GradeSubmissionPage />} />
          <Route path="my-grades" element={<StudentGradesPage />} />

          {/* --- AQUÍ FALTABA ESTA RUTA --- */}
          <Route path="assistant" element={<StudentAssistantPage />} />

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