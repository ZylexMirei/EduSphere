import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import BackButton from '../components/BackButton';

// --- ICONOS SVG ---
const IconClock = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const IconCheck = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>;

export default function TakeExamPage() {
  const { id } = useParams();
  const [exam, setExam] = useState(null);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  
  const timerRef = useRef(null);

  useEffect(() => {
    const fetchExam = async () => {
      try {
        const res = await api.get(`/exams/${id}`);
        setExam(res.data);
        initializeTimer(res.data.id, res.data.duration);
      } catch (error) {
        alert("Error al cargar el examen.");
        navigate('/dashboard/exams');
      }
    };
    fetchExam();

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [id]);

  const initializeTimer = (examId, durationMinutes) => {
    const storageKey = `exam_start_${examId}`;
    const now = Date.now();
    let startTime = localStorage.getItem(storageKey);

    if (!startTime) {
      startTime = now;
      localStorage.setItem(storageKey, startTime);
    }

    const durationMs = durationMinutes * 60 * 1000;
    const endTime = parseInt(startTime) + durationMs;
    
    timerRef.current = setInterval(() => {
      const remaining = endTime - Date.now();
      
      if (remaining <= 0) {
        clearInterval(timerRef.current);
        setTimeLeft(0);
        handleAutoSubmit();
      } else {
        setTimeLeft(Math.floor(remaining / 1000));
      }
    }, 1000);
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleSelect = (qIndex, optionIndex) => {
    setAnswers({ ...answers, [qIndex]: optionIndex });
  };

  const handleAutoSubmit = () => {
    alert("⏰ ¡Se acabó el tiempo! Tu examen se enviará automáticamente.");
    handleSubmit(true);
  };

  const handleSubmit = async (isAuto = false) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    
    if (timerRef.current) clearInterval(timerRef.current);

    const formattedAnswers = Object.keys(answers).map(key => ({
      questionIndex: parseInt(key),
      answer: answers[key]
    }));

    try {
      await api.post('/submissions', { examId: id, answers: formattedAnswers });
      localStorage.removeItem(`exam_start_${id}`);
      if (!isAuto) alert('Examen enviado correctamente. ¡Suerte!');
      navigate('/dashboard/exams');
    } catch (error) {
      alert(error.response?.data?.message || 'Error al enviar (o ya fue enviado).');
      navigate('/dashboard/exams');
    }
  };

  if (!exam) return <p style={{padding:'2rem', color:'white'}}>Cargando examen...</p>;

  return (
    <div className="dashboard-content">
      <div style={{ position: 'sticky', top: '80px', zIndex: 50, background: timeLeft < 60 ? 'rgba(239, 68, 68, 0.9)' : 'rgba(15, 23, 36, 0.95)', backdropFilter: 'blur(10px)', padding: '10px 20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}>
        <div>
          <h2 style={{margin:0, fontSize:'1.1rem', color:'white'}}>{exam.title}</h2>
          <span style={{fontSize:'0.8rem', color:'var(--text-gray)'}}>Total: {exam.questions.length} preguntas</span>
        </div>
        
        <div style={{display:'flex', alignItems:'center', gap:'10px', fontSize:'1.5rem', fontWeight:'bold', color: timeLeft < 60 ? 'white' : 'var(--accent)'}}>
          <IconClock />
          {timeLeft !== null ? formatTime(timeLeft) : '--:--'}
        </div>
      </div>

      <div className="activity-section" style={{maxWidth:'800px', margin:'0 auto'}}>
        {exam.questions.map((q, qIdx) => (
          <div key={qIdx} style={{marginBottom:'2rem', borderBottom:'1px solid rgba(255,255,255,0.1)', paddingBottom:'1rem'}}>
            <h3 style={{marginBottom:'1rem', color:'white'}}>{qIdx + 1}. {q.question}</h3>
            <div style={{display:'flex', flexDirection:'column', gap:'0.5rem'}}>
              {q.options.map((opt, oIdx) => (
                <label key={oIdx} style={{ padding:'12px 15px', background: answers[qIdx] === oIdx ? 'rgba(6, 182, 212, 0.15)' : 'rgba(255,255,255,0.03)', borderRadius:'8px', cursor:'pointer', border: answers[qIdx] === oIdx ? '1px solid var(--accent)' : '1px solid transparent', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <input type="radio" name={`q-${qIdx}`} checked={answers[qIdx] === oIdx} onChange={() => handleSelect(qIdx, oIdx)} style={{accentColor: 'var(--accent)', width: '16px', height: '16px'}} />
                  <span style={{color: answers[qIdx] === oIdx ? 'white' : 'var(--text-gray)'}}>{opt}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
        
        <button 
          onClick={() => handleSubmit(false)} 
          className="login-button" 
          disabled={isSubmitting}
          style={{background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)', marginTop:'1rem', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px'}}
        >
          {isSubmitting ? 'Enviando...' : <><IconCheck /> Entregar Examen Ahora</>}
        </button>
      </div>
    </div>
  );
}