"use client";

import { useState, useRef, useEffect } from "react";
import { Send, MessageCircle, X, Loader2, Bot, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Turnstile } from "@marsidev/react-turnstile";

const SYSTEM_INSTRUCTION = `
Eres el Asistente Virtual de SynFlow IA, una agencia tecnológica líder en Medellín.
Tú misión es ayudar a visitantes, emprendedores y empresarios a entender cómo SynFlow IA puede potenciar sus negocios.

**TU IDENTIDAD:**
- Nombre: SynFlow IA.
- Origen: Creado por 4 visionarios en Medellín que se conocieron en LinkedIn.
- Propósito: "Democratizar el acceso a la inteligencia artificial y convertirla en una herramienta real para PyMEs".
- Tono: Profesional, innovador, empático y directo. Usas emojis ocasionalmente (🚀, 💡, 🤖).

**TUS SERVICIOS (LO QUE VENDES):**
1. **Inteligencia Artificial Aplicada**: Chatbots 24/7, Agentes Autónomos, GPT-4, Visión por Computadora.
2. **Automatización Inteligente**: RPA, Power Automate, reducción de tareas repetitivas.
3. **Analítica de Datos**: Ingeniería de datos, ETL, Migración a la Nube.
4. **Business Intelligence (BI)**: Dashboards en Power BI, toma de decisiones basadas en datos.
5. **Desarrollo de Software a Medida**: Apps Web (Next.js), Apps Móviles, Sistemas ERP/CRM.

**TU OBJETIVO EN LA CONVERSACIÓN:**
1. Responder dudas sobre servicios.
2. Identificar oportunidades de negocio.
3. **CRÍTICO**: Si el usuario muestra interés en cotizar, contratar o explícitamente pide hablar con alguien en directo, DEBES entregarle el enlace con nuestro contacto de WhatsApp.
   - Frase de cierre sugerida: "Para brindarte una atención más personalizada, puedes hablar en directo con nuestro equipo a través de WhatsApp en este enlace: https://wa.me/573044769593 (+57 304 476 9593)"

**INFORMACIÓN DE CONTACTO:**
- Ubicación: Medellín, Antioquia.
- Email: synflow.ia@gmail.com
- WhatsApp: +57 304 476 9593 (Enlace: https://wa.me/573044769593)

**REGLAS:**
- No inventes servicios que no hacemos.
- Sé conciso. Respuestas cortas y potentes.
- Si te preguntan quién te desarrolló, di "El equipo de ingeniería de SynFlow IA".
`;

