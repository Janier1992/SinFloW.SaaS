"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { Quote } from "lucide-react";
import { getApprovedTestimonials, Testimonial, addTestimonial } from "@/lib/adminState";

export function Testimonials() {
    const [testimonialsList, setTestimonialsList] = useState<Testimonial[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [rating, setRating] = useState(5);
    const [author, setAuthor] = useState("");
    const [role, setRole] = useState("");
    const [service, setService] = useState("Consultoría e Inteligencia Artificial");
    const [content, setContent] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setErrorMessage("");
        try {
            const result = await addTestimonial({
                author,
                role,
                content,
                image: `https://randomuser.me/api/portraits/${Math.random() > 0.5 ? 'men' : 'women'}/${Math.floor(Math.random() * 90) + 1}.jpg`,
                rating,
                service
            });
            if (result) {
                setSuccessMessage("Tu opinión ha sido registrada exitosamente. Un administrador la revisará y aprobará pronto.");
                setAuthor("");
                setRole("");
                setContent("");
                setRating(5);
            } else {
                setErrorMessage("No se pudo guardar tu testimonio. Inténtalo de nuevo más tarde.");
            }
        } catch (err: any) {
            console.error("Error al enviar testimonio:", err);
            setErrorMessage("Error de conexión al enviar el testimonio.");
        } finally {
            setIsLoading(false);
        }
    };

    const loadTestimonials = async () => {
        try {
            const data = await getApprovedTestimonials();
            setTestimonialsList(data);
        } catch (err) {
            console.error("Error al cargar testimonios:", err);
        }
    };

    useEffect(() => {
        // Fetch testimonials after initial render tick to prevent cascading render warnings
        const timer = setTimeout(() => {
            loadTestimonials();
        }, 0);

        // Listen for admin changes to testimonials
        const handleStateUpdate = () => {
            loadTestimonials();
        };
        window.addEventListener("crm_state_updated", handleStateUpdate);
        return () => {
            clearTimeout(timer);
            window.removeEventListener("crm_state_updated", handleStateUpdate);
        };
    }, []);

    return (
        <section id="testimonios" className="py-24 relative overflow-hidden">
            {/* Background Gradients */}
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-sinflow-secondary/20 to-transparent" />
            <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-sinflow-secondary/20 to-transparent" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16 text-center">
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-3xl sm:text-5xl font-bold text-white mb-6"
                >
                    Lo que dicen nuestros <span className="text-sinflow-secondary">Aliados</span>
                </motion.h2>
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 }}
                    className="text-lg text-gray-400 max-w-2xl mx-auto mb-8"
                >
                    Empresas que confían en nuestra tecnología para liderar sus industrias.
                </motion.p>
                
                <motion.button
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    onClick={() => setIsModalOpen(true)}
                    className="px-6 py-2.5 rounded-full bg-white/5 border border-white/10 hover:border-sinflow-secondary/40 text-white font-medium text-sm transition-all hover:bg-white/10"
                >
                    Dejar mi Opinión / Calificación ⭐
                </motion.button>
            </div>

            {/* Marquee Container */}
            <div className="relative w-full overflow-hidden mask-linear-gradient mb-12">
                {/* Gradient Masks for edges */}
                <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-sinflow-primary z-10" />
                <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-sinflow-primary z-10" />

                <div className="flex overflow-hidden">
                    {testimonialsList.length === 0 ? (
                        <div className="w-full text-center py-8 text-gray-500 italic">No hay testimonios aprobados para mostrar.</div>
                    ) : (
                        <>
                            <TranslateWrapper>
                                {testimonialsList.map((testimonial, i) => (
                                    <TestimonialCard key={testimonial.id || i} {...testimonial} />
                                ))}
                            </TranslateWrapper>
                            <TranslateWrapper>
                                {testimonialsList.map((testimonial, i) => (
                                    <TestimonialCard key={`clone-${testimonial.id || i}`} {...testimonial} />
                                ))}
                            </TranslateWrapper>
                        </>
                    )}
                </div>
            </div>

            {/* Modal de Opinión */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="w-full max-w-lg bg-gray-900 border border-white/10 rounded-3xl p-6 sm:p-8 relative shadow-2xl overflow-y-auto max-h-[90vh]"
                    >
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                        >
                            ✕
                        </button>
                        <h3 className="text-2xl font-bold text-white mb-2">Comparte tu Experiencia</h3>
                        <p className="text-sm text-gray-400 mb-6">Tu opinión nos ayuda a mejorar y permite a otros conocer el valor de SynFlow IA.</p>

                        {successMessage ? (
                            <div className="text-center py-8">
                                <div className="w-16 h-16 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mx-auto mb-4">
                                    ✓
                                </div>
                                <h4 className="text-xl font-bold text-white mb-2">¡Gracias por tu opinión!</h4>
                                <p className="text-gray-400 text-sm">{successMessage}</p>
                                <button
                                    onClick={() => {
                                        setIsModalOpen(false);
                                        setSuccessMessage("");
                                    }}
                                    className="mt-6 px-6 py-2 bg-gradient-to-r from-sinflow-secondary to-sinflow-accent text-white font-bold rounded-xl hover:opacity-95 transition-opacity"
                                >
                                    Entendido
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">¿Cómo calificarías el servicio?</label>
                                    <div className="flex gap-2 text-2xl">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                                key={star}
                                                type="button"
                                                onClick={() => setRating(star)}
                                                className={`transition-transform hover:scale-110 ${star <= rating ? "text-yellow-400" : "text-gray-600"}`}
                                            >
                                                ★
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="opinion-author" className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Nombre Completo</label>
                                    <input
                                        type="text"
                                        id="opinion-author"
                                        required
                                        value={author}
                                        onChange={(e) => setAuthor(e.target.value)}
                                        placeholder="Ej. Juan Gómez"
                                        className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-sinflow-secondary/50 transition-all text-sm"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="opinion-role" className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Cargo / Empresa</label>
                                    <input
                                        type="text"
                                        id="opinion-role"
                                        required
                                        value={role}
                                        onChange={(e) => setRole(e.target.value)}
                                        placeholder="Ej. Gerente de Tecnología, Ruta N"
                                        className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-sinflow-secondary/50 transition-all text-sm"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="opinion-service" className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Servicio Recibido</label>
                                    <select
                                        id="opinion-service"
                                        required
                                        value={service}
                                        onChange={(e) => setService(e.target.value)}
                                        className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-sinflow-secondary/50 transition-all text-sm cursor-pointer [&>option]:bg-gray-900"
                                    >
                                        <option value="Consultoría e Inteligencia Artificial">Consultoría e Inteligencia Artificial</option>
                                        <option value="Automatización (RPA & IA)">Automatización Inteligente</option>
                                        <option value="Analítica de Datos & BI">Analítica de Datos & BI</option>
                                        <option value="Desarrollo a Medida">Desarrollo a Medida</option>
                                        <option value="Desarrollo de Agentes y Chatbots">Agentes Inteligentes y Chatbots</option>
                                        <option value="Otro / Contacto General">Otro / Contacto General</option>
                                    </select>
                                </div>

                                <div>
                                    <label htmlFor="opinion-content" className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Tu Opinión</label>
                                    <textarea
                                        id="opinion-content"
                                        required
                                        rows={4}
                                        value={content}
                                        onChange={(e) => setContent(e.target.value)}
                                        placeholder="Describe cómo te ayudamos a potenciar tu negocio..."
                                        className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-sinflow-secondary/50 transition-all text-sm resize-none"
                                    />
                                </div>

                                {errorMessage && (
                                    <p className="text-red-400 text-xs">{errorMessage}</p>
                                )}

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full py-3 bg-gradient-to-r from-sinflow-secondary to-sinflow-accent text-white font-bold rounded-xl hover:opacity-95 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {isLoading ? "Enviando..." : "Enviar Opinión"}
                                </button>
                            </form>
                        )}
                    </motion.div>
                </div>
            )}
        </section>
    );
}

