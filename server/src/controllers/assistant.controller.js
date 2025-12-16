import prisma from '../prismaClient.js';
import OpenAI from 'openai';

// Configuración de OpenAI (Intenta leer la key, si falla no crashea todo el app, solo el chat)
let openai;
try {
  if (process.env.OPENAI_API_KEY) {
    openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
} catch (error) {
  console.error("Error al inicializar OpenAI:", error);
}

export const chatWithIA = async (req, res) => {
  try {
    const { question, materialIds } = req.body;

    // 1. Validaciones básicas
    if (!openai) {
      return res.status(500).json({ answer: "Error: No hay API KEY de OpenAI configurada en el servidor (.env)." });
    }
    if (!question || !materialIds || materialIds.length === 0) {
      return res.status(400).json({ answer: "Por favor selecciona materiales y haz una pregunta." });
    }

    // 2. Buscar el contenido de los materiales seleccionados
    const materials = await prisma.material.findMany({
      where: {
        id: { in: materialIds }
      },
      select: {
        title: true,
        content: true // Aquí está el texto que extrajimos de los PDFs
      }
    });

    if (materials.length === 0) {
      return res.status(404).json({ answer: "No encontré los materiales seleccionados." });
    }

    // 3. Preparar el contexto para la IA
    // Juntamos todo el texto de los PDFs en un solo bloque
    let contextText = materials.map(m => `--- DOCUMENTO: ${m.title} ---\n${m.content}`).join("\n\n");
    
    // Recortar texto si es demasiado largo (para no gastar tokens infinitos o dar error)
    if (contextText.length > 20000) {
        contextText = contextText.substring(0, 20000) + "... [Texto truncado]";
    }

    // 4. Enviar a OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // O "gpt-4" si tienes acceso
      messages: [
        { 
          role: "system", 
          content: `Eres un asistente de estudio útil y preciso. 
          Tu tarea es responder a la pregunta del estudiante BASÁNDOTE ÚNICAMENTE en el contexto proporcionado abajo.
          Si la respuesta no está en el contexto, di amablemente que no encuentras esa información en los documentos.
          
          CONTEXTO DE ESTUDIO:
          ${contextText}` 
        },
        { role: "user", content: question }
      ],
      temperature: 0.3, // Baja temperatura para que sea más fiel al texto
    });

    const answer = completion.choices[0].message.content;

    // 5. Responder al Frontend
    res.json({ answer });

  } catch (error) {
    console.error("Error en chatWithIA:", error);
    // Devolver un mensaje amigable en lugar de un error 500 crudo
    res.status(500).json({ answer: "Lo siento, hubo un error al procesar tu solicitud con la IA. Revisa la terminal del servidor." });
  }
};

export const generateFlashcards = async (req, res) => {
  try {
    const { materialIds } = req.body;
    
    if (!openai) return res.status(500).json([]);

    const materials = await prisma.material.findMany({
      where: { id: { in: materialIds } },
      select: { title: true, content: true }
    });

    let contextText = materials.map(m => `--- DOC: ${m.title} ---\n${m.content}`).join("\n\n").substring(0, 15000);

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `Genera exactamente 4 tarjetas de estudio (Flashcards) basadas en el texto proporcionado.
          El formato de salida DEBE ser un JSON puro (Array de objetos) con esta estructura exacta:
          [{"question": "Pregunta...", "answer": "Respuesta..."}, ...]
          No añadas texto extra, solo el JSON.`
        },
        { role: "user", content: `Texto: ${contextText}` }
      ]
    });

    // Limpieza básica por si la IA devuelve texto antes del JSON
    const cleanJson = completion.choices[0].message.content.replace(/```json|```/g, '').trim();
    const flashcards = JSON.parse(cleanJson);

    res.json(flashcards);

  } catch (error) {
    console.error("Error generando flashcards:", error);
    res.status(500).json([]);
  }
};