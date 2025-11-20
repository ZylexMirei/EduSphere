import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import BackButton from '../components/BackButton';

// --- ICONOS SVG ---
const IconMagic = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>;
const IconSave = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>;
const IconCheckCircle = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const IconXCircle = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const IconCircle = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="10"></circle></svg>;

export default function GradeSubmissionPage() {
  const { submissionId } = useParams();
  const navigate = useNavigate();
  
  const [submission, setSubmission] = useState(null);
  const [exam, setExam] = useState(null);
  const [grade, setGrade] = useState('');
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingAi, setLoadingAi] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await api.get(`/submissions/${submissionId}`); 
        setSubmission(res.data);
        setGrade(res.data.grade || '');
        setFeedback(res.data.feedback || '');
        
        const examRes = await api.get(`/exams/${res.data.examId}`);
        setExam(examRes.data);
      } catch (error) {
        alert('Error cargando la entrega.');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [submissionId]);

  const handleAiFeedback = async () => {
    if (!submission || !exam) return;
    setLoadingAi(true);
    try {
      let summary = `El estudiante obtuvo una calificación de ${grade || 'N/A'}. `;
      const incorrectIndex = submission.answers.findIndex(ans => {
        const question = exam.questions[ans.questionIndex];
        return question && ans.answer !== question.correct;
      });

      let promptData = {
        question: "Resumen general del examen",
        studentAnswer: "N/A",
        correctAnswer: "N/A"
      };

      if (incorrectIndex !== -1) {
         const q = exam.questions[incorrectIndex];
         const ans = submission.answers.find(a => a.questionIndex === incorrectIndex);
         const selectedText = q.options[ans.answer];
         const correctText = q.options[q.correct];
         
         promptData = {
           question: q.question,
           studentAnswer: selectedText,
           correctAnswer: correctText
         };
      }

      const res = await api.post('/assistant/feedback', promptData);
      setFeedback(prev => (prev ? prev + "\n\n" : "") + `IA Sugerencia: ${res.data.feedback}`);
      
    } catch (error) {
      alert('Error al conectar con la IA.');
    } finally {
      setLoadingAi(false);
    }
  };

  const handleGrade = async () => {
    try {
      await api.put(`/submissions/${submissionId}/grade`, { grade, feedback });
      alert('Calificación guardada.');
      navigate(-1);
    } catch (error) {
      alert('Error al guardar.');
    }
  };

  if (loading || !submission || !exam) return <p style={{color:'white', padding:'2rem'}}>Cargando...</p>;

  return (
    <div className="dashboard-content">
      <BackButton />
      <div className="dashboard-header">
        <h1>Evaluando a: <span className="highlight-text">{submission.student.name}</span></h1>
        <p>Examen: {exam.title}</p>
      </div>

      <div className="dashboard-grid-waooo" style={{gridTemplateColumns: '2fr 1fr', gap:'2rem'}}>
        
        {/* COLUMNA IZQ: RESPUESTAS */}
        <div className="activity-section">
          <h3>Respuestas del Estudiante</h3>
          {exam.questions.map((q, idx) => {
            const studentAns = submission.answers.find(a => a.questionIndex === idx);
            const isCorrect = studentAns?.answer === q.correct;
            
            return (
              <div key={idx} style={{marginBottom:'1.5rem', padding:'1rem', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'8px', background: isCorrect ? 'rgba(34, 197, 94, 0.05)' : 'rgba(239, 68, 68, 0.05)'}}>
                <p style={{fontWeight:'bold', marginBottom:'0.5rem', color:'white'}}>{idx + 1}. {q.question}</p>
                
                <div style={{display:'flex', flexDirection:'column', gap:'5px', fontSize:'0.9rem'}}>
                  {q.options.map((opt, oIdx) => {
                     const selected = studentAns?.answer === oIdx;
                     const correct = q.correct === oIdx;
                     let style = { padding:'8px 12px', borderRadius:'6px', color:'var(--text-gray)', display:'flex', alignItems:'center', gap:'8px' };
                     
                     if (selected && correct) style = { ...style, background: 'rgba(34, 197, 94, 0.2)', color: '#4ade80', border: '1px solid #4ade80' };
                     else if (selected && !correct) style = { ...style, background: 'rgba(239, 68, 68, 0.2)', color: '#f87171', border: '1px solid #f87171' };
                     else if (!selected && correct) style = { ...style, border: '1px dashed #4ade80', opacity: 0.7 };
                     
                     return (
                       <div key={oIdx} style={style}>
                         {selected ? (correct ? <IconCheckCircle /> : <IconXCircle />) : <IconCircle style={{width:'12px', height:'12px', opacity:0.5}} />}
                         {opt}
                       </div>
                     )
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* COLUMNA DER: PANEL DE NOTA */}
        <div className="activity-section" style={{height:'fit-content', position:'sticky', top:'20px'}}>
          <h3 style={{color:'var(--accent)'}}>Calificación Final</h3>
          
          <div className="input-group">
            <label>Nota (0 - 100)</label>
            <input type="number" className="login-input" value={grade} onChange={e => setGrade(e.target.value)} placeholder="Ej: 85" />
          </div>

          <div className="input-group">
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'0.5rem'}}>
               <label style={{marginBottom:0}}>Feedback / Comentarios</label>
               <button 
                 onClick={handleAiFeedback} 
                 disabled={loadingAi}
                 style={{ fontSize:'0.75rem', background:'linear-gradient(135deg, #8b5cf6, #d946ef)', border:'none', color:'white', padding:'4px 10px', borderRadius:'20px', cursor:'pointer', display:'flex', alignItems:'center', gap:'4px', opacity: loadingAi ? 0.7 : 1 }}
               >
                 <IconMagic /> {loadingAi ? 'Generando...' : 'Generar con IA'}
               </button>
            </div>
            <textarea className="login-input" rows="6" value={feedback} onChange={e => setFeedback(e.target.value)} placeholder="Escribe tus observaciones..." style={{height:'auto', lineHeight:'1.5'}} />
          </div>

          <button onClick={handleGrade} className="login-button" style={{display:'flex', alignItems:'center', justifyContent:'center', gap:'8px'}}>
            <IconSave /> Publicar Nota
          </button>
        </div>

      </div>
    </div>
  );
}