function TranslateWrapper({ children }: { children: React.ReactNode }) {
    return (
        <motion.div
            initial={{ x: "0%" }}
            animate={{ x: "-100%" }}
            transition={{
                duration: 30, // Speed of scroll
                ease: "linear",
                repeat: Infinity,
            }}
            className="flex gap-8 px-4 flex-shrink-0"
        >
            {children}
        </motion.div>
    );
}

function TestimonialCard({ content, author, role, image }: { content: string, author: string, role: string, image: string }) {
    return (
        <div className="w-[350px] sm:w-[450px] p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:border-sinflow-secondary/30 transition-colors flex-shrink-0 flex flex-col justify-between">
            <div className="mb-6">
                <Quote className="w-10 h-10 text-sinflow-secondary/50 mb-4" />
                <p className="text-lg text-gray-300 italic leading-relaxed">&ldquo;{content}&rdquo;</p>
            </div>

            <div className="flex items-center gap-4">
                <div className="relative w-12 h-12 rounded-full overflow-hidden border border-white/20">
                    <Image
                        src={image}
                        alt={author}
                        fill
                        className="object-cover"
                    />
                </div>
                <div>
                    <h4 className="font-semibold text-white">{author}</h4>
                    <p className="text-sm text-sinflow-secondary">{role}</p>
                </div>
            </div>
        </div>
    )
}
