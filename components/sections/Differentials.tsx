"use client";

import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

const differentials = [
    "Enfoque en resultados reales y medibles",
    "Arquitectura escalable y preparada para el futuro",
    "Seguridad y estándares de la industria",
    "IA aplicada directamente al negocio",
    "Diseño centrado en el usuario (UX/UI)",
    "Mentalidad de producto y agilidad",
];

export function Differentials() {
    return (
        <section id="diferenciales" className="py-24 bg-sinflow-primary/50 relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                    <div>
                        <motion.h2
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="text-3xl sm:text-4xl font-bold text-white mb-6"
                        >
                            ¿Por qué elegir Sinflow?
                        </motion.h2>
                        <motion.p
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="text-gray-400 mb-8 text-lg"
                        >
                            No somos solo desarrolladores, somos socios estratégicos que entienden tu negocio y aplican la tecnología para acelerar tu crecimiento.
                        </motion.p>
                        <div className="space-y-4">
                            {differentials.map((item, index) => (
                                <motion.div
                                    key={item}
                                    initial={{ opacity: 0, x: -20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.2 + index * 0.05 }}
                                    className="flex items-center gap-3"
                                >
                                    <CheckCircle2 className="w-6 h-6 text-sinflow-accent shrink-0" />
                                    <span className="text-gray-300 font-medium">{item}</span>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="relative h-full min-h-[400px] rounded-2xl overflow-hidden glass p-1 flex items-center justify-center"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-sinflow-secondary/20 to-sinflow-accent/20 opacity-50" />
                        <div className="relative text-center p-8">
                            <span className="text-6xl font-bold text-white block mb-2">+10</span>
                            <span className="text-xl text-gray-300">Años de experiencia combinada</span>
                            <div className="mt-8 grid grid-cols-2 gap-4">
                                <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                                    <span className="block text-2xl font-bold text-sinflow-secondary">100%</span>
                                    <span className="text-sm text-gray-400">Compromiso</span>
                                </div>
                                <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                                    <span className="block text-2xl font-bold text-sinflow-secondary">24/7</span>
                                    <span className="text-sm text-gray-400">Soporte</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
