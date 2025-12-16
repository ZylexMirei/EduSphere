import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { toast } from 'react-hot-toast';

// --- ESTILOS EN JAVASCRIPT (PARA QUE NO FALLEN NUNCA) ---
const styles = {
  container: { height: 'calc(100vh - 80px)', display: 'flex', flexDirection: 'column', background: '#111827', color: 'white', padding: '20px', fontFamily: 'sans-serif' },
  header: { marginBottom: '20px' },
  title: { fontSize: '2rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '15px', margin: 0 },
  subtitle: { color: '#9ca3af', marginLeft: '60px', marginTop: '5px' },
  mainGrid: { display: 'flex', gap: '20px', flex: 1, overflow: 'hidden' }, // Layout principal
  leftPanel: { width: '25%', minWidth: '250px', background: '#1f2937', borderRadius: '16px', border: '1px solid #374151', display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  rightPanel: { flex: 1, background: '#1f2937', borderRadius: '16px', border: '1px solid #374151', display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  panelHeader: { padding: '15px', borderBottom: '1px solid #374151', background: 'rgba(31, 41, 55, 0.5)' },
  listContainer: { flex: 1, overflowY: 'auto', padding: '15px' },
  item: { display: 'flex', gap: '10px', padding: '12px', borderRadius: '8px', cursor: 'pointer', marginBottom: '8px', border: '1px solid transparent', transition: 'all 0.2s' },
  itemSelected: { background: 'rgba(37, 99, 235, 0.2)', borderColor: 'rgba(59, 130, 246, 0.5)' },
  tabs: { display: 'flex', borderBottom: '1px solid #374151' },
  tabButton: { flex: 1, padding: '15px', background: 'transparent', border: 'none', color: '#9ca3af', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', fontSize: '1rem', borderBottom: '3px solid transparent' },
  tabActive: { color: '#60a5fa', borderBottom: '3px solid #60a5fa', background: 'rgba(31, 41, 55, 0.8)' },
  chatArea: { flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px' },
  messageRow: { display: 'flex', marginBottom: '10px' },
  bubble: { padding: '12px 18px', borderRadius: '12px', maxWidth: '80%', lineHeight: '1.5' },
  bubbleUser: { background: '#2563eb', color: 'white', borderBottomRightRadius: '0' },
  bubbleAi: { background: '#374151', color: '#e5e7eb', border: '1px solid #4b5563', borderBottomLeftRadius: '0' },
  inputArea: { padding: '20px', borderTop: '1px solid #374151', background: '#1f2937' },
  inputForm: { display: 'flex', gap: '10px' },
  input: { flex: 1, background: '#111827', border: '1px solid #4b5563', borderRadius: '10px', padding: '15px', color: 'white', fontSize: '1rem', outline: 'none' },
  btnSend: { background: '#2563eb', color: 'white', border: 'none', borderRadius: '10px', padding: '0 25px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
};

// --- ICONOS SVG ---
const IconBot = () => <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/><line x1="8" y1="16" x2="8" y2="16"/><line x1="16" y1="16" x2="16" y2="16"/></svg>;
const IconCards = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>;
const IconChat = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>;
const IconSend = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>;

export default function StudentAssistantPage() {
  const [materials, setMaterials] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [activeTab, setActiveTab] = useState('chat');
  
  // Chat
  const [question, setQuestion] = useState('');
  const [chatHistory, setChatHistory] = useState([
    { role: 'assistant', content: '¡Hola! Soy tu IA educativa. Selecciona documentos a la izquierda y hazme una pregunta.' }
  ]);
  const [loadingChat, setLoadingChat] = useState(false);
  const chatEndRef = useRef(null);

  // Flashcards
  const [flashcards, setFlashcards] = useState([]);
  const [loadingCards, setLoadingCards] = useState(false);
  const [flippedCards, setFlippedCards] = useState({});

  useEffect(() => {
    fetchMaterials();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, loadingChat]);

  const fetchMaterials = async () => {
    try {
      const res = await api.get('/materials');
      setMaterials(res.data);
    } catch (error) {
      console.error("Error cargando materiales", error);
    }
  };

  const toggleMaterial = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleAsk = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;
    if (selectedIds.length === 0) return toast.error("Selecciona al menos un material.");
    
    const userMsg = { role: 'user', content: question };
    setChatHistory(prev => [...prev, userMsg]);
    setQuestion('');
    setLoadingChat(true);

    try {
      const res = await api.post('/assistant/chat', { question: userMsg.content, materialIds: selectedIds });
      setChatHistory(prev => [...prev, { role: 'assistant', content: res.data.answer }]);
    } catch (err) {
      setChatHistory(prev => [...prev, { role: 'assistant', content: 'Error al conectar con la IA.' }]);
    } finally {
      setLoadingChat(false);
    }
  };

  const handleGenerateCards = async () => {
    if (selectedIds.length === 0) return toast.error("Selecciona materiales primero.");
    setLoadingCards(true);
    setFlippedCards({});
    try {
      const res = await api.post('/assistant/flashcards', { materialIds: selectedIds });
      setFlashcards(res.data);
    } catch (err) {
      toast.error("Error generando tarjetas.");
    } finally {
      setLoadingCards(false);
    }
  };

  const handleFlip = (index) => {
    setFlippedCards(prev => ({ ...prev, [index]: !prev[index] }));
  };

  return (
    <div style={styles.container}>
      
      {/* HEADER */}
      <div style={styles.header}>
        <h1 style={styles.title}>
          <div style={{background:'#2563eb', padding:'8px', borderRadius:'8px', display:'flex'}}><IconBot /></div>
          Asistente Inteligente
        </h1>
        <p style={styles.subtitle}>Tu compañero de estudio con IA. Selecciona fuentes y pregunta.</p>
      </div>

      {/* GRID PRINCIPAL */}
      <div style={styles.mainGrid}>
        
        {/* PANEL IZQUIERDO: MATERIALES */}
        <div style={styles.leftPanel}>
          <div style={styles.panelHeader}>
            <h3 style={{margin:0, color:'#60a5fa', fontSize:'0.9rem', textTransform:'uppercase', letterSpacing:'1px'}}>1. Elige Fuentes</h3>
          </div>
          <div style={styles.listContainer}>
            {materials.length === 0 && <p style={{color:'gray', textAlign:'center'}}>No hay materiales.</p>}
            {materials.map(mat => {
              const isSelected = selectedIds.includes(mat.id);
              return (
                <div 
                  key={mat.id} 
                  onClick={() => toggleMaterial(mat.id)}
                  style={{...styles.item, ...(isSelected ? styles.itemSelected : {})}}
                >
                  <input 
                    type="checkbox" 
                    checked={isSelected}
                    onChange={() => {}} // Manejado por el div padre
                    style={{accentColor:'#2563eb', cursor:'pointer'}}
                  />
                  <span style={{color: isSelected ? '#dbeafe' : '#9ca3af', fontSize:'0.9rem', fontWeight: isSelected ? 'bold':'normal'}}>{mat.title}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* PANEL DERECHO: INTERACCIÓN */}
        <div style={styles.rightPanel}>
          
          {/* TABS */}
          <div style={styles.tabs}>
            <button 
              onClick={() => setActiveTab('chat')} 
              style={{...styles.tabButton, ...(activeTab === 'chat' ? styles.tabActive : {})}}
            >
              <IconChat /> Chat de Dudas
            </button>
            <button 
              onClick={() => setActiveTab('flashcards')} 
              style={{...styles.tabButton, ...(activeTab === 'flashcards' ? styles.tabActive : {})}}
            >
              <IconCards /> Flashcards
            </button>
          </div>

          {/* CONTENIDO */}
          <div style={{flex:1, overflow:'hidden', position:'relative', display:'flex', flexDirection:'column'}}>
            
            {/* VISTA CHAT */}
            {activeTab === 'chat' && (
              <>
                <div style={styles.chatArea}>
                  {chatHistory.map((msg, idx) => (
                    <div key={idx} style={{...styles.messageRow, justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start'}}>
                      <div style={{...styles.bubble, ...(msg.role === 'user' ? styles.bubbleUser : styles.bubbleAi)}}>
                        {msg.content}
                      </div>
                    </div>
                  ))}
                  {loadingChat && <div style={{color:'gray', fontStyle:'italic', marginLeft:'20px'}}>Escribiendo...</div>}
                  <div ref={chatEndRef} />
                </div>

                <div style={styles.inputArea}>
                  <form onSubmit={handleAsk} style={styles.inputForm}>
                    <input
                      style={styles.input}
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      placeholder={selectedIds.length > 0 ? "Escribe tu pregunta..." : "⬅ Selecciona materiales primero"}
                      disabled={loadingChat}
                    />
                    <button type="submit" style={{...styles.btnSend, opacity: (selectedIds.length === 0 || loadingChat) ? 0.5 : 1}} disabled={selectedIds.length === 0 || loadingChat}>
                      <IconSend />
                    </button>
                  </form>
                </div>
              </>
            )}

            {/* VISTA FLASHCARDS */}
            {activeTab === 'flashcards' && (
              <div style={{flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'20px'}}>
                 {flashcards.length === 0 ? (
                   <div style={{textAlign:'center'}}>
                     <h3 style={{fontSize:'1.5rem', marginBottom:'10px'}}>Generador de Repaso</h3>
                     <p style={{color:'gray', marginBottom:'20px'}}>Crea tarjetas de memoria con IA.</p>
                     <button onClick={handleGenerateCards} style={{...styles.btnSend, padding:'12px 30px'}}>
                       {loadingCards ? 'Generando...' : 'Crear Flashcards'}
                     </button>
                   </div>
                 ) : (
                   <div style={{width:'100%', maxWidth:'600px', height:'100%', overflowY:'auto'}}>
                     <div style={{display:'flex', justifyContent:'space-between', marginBottom:'10px'}}>
                        <h3>Tu sesión</h3>
                        <button onClick={handleGenerateCards} style={{background:'none', border:'none', color:'#60a5fa', cursor:'pointer'}}>Regenerar</button>
                     </div>
                     {flashcards.map((card, idx) => (
                       <div key={idx} onClick={() => handleFlip(idx)} style={{marginBottom:'15px', cursor:'pointer', perspective:'1000px'}}>
                         <div style={{
                           padding:'30px', borderRadius:'12px', background: flippedCards[idx] ? 'linear-gradient(135deg, #1e3a8a, #111827)' : '#1f2937', 
                           border:'1px solid #374151', minHeight:'150px', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', textAlign:'center',
                           transition: 'transform 0.6s', transformStyle: 'preserve-3d'
                         }}>
                            <span style={{fontSize:'0.8rem', color:'#60a5fa', textTransform:'uppercase', marginBottom:'10px'}}>
                              {flippedCards[idx] ? 'Respuesta' : `Pregunta ${idx+1}`}
                            </span>
                            <p style={{fontSize:'1.1rem'}}>{flippedCards[idx] ? card.answer : card.question}</p>
                         </div>
                       </div>
                     ))}
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