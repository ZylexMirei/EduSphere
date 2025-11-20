import prisma from '../prismaClient.js';
import OpenAI from 'openai';
import 'dotenv/config';

// 1. Inicializar el cliente de OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Responde una pregunta del estudiante usando el contexto de los materiales.
 * Solo para Estudiantes.
 */
export const queryAssistant = async (req, res) => {
  try {
    const { question, materialIds } = req.body;
    const studentId = req.user.userId;

    if (!question || !materialIds || !Array.isArray(materialIds) || materialIds.length === 0) {
      return res.status(400).json({ message: "La pregunta y un array de 'materialIds' son obligatorios." });
    }

    // 2. Obtener el contenido de los materiales desde la BD
    // (Aquí asumimos que el estudiante tiene permiso para verlos,
    // ya que puede ver la lista de materiales)
    const materials = await prisma.material.findMany({
      where: {
        id: { in: materialIds }
      }
    });

    if (materials.length === 0) {
      return res.status(404).json({ message: "No se encontró contenido en los materiales seleccionados." });
    }

    // 3. Crear el "Contexto" para la IA
    let context = "Contexto de estudio (responde basándote SOLO en esto):\n\n";
    materials.forEach(material => {
      context += `--- Material: ${material.title} ---\n`;
      context += `${material.content}\n\n`;
      // (Podríamos incluir 'attachments' si fueran texto, pero por ahora solo 'content')
    });

    // 4. Enviar la petición a la API de OpenAI
    const chatCompletion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // O "gpt-4" si tienes acceso
      messages: [
        {
          role: "system",
          content: `Eres "EduSphere", un asistente virtual de IA para estudiantes. Tu única tarea es responder preguntas basándote ESTRICTAMENTE en el contexto que te proporciona el usuario. Si la respuesta no está en el contexto, debes decir "Lo siento, no puedo encontrar esa información en los materiales de estudio proporcionados."`
        },
        {
          role: "user",
          content: `${context}\n\nPregunta del estudiante:\n${question}`
        }
      ],
      max_tokens: 500, // Limita la longitud de la respuesta
    });

    // 5. Devolver la respuesta de la IA al estudiante
    const assistantResponse = chatCompletion.choices[0].message.content;
    res.status(200).json({ answer: assistantResponse });

  } catch (error) {
    console.error("Error en el asistente de IA:", error);
    res.status(500).json({ message: "Error interno del servidor al procesar la pregunta." });
  }
};
export const generateFlashcards = async (req, res) => {
  try {
    const { materialIds } = req.body;
    
    // 1. Obtener contenido
    const materials = await prisma.material.findMany({
      where: { id: { in: materialIds } },
      select: { title: true, content: true }
    });

    if (materials.length === 0) return res.status(404).json({ message: "No hay materiales." });

    let context = materials.map(m => `Título: ${m.title}\nContenido: ${m.content}`).join('\n\n');

    // 2. Pedir JSON estricto a OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `Eres un profesor experto. Genera 5 tarjetas de estudio (flashcards) basadas en el texto proporcionado. 
          La salida DEBE ser un JSON válido con este formato exacto:
          [
            { "question": "Pregunta conceptual", "answer": "Respuesta breve y clara" },
            ...
          ]
          No incluyas texto adicional fuera del JSON.`
        },
        { role: "user", content: context }
      ],
    });

    // 3. Parsear la respuesta
    const rawContent = completion.choices[0].message.content;
    const flashcards = JSON.parse(rawContent); // Convertimos texto a objeto JS

    res.status(200).json(flashcards);

  } catch (error) {
    console.error("Error Flashcards:", error);
    res.status(500).json({ message: "Error al generar tarjetas." });
  }
};
export const generateFeedback = async (req, res) => {
  try {
    const { question, studentAnswer, correctAnswer } = req.body;
    
    if (!question || !studentAnswer) {
      return res.status(400).json({ message: "Faltan datos para generar feedback." });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `Eres un profesor amable y constructivo. Tu tarea es evaluar la respuesta de un estudiante y generar un feedback breve (máximo 2 frases).
          
          Si la respuesta es incorrecta, explica brevemente por qué y cuál era la correcta (si se proporciona).
          Si es correcta, felicítalo y refuerza el concepto.
          `
        },
        { 
          role: "user", 
          content: `Pregunta: "${question}"\nRespuesta del Estudiante: "${studentAnswer}"\nRespuesta Correcta (Contexto): "${correctAnswer || 'N/A'}"` 
        }
      ],
      max_tokens: 100,
    });

    const feedback = completion.choices[0].message.content;
    res.status(200).json({ feedback });

  } catch (error) {
    console.error("Error Feedback IA:", error);
    res.status(500).json({ message: "Error al generar feedback." });
  }
};