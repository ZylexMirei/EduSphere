import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api'; // Mantenemos tu servicio de API
import { toast } from 'react-hot-toast'; // Opcional: Para alertas bonitas

// --- ICONOS SVG (Componentes pequeños para no ensuciar) ---
const IconBot = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/><line x1="8" y1="16" x2="8" y2="16"/><line x1="16" y1="16" x2="16" y2="16"/></svg>;
const IconCards = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>;
const IconChat = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>;
const IconSend = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>;
const IconSparkles = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>;
const IconRefresh = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>;

// Botón de Pestaña Reutilizable
const TabButton = ({ active, onClick, icon, children }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-6 py-4 font-medium transition-all duration-200 border-b-2 flex-1 justify-center ${
      active
        ? 'border-blue-500 text-blue-400 bg-gray-800'
        : 'border-transparent text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
    }`}
  >
    {icon}
    <span>{children}</span>
  </button>
);

export default function StudentAssistantPage() {
  const [materials, setMaterials] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [activeTab, setActiveTab] = useState('chat');
  
  // Estados Chat
  const [question, setQuestion] = useState('');
  const [chatHistory, setChatHistory] = useState([
    { role: 'assistant', content: '¡Hola! Selecciona tus materiales a la izquierda y pregúntame lo que necesites.' }
  ]);
  const [loadingChat, setLoadingChat] = useState(false);
  const chatEndRef = useRef(null);

  // Estados Flashcards
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

  // --- LÓGICA CHAT ---
  const handleAsk = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;
    if (selectedIds.length === 0) return alert("Por favor selecciona al menos un material.");
    
    const userMsg = { role: 'user', content: question };
    setChatHistory(prev => [...prev, userMsg]);
    setQuestion('');
    setLoadingChat(true);

    try {
      const res = await api.post('/assistant/chat', { // Asegúrate que la ruta coincida con tu backend ('/chat' o '/query')
        question: userMsg.content, 
        materialIds: selectedIds 
      });
      const aiMsg = { role: 'assistant', content: res.data.answer };
      setChatHistory(prev => [...prev, aiMsg]);
    } catch (err) {
      setChatHistory(prev => [...prev, { role: 'assistant', content: 'Lo siento, hubo un error al procesar tu pregunta.' }]);
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
      setFlashcards(res.data); // Asumiendo que res.data es un array [{question, answer}, ...]
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
    <div className="h-[calc(100vh-64px)] flex flex-col bg-gray-900 text-white p-6 overflow-hidden">
      
      {/* HEADER */}
      <div className="mb-6 flex-none">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3 text-white">
          <div className="p-2 bg-blue-600 rounded-lg shadow-lg shadow-blue-500/20 text-white">
            <IconBot />
          </div>
          Asistente Inteligente
        </h1>
        <p className="text-gray-400 ml-14">Tu compañero de estudio con IA. Selecciona fuentes y pregunta.</p>
      </div>

      {/* GRID PRINCIPAL (25% IZQ - 75% DER) */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
        
        {/* COLUMNA IZQUIERDA: MATERIALES (Span 3 = 25%) */}
        <div className="lg:col-span-3 flex flex-col bg-gray-800 rounded-xl border border-gray-700 overflow-hidden shadow-lg">
          <div className="p-4 border-b border-gray-700 bg-gray-800/50">
            <h3 className="font-bold text-blue-400 uppercase tracking-wider text-sm">1. Elige Fuentes</h3>
          </div>
          
          <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
            {materials.length === 0 && <p className="text-gray-500 text-center text-sm mt-4">No hay materiales.</p>}
            
            {materials.map(mat => (
              <label 
                key={mat.id} 
                className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-all border ${
                  selectedIds.includes(mat.id) 
                    ? 'bg-blue-900/20 border-blue-500/50' 
                    : 'bg-gray-700/20 border-gray-700/50 hover:bg-gray-700/40'
                }`}
              >
                <input 
                  type="checkbox" 
                  checked={selectedIds.includes(mat.id)}
                  onChange={() => toggleMaterial(mat.id)}
                  className="mt-1 w-4 h-4 rounded border-gray-500 text-blue-500 focus:ring-blue-500 bg-gray-700"
                />
                <span className={`text-sm ${selectedIds.includes(mat.id) ? 'text-blue-100 font-medium' : 'text-gray-400'}`}>
                  {mat.title}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* COLUMNA DERECHA: INTERACCIÓN (Span 9 = 75%) */}
        <div className="lg:col-span-9 flex flex-col bg-gray-800 rounded-xl border border-gray-700 overflow-hidden shadow-2xl">
          
          {/* TABS */}
          <div className="flex border-b border-gray-700 bg-gray-800/80">
            <TabButton active={activeTab === 'chat'} onClick={() => setActiveTab('chat')} icon={<IconChat />}>
              Chat de Dudas
            </TabButton>
            <TabButton active={activeTab === 'flashcards'} onClick={() => setActiveTab('flashcards')} icon={<IconCards />}>
              Flashcards
            </TabButton>
          </div>

          {/* CONTENIDO TABS */}
          <div className="flex-1 overflow-hidden relative bg-gray-900/50">
            
            {/* --- VISTA CHAT --- */}
            {activeTab === 'chat' && (
              <div className="flex flex-col h-full">
                <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                  {chatHistory.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] rounded-2xl px-5 py-3 text-base shadow-sm ${
                        msg.role === 'user' 
                          ? 'bg-blue-600 text-white rounded-br-none' 
                          : 'bg-gray-700 text-gray-200 rounded-bl-none border border-gray-600'
                      }`}>
                        {msg.content}
                      </div>
                    </div>
                  ))}
                  {loadingChat && (
                    <div className="flex justify-start">
                      <div className="bg-gray-700 rounded-2xl px-4 py-2 flex gap-2 items-center border border-gray-600">
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></span>
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></span>
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                {/* Input Chat */}
                <div className="p-4 bg-gray-800 border-t border-gray-700">
                  <form onSubmit={handleAsk} className="flex gap-3">
                    <input
                      type="text"
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      placeholder={selectedIds.length > 0 ? "Escribe tu pregunta..." : "⬅ Selecciona materiales primero"}
                      disabled={selectedIds.length === 0 || loadingChat}
                      className="flex-1 bg-gray-900 border border-gray-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    <button
                      type="submit"
                      disabled={selectedIds.length === 0 || loadingChat}
                      className="bg-blue-600 hover:bg-blue-500 text-white rounded-xl px-6 font-medium transition-colors disabled:opacity-50 flex items-center shadow-lg"
                    >
                      <IconSend />
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* --- VISTA FLASHCARDS --- */}
            {activeTab === 'flashcards' && (
              <div className="h-full flex flex-col p-6 overflow-y-auto custom-scrollbar items-center">
                {flashcards.length === 0 ? (
                  <div className="text-center mt-20 max-w-md">
                    <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6 border border-gray-700 text-gray-400">
                      <IconCards />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3">Generador de Repaso</h3>
                    <p className="text-gray-400 mb-8">La IA analizará tus documentos seleccionados y creará tarjetas de memoria para estudiar.</p>
                    <button 
                      onClick={handleGenerateCards} 
                      disabled={loadingCards}
                      className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 mx-auto shadow-lg shadow-purple-900/20"
                    >
                      {loadingCards ? 'Generando...' : <><IconSparkles /> Crear Flashcards</>}
                    </button>
                  </div>
                ) : (
                  <div className="w-full max-w-3xl">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-bold text-white">Tu sesión de estudio</h3>
                      <button 
                        onClick={handleGenerateCards}
                        className="text-blue-400 hover:text-blue-300 flex items-center gap-2 text-sm font-medium transition-colors"
                      >
                        <IconRefresh /> Regenerar Mazo
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6">
                      {flashcards.map((card, index) => (
                        <div 
                          key={index}
                          onClick={() => handleFlip(index)}
                          className="h-64 cursor-pointer group perspective-1000"
                        >
                          <div className={`relative w-full h-full duration-500 preserve-3d transition-transform ${flippedCards[index] ? 'rotate-y-180' : ''}`}>
                            
                            {/* FRENTE */}
                            <div className="absolute w-full h-full backface-hidden bg-gray-800 border border-gray-600 rounded-xl p-6 flex flex-col items-center justify-center text-center shadow-lg group-hover:border-blue-500/50 transition-colors">
                              <span className="text-xs uppercase tracking-widest text-blue-400 mb-3 font-semibold">Pregunta {index + 1}</span>
                              <p className="text-lg font-medium text-gray-100">{card.question}</p>
                              <span className="absolute bottom-4 text-xs text-gray-500">Clic para ver respuesta</span>
                            </div>

                            {/* ATRÁS */}
                            <div className="absolute w-full h-full backface-hidden rotate-y-180 bg-gradient-to-br from-blue-900 to-gray-900 border border-blue-500/30 rounded-xl p-6 flex flex-col items-center justify-center text-center shadow-xl">
                              <span className="text-xs uppercase tracking-widest text-blue-300 mb-3 font-semibold">Respuesta</span>
                              <p className="text-base text-gray-200 leading-relaxed">{card.answer}</p>
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