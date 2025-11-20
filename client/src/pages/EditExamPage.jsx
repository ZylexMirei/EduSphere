import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import BackButton from '../components/BackButton';

// --- ICONOS SVG --- (Reutilizamos los mismos)
const IconUsers = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>;
const IconList = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>;
const IconTrash = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;
const IconSave = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>;
const IconGlobe = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const IconLock = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>;

export default function EditExamPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [title, setTitle] = useState('');
  const [duration, setDuration] = useState(60);
  const [questions, setQuestions] = useState([]);
  const [students, setStudents] = useState([]); 
  const [assignedTo, setAssignedTo] = useState([]); 
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const examRes = await api.get(`/exams/${id}`);
        setTitle(examRes.data.title);
        setQuestions(examRes.data.questions);
        setAssignedTo(examRes.data.assignedTo || []);
        setDuration(examRes.data.duration || 60);

        const studentsRes = await api.get('/dashboard/students-list');
        setStudents(studentsRes.data);
      } catch (error) {
        alert('Error cargando datos.');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id]);

  const updateQuestion = (idx, field, val) => {
    const newQ = [...questions]; newQ[idx][field] = val; setQuestions(newQ);
  };
  const updateOption = (qIdx, oIdx, val) => {
    const newQ = [...questions]; newQ[qIdx].options[oIdx] = val; setQuestions(newQ);
  };
  const addOption = (qIdx) => {
    const newQ = [...questions]; newQ[qIdx].options.push(''); setQuestions(newQ);
  };
  const addQuestion = () => setQuestions([...questions, { question: '', options: ['', ''], correct: 0 }]);
  
  const removeQuestion = (idx) => {
    if (questions.length === 1) return;
    setQuestions(questions.filter((_, i) => i !== idx));
  };

  const removeOption = (qIdx, oIdx) => {
    const newQ = [...questions];
    if (newQ[qIdx].options.length <= 2) return;
    newQ[qIndex].options = newQ[qIndex].options.filter((_, i) => i !== oIndex);
    if (newQ[qIndex].correct >= oIndex) newQ[qIndex].correct = Math.max(0, newQ[qIndex].correct - 1);
    setQuestions(newQ);
  };

  const toggleStudent = (studentId) => {
    if (assignedTo.includes(studentId)) setAssignedTo(assignedTo.filter(id => id !== studentId));
    else setAssignedTo([...assignedTo, studentId]);
  };

  const handleSubmit = async () => {
    try {
      await api.put(`/exams/${id}`, { title, questions, duration: parseInt(duration), assignedTo });
      alert('Examen actualizado correctamente.');
      navigate('/dashboard/exams');
    } catch (error) {
      alert('Error al guardar cambios.');
    }
  };

  if (loading) return <p style={{padding:'2rem', color:'white'}}>Cargando...</p>;

  return (
    <div className="dashboard-content">
      <BackButton to="/dashboard/exams" />
      <div className="dashboard-header"><h1>Editar Examen</h1></div>

      <div className="dashboard-grid-waooo" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        <div className="activity-section">
          <div style={{display: 'flex', gap: '1rem', flexWrap: 'wrap'}}>
            <div className="input-group" style={{flex: 2, minWidth: '200px'}}>
              <label>Título</label>
              <input className="login-input" value={title} onChange={e => setTitle(e.target.value)} />
            </div>
            <div className="input-group" style={{flex: 1, minWidth: '150px'}}>
              <label>Tiempo (minutos)</label>
              <input type="number" className="login-input" value={duration} onChange={e => setDuration(e.target.value)} min="1" />
            </div>
          </div>
        </div>

        <div className="activity-section">
          <h3 style={{color:'var(--accent)', display:'flex', alignItems:'center', gap:'8px'}}>
            <IconUsers /> Asignar a Estudiantes
          </h3>
          <p style={{color:'var(--text-gray)', fontSize:'0.9rem', marginBottom:'1rem'}}>
            Selecciona quiénes verán este examen. Si no seleccionas a nadie, será visible para <strong>TODOS</strong>.
          </p>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px', maxHeight: '200px', overflowY: 'auto', padding: '10px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
            {students.map(student => (
              <label key={student.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'white', cursor: 'pointer', padding: '5px' }}>
                <input type="checkbox" checked={assignedTo.includes(student.id)} onChange={() => toggleStudent(student.id)} style={{ accentColor: 'var(--accent)' }} />
                <span style={{ fontSize: '0.9rem' }}>{student.name}</span>
              </label>
            ))}
          </div>
          <div style={{ marginTop: '10px', color: 'var(--text-white)', fontSize: '0.9rem', fontStyle: 'italic', display:'flex', alignItems:'center', gap:'6px' }}>
            {assignedTo.length === 0 ? <><IconGlobe /> Visible para: TODOS LOS ESTUDIANTES</> : <><IconLock /> Visible para: {assignedTo.length} estudiante(s)</>}
          </div>
        </div>

        <div className="activity-section">
          <h3 style={{color: 'var(--accent)', marginBottom: '1rem', display:'flex', alignItems:'center', gap:'8px'}}>
            <IconList /> Preguntas
          </h3>

          {questions.map((q, qIdx) => (
            <div key={qIdx} style={{background:'rgba(255,255,255,0.05)', padding:'1.5rem', borderRadius:'12px', marginBottom:'1.5rem', borderLeft: '4px solid var(--primary)'}}>
              <div style={{display:'flex', justifyContent:'space-between', marginBottom:'10px'}}>
                 <label style={{color:'var(--accent)'}}>Pregunta {qIdx + 1}</label>
                 <button onClick={() => removeQuestion(qIdx)} style={{color:'#ef4444', background:'none', border:'none', cursor:'pointer', display:'flex', alignItems:'center', gap:'4px'}}>
                   <IconTrash /> Eliminar
                 </button>
              </div>
              <input className="login-input" style={{marginBottom:'1rem'}} value={q.question} onChange={e => updateQuestion(qIdx, 'question', e.target.value)} />
              
              {q.options.map((opt, oIdx) => (
                <div key={oIdx} style={{display:'flex', gap:'10px', marginBottom:'0.5rem', alignItems:'center'}}>
                  <input type="radio" name={`correct-${qIdx}`} checked={q.correct === oIdx} onChange={() => updateQuestion(qIdx, 'correct', oIdx)}/>
                  <input className="login-input" style={{padding:'0.5rem'}} value={opt} onChange={e => updateOption(qIdx, oIdx, e.target.value)}/>
                  <button onClick={() => removeOption(qIdx, oIdx)} style={{color: 'var(--text-gray)', background: 'none', border: 'none', cursor: 'pointer'}}>✕</button>
                </div>
              ))}
              <button onClick={() => addOption(qIdx)} style={{color:'var(--primary)', background:'none', border:'none', cursor:'pointer', marginTop:'5px', fontWeight:'bold'}}>+ Opción</button>
            </div>
          ))}
          
          <div style={{display:'flex', gap:'1rem'}}>
            <button onClick={addQuestion} className="btn-outline" style={{flex:1}}>+ Nueva Pregunta</button>
            <button onClick={handleSubmit} className="login-button" style={{flex:1, marginTop:0, display:'flex', alignItems:'center', justifyContent:'center', gap:'8px'}}>
              <IconSave /> Guardar Cambios
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}