export function ChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<{ role: "user" | "model"; content: string }[]>([
        { role: "model", content: "¡Hola! 👋 Soy SynFlow IA. ¿En qué puedo ayudarte hoy? Pregúntame sobre nuestros servicios o cómo podemos potenciar tu negocio." },
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage = input.trim();
        setInput("");
        setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
        setIsLoading(true);

        try {
            const body = {
                messages: [
                    ...messages.slice(1), // Exclude the initial greeting
                    { role: "user", content: userMessage }
                ],
                systemInstruction: SYSTEM_INSTRUCTION,
                turnstileToken: turnstileToken // Enviar token para validación backend
            };

            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body)
            });

            if (!response.ok) {
                const errorText = await response.text();
                // Check if it's a bot validation or rate limit error
                if (response.status === 403 || response.status === 429) {
                    throw new Error(errorText); // Mostrar el mensaje del servidor directly
                }
                throw new Error("Tuvimos un problema procesando tu solicitud.");
            }

            if (!response.body) {
                throw new Error("No response body from server");
            }

            // Add placeholder message for the AI response
            setMessages((prev) => [...prev, { role: "model", content: "" }]);

            const reader = response.body.getReader();
            const decoder = new TextDecoder("utf-8");
            let fullText = "";

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunkText = decoder.decode(value, { stream: true });
                fullText += chunkText;

                // Update the last message with the new chunk
                setMessages((prev) => {
                    const newMessages = [...prev];
                    newMessages[newMessages.length - 1].content = fullText;
                    return newMessages;
                });
            }

        } catch (error: unknown) {
            console.error("Chat Error:", error);
            const message = error instanceof Error ? error.message : "Error desconocido.";
            setMessages((prev) => [
                ...prev,
                { role: "model", content: "Lo siento, tuve un problema al conectar. " + message },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end sm:bottom-8 sm:right-8">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="mb-4 flex h-[500px] w-[350px] flex-col overflow-hidden rounded-2xl bg-gray-900 border border-sinflow-border shadow-2xl sm:w-[380px]"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between bg-sinflow-secondary/10 px-4 py-3 border-b border-sinflow-border/50">
                            <div className="flex items-center gap-2">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-sinflow-secondary to-sinflow-accent">
                                    <Bot className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-semibold text-sinflow-text-light">SynFlow IA</h3>
                                    <div className="flex items-center gap-1">
                                        <span className="relative flex h-2 w-2">
                                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
                                            <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500"></span>
                                        </span>
                                        <span className="text-xs text-sinflow-text-dim">En línea</span>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-sinflow-text-dim hover:text-sinflow-text-light transition-colors"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-sinflow-border scrollbar-track-transparent">
                            {messages.map((msg, idx) => (
                                <div
                                    key={idx}
                                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                                >
                                    <div
                                        className={`flex max-w-[85%] items-start gap-2 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"
                                            }`}
                                    >
                                        <div
                                            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-sinflow-border/50 ${msg.role === "user"
                                                ? "bg-sinflow-secondary/20 text-sinflow-secondary"
                                                : "bg-gray-800 text-gray-400"
                                                }`}
                                        >
                                            {msg.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                                        </div>
                                        <div
                                            className={`rounded-2xl px-4 py-2.5 text-sm shadow-sm ${msg.role === "user"
                                                ? "bg-sinflow-secondary text-white rounded-tr-none"
                                                : "bg-gray-800 border border-gray-700 text-gray-100 rounded-tl-none"
                                                }`}
                                        >
                                            {msg.content}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex justify-start">
                                    <div className="flex items-center gap-2 rounded-2xl bg-gray-800 px-4 py-3 border border-gray-700 rounded-tl-none">
                                        <Loader2 className="h-4 w-4 animate-spin text-sinflow-secondary" />
                                        <span className="text-xs text-sinflow-text-dim">Escribiendo...</span>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <form onSubmit={handleSubmit} className="border-t border-sinflow-border/50 bg-sinflow-bg p-4 flex flex-col gap-2">
                            {/* Turnstile Widget (Conditionally rendered when secret/sitekey exists) */}
                            {process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && (
                                <div className="flex justify-center scale-90 origin-bottom">
                                    <Turnstile
                                        siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
                                        onSuccess={(token) => setTurnstileToken(token)}
                                        options={{ theme: "dark", size: "compact" }}
                                    />
                                </div>
                            )}

                            <div className="relative flex items-center">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Escribe tu mensaje..."
                                    className="w-full rounded-xl bg-gray-900 border border-sinflow-border py-3 pl-4 pr-12 text-sm text-white placeholder:text-gray-400 focus:border-sinflow-secondary focus:outline-none focus:ring-1 focus:ring-sinflow-secondary/50 transition-all"
                                />
                                <button
                                    type="submit"
                                    disabled={isLoading || !input.trim() || (process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ? !turnstileToken : false)}
                                    className="absolute right-2 rounded-lg p-1.5 text-sinflow-secondary hover:bg-sinflow-secondary/10 disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
                                >
                                    <Send className="h-5 w-5" />
                                </button>
                            </div>
                            <div className="text-center text-[10px] text-sinflow-text-dim/50">
                                Potenciado por Gemini 2.5 Flash & SynFlow IA
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-sinflow-secondary to-sinflow-accent text-white shadow-lg shadow-sinflow-secondary/20 hover:shadow-xl hover:shadow-sinflow-secondary/30 transition-all"
            >
                {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-7 w-7" />}
            </motion.button>
        </div>
    );
}
