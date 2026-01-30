"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, MessageSquare } from "lucide-react"; // Using MessageSquare as placeholder for specific chat icon if needed

export function CTA() {
    return (
        <section id="contacto" className="py-24 relative overflow-hidden">
            <div className="absolute inset-0 bg-sinflow-secondary/5" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-sinflow-accent/10 blur-[120px] rounded-full pointer-events-none" />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-4xl sm:text-5xl font-bold text-white mb-6"
                >
                    Transforma tu empresa con
                    <span className="block text-sinflow-secondary mt-2">Inteligencia Artificial y datos</span>
                </motion.h2>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 }}
                    className="text-xl text-gray-400 mb-10"
                >
                    Agenda una consulta estratégica gratuita y descubre cómo podemos potenciar tu crecimiento.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 }}
                    className="flex flex-col sm:flex-row items-center justify-center gap-4"
                >
                    <Link
                        href="https://wa.me/573000000000" // Placeholder number
                        target="_blank"
                        className="w-full sm:w-auto px-8 py-4 bg-sinflow-secondary text-sinflow-primary font-bold rounded-full hover:bg-sinflow-secondary/90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-sinflow-secondary/25"
                    >
                        <MessageSquare className="w-5 h-5" />
                        Hablemos ahora
                    </Link>
                    <Link
                        href="mailto:hola@sinflow.co"
                        className="w-full sm:w-auto px-8 py-4 bg-white/5 text-white font-medium rounded-full border border-white/10 hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                    >
                        Enviar correo
                        <ArrowRight className="w-5 h-5" />
                    </Link>
                </motion.div>
            </div>
        </section>
    );
}
