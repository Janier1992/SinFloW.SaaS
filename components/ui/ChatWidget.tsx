"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, X, Send, Bot, User, Loader2 } from "lucide-react";

interface Message {
    role: "user" | "model";
    content: string;
}

export function ChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            role: "model",
            content: "¡Hola! 👋 Soy Sinflow AI. ¿En qué puedo ayudarte hoy? Pregúntame sobre nuestros servicios o cómo podemos potenciar tu negocio.",
        },
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
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
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    messages: [...messages, { role: "user", content: userMessage }],
                }),
            });

            const data = await response.json();

            if (data.text) {
                setMessages((prev) => [
                    ...prev,
                    { role: "model", content: data.text },
                ]);
            } else {
                setMessages((prev) => [
                    ...prev,
                    { role: "model", content: "Lo siento, tuve un problema al procesar tu solicitud. Por favor intenta de nuevo." },
                ]);
            }
        } catch (error) {
            console.error("Chat error:", error);
            setMessages((prev) => [
                ...prev,
                { role: "model", content: "Hubo un error de conexión. Verifica tu internet e intenta de nuevo." },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none group">
            {/* Container to allow pointer events only on interactive elements */}
            <div className="pointer-events-auto">
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="mb-4 w-[350px] sm:w-[380px] bg-gray-900 border border-sinflow-secondary/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[500px]"
                        >
                            {/* Header */}
                            <div className="bg-sinflow-primary/95 p-4 border-b border-white/10 flex items-center justify-between backdrop-blur-md">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-sinflow-secondary to-sinflow-accent flex items-center justify-center">
                                        <Bot className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white text-sm">Sinflow AI</h3>
                                        <div className="flex items-center gap-1.5">
                                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                            <span className="text-xs text-gray-400">En línea</span>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="text-gray-400 hover:text-white transition-colors p-1"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-950/50 min-h-[300px]">
                                {messages.map((msg, idx) => (
                                    <div
                                        key={idx}
                                        className={`flex items-start gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""
                                            }`}
                                    >
                                        <div
                                            className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === "user"
                                                    ? "bg-sinflow-secondary/20 text-sinflow-secondary"
                                                    : "bg-gray-800 text-gray-300"
                                                }`}
                                        >
                                            {msg.role === "user" ? (
                                                <User className="w-4 h-4" />
                                            ) : (
                                                <Bot className="w-4 h-4" />
                                            )}
                                        </div>
                                        <div
                                            className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${msg.role === "user"
                                                    ? "bg-sinflow-secondary text-white rounded-br-none"
                                                    : "bg-gray-800 text-gray-100 rounded-bl-none"
                                                }`}
                                        >
                                            <p className="whitespace-pre-wrap">{msg.content}</p>
                                        </div>
                                    </div>
                                ))}
                                {isLoading && (
                                    <div className="flex items-center gap-2 text-gray-400 text-xs ml-12">
                                        <Loader2 className="w-3 h-3 animate-spin" />
                                        <span>Escribiendo...</span>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input */}
                            <form
                                onSubmit={handleSubmit}
                                className="p-3 border-t border-white/10 bg-gray-900"
                            >
                                <div className="relative flex items-center">
                                    <input
                                        type="text"
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        placeholder="Escribe tu mensaje..."
                                        className="w-full bg-gray-800 text-white text-sm rounded-full pl-4 pr-12 py-3 focus:outline-none focus:ring-1 focus:ring-sinflow-secondary placeholder:text-gray-500 transition-all border border-transparent focus:border-sinflow-secondary/50"
                                    />
                                    <button
                                        type="submit"
                                        disabled={!input.trim() || isLoading}
                                        className="absolute right-1.5 p-2 bg-sinflow-secondary hover:bg-sinflow-accent text-white rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <Send className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="text-center mt-2">
                                    <p className="text-[10px] text-gray-500">
                                        Potenciado por Gemini 1.5 & Sinflow
                                    </p>
                                </div>
                            </form>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Toggle Button */}
                <motion.button
                    onClick={() => setIsOpen(!isOpen)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-14 h-14 rounded-full bg-gradient-to-r from-sinflow-secondary to-sinflow-accent flex items-center justify-center shadow-lg shadow-sinflow-secondary/20 text-white hover:shadow-sinflow-secondary/40 transition-shadow relative overflow-hidden"
                >
                    <div className="absolute inset-0 bg-white/20 blur-lg opacity-0 hover:opacity-100 transition-opacity" />
                    <AnimatePresence mode="wait">
                        {isOpen ? (
                            <motion.div
                                key="close"
                                initial={{ rotate: -90, opacity: 0 }}
                                animate={{ rotate: 0, opacity: 1 }}
                                exit={{ rotate: 90, opacity: 0 }}
                            >
                                <X className="w-6 h-6" />
                            </motion.div>
                        ) : (
                            <motion.div
                                key="open"
                                initial={{ rotate: 90, opacity: 0 }}
                                animate={{ rotate: 0, opacity: 1 }}
                                exit={{ rotate: -90, opacity: 0 }}
                            >
                                <div className="relative">
                                    <MessageSquare className="w-6 h-6" />
                                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                                    </span>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.button>
            </div>
        </div>
    );
}
