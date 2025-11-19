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