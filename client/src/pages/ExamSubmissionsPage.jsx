// client/src/pages/ExamSubmissionsPage.jsx
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import BackButton from '../components/BackButton';

export default function ExamSubmissionsPage() {
  const { id } = useParams(); // ID del examen
  const [submissions, setSubmissions] = useState([]);
  const [examTitle, setExamTitle] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get(`/submissions/exam/${id}`);
        setSubmissions(res.data);
        // Obtenemos el título del examen (truco: sacarlo de la primera submission o pedir el examen aparte)
        // Para hacerlo bien, pedimos el examen:
        const examRes = await api.get(`/exams/${id}`);
        setExamTitle(examRes.data.title);
      } catch (error) {
        alert('Error al cargar entregas.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) return <p style={{padding:'2rem', color:'white'}}>Cargando entregas...</p>;

  return (
    <div className="dashboard-content">
      <BackButton to="/dashboard/exams" />
      <div className="dashboard-header">
        <h1>Entregas: {examTitle}</h1>
        <p>{submissions.length} estudiantes han enviado este examen.</p>
      </div>

      <div className="table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Estudiante</th>
              <th>Email</th>
              <th>Fecha Entrega</th>
              <th>Estado</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            {submissions.length === 0 && <tr><td colSpan="5" style={{textAlign:'center'}}>Nadie ha entregado aún.</td></tr>}
            {submissions.map((sub) => (
              <tr key={sub.id}>
                <td>{sub.student.name}</td>
                <td>{sub.student.email}</td>
                <td>{new Date(sub.submittedAt).toLocaleString()}</td>
                <td>
                  {sub.grade !== null ? (
                    <span className="status-badge status-active" style={{backgroundColor:'rgba(34, 197, 94, 0.2)', color:'#4ade80'}}>
                      Calificado: {sub.grade}
                    </span>
                  ) : (
                    <span className="status-badge" style={{backgroundColor:'rgba(249, 115, 22, 0.2)', color:'#fbbf24'}}>
                      Pendiente
                    </span>
                  )}
                </td>
                <td>
                  <Link 
                    to={`/dashboard/grading/${sub.id}`} 
                    className="btn-badge btn-badge-blue"
                    style={{textDecoration:'none'}}
                  >
                    Evaluar
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}