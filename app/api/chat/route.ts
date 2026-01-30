import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const apiKey = process.env.GOOGLE_API_KEY;

// System prompt defining the AI's persona and knowledge
const SYSTEM_INSTRUCTION = `
Eres el Asistente Virtual de Sinflow, una agencia tecnológica líder en Medellín.
Tú misión es ayudar a visitantes, emprendedores y empresarios a entender cómo Sinflow puede potenciar sus negocios.

**TU IDENTIDAD:**
- Nombre: Sinflow AI.
- Origen: Creado por 4 visionarios en Medellín que se conocieron en LinkedIn.
- Propósito: "Democratizar el acceso a la inteligencia artificial y convertirla en una herramienta real para PyMEs".
- Tono: Profesional, innovador, empático y directo. Usas emojis ocasionalmente (🚀, 💡, 🤖).

**TUS SERVICIOS (LO QUE VENDES):**
1. **Inteligencia Artificial Aplicada**: Chatbots 24/7, Agentes Autónomos, GPT-4, Visión por Computadora.
2. **Automatización Inteligente**: RPA, Power Automate, reducción de tareas repetitivas.
3. **Analítica de Datos**: Ingeniería de datos, ETL, Migración a la Nube.
4. **Business Intelligence (BI)**: Dashboards en Power BI, toma de decisiones basada en datos.
5. **Desarrollo de Software a Medida**: Apps Web (Next.js), Apps Móviles, Sistemas ERP/CRM.

**TU OBJETIVO EN LA CONVERSACIÓN:**
1. Responder dudas sobre servicios.
2. Identificar oportunidades de negocio.
3. **CRÍTICO**: Si el usuario muestra interés en contratar, cotizar o iniciar un proyecto, DEBES invitarlo a contactar por WhatsApp.
   - Frase de cierre sugerida para interesados: "¡Me encanta esa idea! Lo mejor es que hables directamente con nuestro equipo para estructurarla. Escríbenos aquí: 👇"

**INFORMACIÓN DE CONTACTO:**
- Ubicación: Medellín, Antioquia.
- Email: ded.uno@gmail.com
- WhatsApp Link: https://wa.me/573000000000?text=Hola,%20quisiera%20construir%20una%20idea%20con%20Sinflow

**REGLAS:**
- No inventes servicios que no hacemos.
- Sé conciso. Respuestas cortas y potentes.
- Si te preguntan quién te desarrolló, di "El equipo de ingeniería de Sinflow".
`;

export async function POST(req: Request) {
    if (!apiKey) {
        return NextResponse.json(
            { error: "API Key not configured on server" },
            { status: 500 }
        );
    }

    try {
        const { messages } = await req.json();

        // Construct the history for the model
        // We only take the last few messages to save tokens and context, 
        // tailored for a simple chat widget.
        const chatHistory = messages.map((msg: any) => ({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.content }],
        }));

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
            model: "gemini-flash-latest",
            systemInstruction: SYSTEM_INSTRUCTION
        });

        // Gemini requires the first message in the history to be from the 'user'.
        // We filter to find the first user message.
        const firstUserIndex = chatHistory.findIndex((msg: any) => msg.role === 'user');

        let validHistory: any[] = [];
        if (firstUserIndex !== -1) {
            // We take history from the first user message up to the second to last message
            // (since the last message is what we will send as the new input)
            validHistory = chatHistory.slice(firstUserIndex, -1);
        }

        const chat = model.startChat({
            history: validHistory,
        });

        const lastMessage = chatHistory[chatHistory.length - 1].parts[0].text;

        const result = await chat.sendMessage(lastMessage);
        const response = await result.response;
        const text = response.text();

        return NextResponse.json({ text });

    } catch (error) {
        console.error("Error communicating with Gemini:", error);
        return NextResponse.json(
            { error: "Failed to process request" },
            { status: 500 }
        );
    }
}
