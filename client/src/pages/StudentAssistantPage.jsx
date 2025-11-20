import React, { useState, useEffect } from 'react';
import api from '../services/api';

// --- ICONOS SVG PROFESIONALES ---
const IconBot = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="10" rx="2"></rect><circle cx="12" cy="5" r="2"></circle><path d="M12 7v4"></path><line x1="8" y1="16" x2="8" y2="16"></line><line x1="16" y1="16" x2="16" y2="16"></line></svg>;
const IconCards = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>;
const IconChat = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>;
const IconSend = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>;
const IconSparkles = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path></svg>;
const IconRefresh = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M23 4v6h-6"></path><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path></svg>;

export default function StudentAssistantPage() {
  const [materials, setMaterials] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' o 'flashcards'
  
  // Estados del Chat
  const [question, setQuestion] = useState('');
  const [chatHistory, setChatHistory] = useState([{ role: 'system', content: 'Hola, selecciona tus materiales y pregúntame lo que quieras.' }]);
  const [loadingChat, setLoadingChat] = useState(false);

  // Estados de Flashcards
  const [flashcards, setFlashcards] = useState([]);
  const [loadingCards, setLoadingCards] = useState(false);
  const [flippedCards, setFlippedCards] = useState({});

  useEffect(() => {
    api.get('/materials').then(res => setMaterials(res.data));
  }, []);

  const toggleMaterial = (id) => {
    if (selectedIds.includes(id)) setSelectedIds(selectedIds.filter(i => i !== id));
    else setSelectedIds([...selectedIds, id]);
  };

  // --- LÓGICA CHAT ---
  const handleAsk = async (e) => {
    e.preventDefault();
    if (!question.trim() || selectedIds.length === 0) return alert("Selecciona materiales y escribe una pregunta.");
    
    const newHistory = [...chatHistory, { role: 'user', content: question }];
    setChatHistory(newHistory);
    setQuestion('');
    setLoadingChat(true);

    try {
      const res = await api.post('/assistant/query', { question, materialIds: selectedIds });
      setChatHistory([...newHistory, { role: 'system', content: res.data.answer }]);
    } catch (err) {
      setChatHistory([...newHistory, { role: 'system', content: 'Error al conectar con la IA.' }]);
    } finally {
      setLoadingChat(false);
    }
  };

  // --- LÓGICA FLASHCARDS ---
  const handleGenerateCards = async () => {
    if (selectedIds.length === 0) return alert("Selecciona materiales primero.");
    setLoadingCards(true);
    setFlippedCards({});
    try {
      const res = await api.post('/assistant/flashcards', { materialIds: selectedIds });
      setFlashcards(res.data);
    } catch (err) {
      alert("Error generando tarjetas.");
    } finally {
      setLoadingCards(false);
    }
  };

  const handleFlip = (index) => {
    setFlippedCards(prev => ({ ...prev, [index]: !prev[index] }));
  };

  return (
    <div className="dashboard-content" style={{ height: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column' }}>
      <div className="dashboard-header" style={{ marginBottom: '1rem' }}>
        <h1><IconBot style={{display:'inline', marginRight:'10px'}}/> Asistente Inteligente</h1>
        <p>Tu compañero de estudio con IA.</p>
      </div>

      <div className="dashboard-grid-waooo" style={{ flex: 1, overflow: 'hidden', gap: '1rem' }}>
        
        {/* COLUMNA IZQUIERDA: SELECCIÓN DE MATERIALES */}
        <div className="activity-section" style={{ overflowY: 'auto', borderRight: '1px solid rgba(255,255,255,0.1)' }}>
          <h3 style={{color:'var(--accent)'}}>1. Elige tus fuentes</h3>
          <p style={{fontSize:'0.8rem', color:'gray', marginBottom:'1rem'}}>La IA basará sus respuestas SÓLO en lo que marques aquí.</p>
          
          {materials.map(mat => (
            <label key={mat.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', background: selectedIds.includes(mat.id) ? 'rgba(6, 182, 212, 0.1)' : 'transparent', borderRadius: '8px', cursor: 'pointer', marginBottom: '5px', border: selectedIds.includes(mat.id) ? '1px solid var(--accent)' : '1px solid transparent' }}>
              <input 
                type="checkbox" 
                checked={selectedIds.includes(mat.id)}
                onChange={() => toggleMaterial(mat.id)}
                style={{ accentColor: 'var(--accent)' }}
              />
              <span style={{color:'white', fontSize:'0.9rem'}}>{mat.title}</span>
            </label>
          ))}
        </div>

        {/* COLUMNA DERECHA: ZONA DE INTERACCIÓN */}
        <div className="activity-section" style={{ display: 'flex', flexDirection: 'column', padding: '0' }}>
          
          {/* TABS CON ICONOS SVG */}
          <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            <button 
              onClick={() => setActiveTab('chat')} 
              style={{ flex: 1, padding: '1rem', background: 'none', border: 'none', color: activeTab === 'chat' ? 'var(--accent)' : 'gray', borderBottom: activeTab === 'chat' ? '2px solid var(--accent)' : 'none', cursor: 'pointer', fontWeight: 'bold', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px' }}
            >
              <IconChat /> Chat de Dudas
            </button>
            <button 
              onClick={() => setActiveTab('flashcards')} 
              style={{ flex: 1, padding: '1rem', background: 'none', border: 'none', color: activeTab === 'flashcards' ? 'var(--accent)' : 'gray', borderBottom: activeTab === 'flashcards' ? '2px solid var(--accent)' : 'none', cursor: 'pointer', fontWeight: 'bold', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px' }}
            >
              <IconCards /> Flashcards (Repaso)
            </button>
          </div>

          {/* CONTENIDO TABS */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', position: 'relative' }}>
            
            {/* --- VISTA CHAT --- */}
            {activeTab === 'chat' && (
              <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <div style={{ flex: 1, overflowY: 'auto', marginBottom: '1rem' }}>
                  {chatHistory.map((msg, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start', marginBottom: '1rem' }}>
                      <div style={{ maxWidth: '80%', padding: '12px 16px', borderRadius: '12px', background: msg.role === 'user' ? 'var(--primary)' : 'rgba(255,255,255,0.1)', color: 'white', borderTopLeftRadius: msg.role === 'user' ? '12px' : '0', borderTopRightRadius: msg.role === 'user' ? '0' : '12px' }}>
                        {msg.content}
                      </div>
                    </div>
                  ))}
                  {loadingChat && <div style={{color:'gray', fontStyle:'italic'}}>Escribiendo...</div>}
                </div>
                <form onSubmit={handleAsk} style={{ display: 'flex', gap: '10px' }}>
                  <input 
                    className="login-input" 
                    value={question} 
                    onChange={e => setQuestion(e.target.value)} 
                    placeholder="Pregunta sobre los documentos..." 
                    style={{marginBottom:0}}
                  />
                  <button type="submit" className="btn-primary" style={{padding:'0 1.5rem'}}><IconSend /></button>
                </form>
              </div>
            )}

            {/* --- VISTA FLASHCARDS --- */}
            {activeTab === 'flashcards' && (
              <div style={{ display: 'flex', flexDirection: 'column', height: '100%', alignItems: 'center' }}>
                {flashcards.length === 0 ? (
                  <div style={{textAlign:'center', marginTop:'2rem'}}>
                    <div style={{margin:'0 auto', width:'60px', color:'var(--text-gray)', marginBottom:'1rem'}}><IconCards /></div>
                    <h3 style={{color:'white'}}>Generador de Repaso</h3>
                    <p style={{color:'gray', maxWidth:'400px', margin:'0 auto 2rem auto'}}>
                      La IA analizará los documentos seleccionados y creará tarjetas de memoria para que estudies los conceptos clave.
                    </p>
                    <button onClick={handleGenerateCards} className="btn-primary" disabled={loadingCards} style={{display:'flex', alignItems:'center', gap:'8px'}}>
                      <IconSparkles /> {loadingCards ? 'Generando...' : 'Crear Flashcards con IA'}
                    </button>
                  </div>
                ) : (
                  <div style={{ width: '100%', maxWidth: '500px' }}>
                    <div style={{display:'flex', justifyContent:'space-between', marginBottom:'1rem', alignItems:'center'}}>
                       <h3 style={{margin:0, color:'white'}}>Tu sesión de estudio</h3>
                       <button onClick={handleGenerateCards} style={{background:'none', border:'none', color:'var(--accent)', cursor:'pointer', display:'flex', alignItems:'center', gap:'5px'}}>
                         <IconRefresh /> Regenerar
                       </button>
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                      {flashcards.map((card, index) => (
                        <div 
                          key={index} 
                          onClick={() => handleFlip(index)}
                          style={{ height: '200px', perspective: '1000px', cursor: 'pointer' }}
                        >
                          <div style={{
                            position: 'relative', width: '100%', height: '100%', transition: 'transform 0.6s', transformStyle: 'preserve-3d',
                            transform: flippedCards[index] ? 'rotateY(180deg)' : 'rotateY(0deg)'
                          }}>
                            {/* FRENTE */}
                            <div style={{
                              position: 'absolute', width: '100%', height: '100%', backfaceVisibility: 'hidden',
                              background: 'linear-gradient(135deg, #1e293b, #0f172a)', border: '1px solid var(--primary)', borderRadius: '16px',
                              display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', textAlign: 'center',
                              boxShadow: '0 10px 25px rgba(0,0,0,0.3)'
                            }}>
                              <div>
                                <span style={{fontSize:'0.8rem', textTransform:'uppercase', color:'var(--primary)', letterSpacing:'1px'}}>Pregunta {index+1}</span>
                                <p style={{fontSize:'1.2rem', fontWeight:'bold', color:'white', marginTop:'10px'}}>{card.question}</p>
                                <span style={{fontSize:'0.7rem', color:'gray', position:'absolute', bottom:'15px', left:0, right:0}}>Clic para ver respuesta</span>
                              </div>
                            </div>
                            {/* ATRÁS */}
                            <div style={{
                              position: 'absolute', width: '100%', height: '100%', backfaceVisibility: 'hidden',
                              background: 'linear-gradient(135deg, var(--accent), var(--primary))', borderRadius: '16px',
                              display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', textAlign: 'center',
                              transform: 'rotateY(180deg)', color: 'white', boxShadow: '0 10px 25px rgba(0,0,0,0.3)'
                            }}>
                              <div>
                                <span style={{fontSize:'0.8rem', textTransform:'uppercase', color:'rgba(255,255,255,0.8)', letterSpacing:'1px'}}>Respuesta</span>
                                <p style={{fontSize:'1.1rem', marginTop:'10px'}}>{card.answer}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}