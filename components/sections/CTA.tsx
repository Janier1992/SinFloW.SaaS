"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Check, Loader2, AlertCircle } from "lucide-react";
import { addLead } from "@/lib/adminState";

export function CTA() {
    const [formState, setFormState] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [errorMessage, setErrorMessage] = useState("");

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setFormState("loading");

        try {
            const formData = new FormData(e.currentTarget);
            const name = formData.get("name") as string;
            const email = formData.get("email") as string;
            const phone = formData.get("phone") as string;
            const company = formData.get("company") as string | null;
            const service = formData.get("service") as string;
            const description = formData.get("description") as string;

            // Sincronizar lead con el gestor de estado (Supabase / LocalStorage)
            const newLead = await addLead({
                name,
                email,
                phone,
                company: company || undefined,
                service,
                description
            });

            if (!newLead) {
                throw new Error("No se pudo guardar la solicitud en el CRM. Por favor, verifica la conexión o intenta más tarde.");
            }

            // Disparar envíos de correo en segundo plano (asíncronos) para optimizar la velocidad del usuario
            fetch("/api/send-email", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    type: "new_lead",
                    to: "synflow.ia@gmail.com",
                    data: { name, email, phone, company: company || undefined, service, description }
                })
            }).catch(err => console.error("Error enviando correo del lead:", err));

            fetch("/api/send-email", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    type: "client_confirm",
                    to: email,
                    data: { name, service }
                })
            }).catch(err => console.error("Error enviando confirmación al cliente:", err));

            setFormState("success");
        } catch (error: unknown) {
            setFormState("error");
            const message = error instanceof Error ? error.message : "Ocurrió un error inesperado al enviar los datos.";
            setErrorMessage(message);
        }
    };

    return (
        <section id="contacto" className="py-24 relative overflow-hidden">
            <div className="absolute inset-0 bg-sinflow-secondary/5" />

            {/* Ambient Background */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-sinflow-accent/10 blur-[130px] rounded-full pointer-events-none" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="grid lg:grid-cols-2 gap-12 items-center">

                    {/* Left Column: Text */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="text-left"
                    >
                        <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6 leading-tight">
                            ¿Listo para <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sinflow-secondary to-sinflow-accent">
                                Escalar tu Negocio?
                            </span>
                        </h2>
                        <p className="text-xl text-gray-400 mb-8 max-w-lg">
                            Descubre cómo podemos ayudarte a que por medio de la inteligencia artificial cuentes con soluciones a la medida para tu negocio y que estas puedan transformar las operaciones desde hoy mismo.
                        </p>

                        <div className="flex flex-col gap-4 text-gray-300">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-sinflow-secondary/10 flex items-center justify-center text-sinflow-secondary">
                                    <Check className="w-5 h-5" />
                                </div>
                                <span>Consultoría inicial gratuita</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-sinflow-secondary/10 flex items-center justify-center text-sinflow-secondary">
                                    <Check className="w-5 h-5" />
                                </div>
                                <span>Arquitectura escalable y segura</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-sinflow-secondary/10 flex items-center justify-center text-sinflow-secondary">
                                    <Check className="w-5 h-5" />
                                </div>
                                <span>Soporte técnico especializado</span>
                            </div>
                        </div>
                    </motion.div>

                    {/* Right Column: Form */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-md shadow-2xl"
                    >
                        {formState === "success" ? (
                            <div className="text-center py-12">
                                <div className="w-20 h-20 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Check className="w-10 h-10" />
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-2">¡Solicitud enviada!</h3>
                                <p className="text-gray-400">Pronto recibirás un correo electrónico automático con más información.</p>
                                <button
                                    onClick={() => {
                                        setFormState("idle");
                                    }}
                                    className="mt-8 text-sinflow-secondary hover:text-white transition-colors text-sm font-medium"
                                >
                                    Enviar otro mensaje
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <h3 className="text-2xl font-bold text-white mb-2">Solicita más información</h3>
                                    <p className="text-sm text-gray-400">Completa tus datos y te contactaremos.</p>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1.5">Nombre Completo</label>
                                        <input
                                            type="text"
                                            name="name"
                                            id="name"
                                            required
                                            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-sinflow-secondary/50 transition-all"
                                            placeholder="John Doe"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1.5">Correo Electrónico</label>
                                        <input
                                            type="email"
                                            name="email"
                                            id="email"
                                            required
                                            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-sinflow-secondary/50 transition-all"
                                            placeholder="john@empresa.com"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-1.5">Teléfono / Celular</label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            id="phone"
                                            required
                                            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-sinflow-secondary/50 transition-all"
                                            placeholder="+57 300 000 0000"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="company" className="block text-sm font-medium text-gray-300 mb-1.5">Empresa / Negocio (Opcional)</label>
                                        <input
                                            type="text"
                                            name="company"
                                            id="company"
                                            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-sinflow-secondary/50 transition-all"
                                            placeholder="Mi Empresa S.A.S"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="service" className="block text-sm font-medium text-gray-300 mb-1.5">Servicio Principal Solicitado</label>
                                        <select
                                            name="service"
                                            id="service"
                                            required
                                            defaultValue=""
                                            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-sinflow-secondary/50 transition-all cursor-pointer [&>option]:bg-gray-900 [&>option]:text-white"
                                        >
                                            <option value="" disabled>Selecciona un servicio...</option>
                                            <option value="Consultoría e Inteligencia Artificial">Consultoría e Inteligencia Artificial</option>
                                            <option value="Automatización (RPA & IA)">Automatización Inteligente</option>
                                            <option value="Analítica de Datos & BI">Analítica de Datos & BI</option>
                                            <option value="Desarrollo a Medida">Desarrollo de Software / Apps Web</option>
                                            <option value="Desarrollo de Agentes y Chatbots">Agentes Inteligentes y Chatbots</option>
                                            <option value="Otro / Contacto General">Otro / Información General</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1.5">Descripción del Servicio</label>
                                        <input
                                            type="text"
                                            name="description"
                                            id="description"
                                            required
                                            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-sinflow-secondary/50 transition-all"
                                            placeholder="Detalla brevemente tu requerimiento..."
                                        />
                                    </div>
                                </div>

                                {formState === "error" && (
                                    <div className="flex items-center gap-2 text-red-400 text-sm bg-red-400/10 p-3 rounded-lg">
                                        <AlertCircle className="w-4 h-4" />
                                        <span>{errorMessage}</span>
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={formState === "loading"}
                                    className="w-full py-4 bg-gradient-to-r from-sinflow-secondary to-sinflow-accent text-white font-bold rounded-xl hover:opacity-90 transition-all shadow-lg shadow-sinflow-secondary/25 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {formState === "loading" ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Redirigiendo...
                                        </>
                                    ) : (
                                        <>
                                            Agendar ahora
                                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </button>
                                <p className="text-xs text-center text-gray-500 mt-4">
                                    Al enviar este formulario aceptas nuestra política de privacidad.
                                </p>
                            </form>
                        )}
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
