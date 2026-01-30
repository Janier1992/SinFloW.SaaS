"use client";

import { motion } from "framer-motion";

export function About() {
    return (
        <section id="about" className="py-20 bg-sinflow-primary/50 relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="max-w-4xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="inline-block mb-4 px-4 py-1.5 rounded-full border border-sinflow-secondary/30 bg-sinflow-secondary/10 text-sinflow-secondary text-sm font-semibold tracking-wide uppercase hover:scale-105 transition-transform cursor-default"
                    >
                        Nuestra Esencia
                    </motion.div>

                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="text-3xl sm:text-5xl font-bold text-white mb-12"
                    >
                        Donde la tecnología <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-sinflow-secondary to-sinflow-accent">
                            fluye con propósito
                        </span>
                    </motion.h2>

                    <div className="space-y-16 text-left">
                        {/* El Nacimiento */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="bg-white/5 p-8 rounded-2xl border border-white/10 hover:border-sinflow-secondary/30 transition-colors"
                        >
                            <h3 className="text-2xl font-bold text-white mb-4">🚀 El nacimiento de Sinflow</h3>
                            <div className="text-gray-300 space-y-4 leading-relaxed">
                                <p>
                                    Sinflow nace como una apuesta de emprendimiento impulsada por la unión de <strong className="text-white">cuatro socios apasionados por la transformación digital</strong>.
                                </p>
                                <p>
                                    Nuestro punto de encuentro fue el mismo que hoy conecta al talento global: plataformas profesionales como <strong>LinkedIn</strong>, donde coincidimos no solo por habilidades técnicas, sino por una visión compartida:
                                </p>
                                <blockquote className="border-l-4 border-sinflow-secondary pl-4 italic text-gray-400 my-4">
                                    "Democratizar el acceso a la inteligencia artificial y convertirla en una herramienta real, útil y aplicable para las empresas."
                                </blockquote>
                            </div>
                        </motion.div>

                        {/* Nuestra Visión */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                            className="bg-white/5 p-8 rounded-2xl border border-white/10 hover:border-sinflow-secondary/30 transition-colors"
                        >
                            <h3 className="text-2xl font-bold text-white mb-4">🧠 Nuestra Visión</h3>
                            <div className="text-gray-300 space-y-4 leading-relaxed">
                                <p>
                                    Vivimos en una era donde la inteligencia artificial dejó de ser exclusiva de grandes corporaciones. En Sinflow creemos que las <strong>PyMEs</strong> y los <strong>emprendimientos en crecimiento</strong> también merecen acceder a soluciones tecnológicas avanzadas.
                                </p>
                                <p>
                                    Nuestra misión es <strong className="text-white">hacer simple lo complejo</strong>, llevando la inteligencia artificial al corazón de los procesos empresariales sin barreras técnicas innecesarias.
                                </p>
                            </div>
                        </motion.div>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.4 }}
                        className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-16"
                    >
                        <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors cursor-default group">
                            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-sinflow-secondary transition-colors">Pyme Focus</h3>
                            <p className="text-sm text-gray-400">Democratizando la tecnología de élite.</p>
                        </div>
                        <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors cursor-default group">
                            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-sinflow-secondary transition-colors">Human Centric</h3>
                            <p className="text-sm text-gray-400">La IA no reemplaza, potencia el talento.</p>
                        </div>
                        <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors cursor-default group">
                            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-sinflow-secondary transition-colors">Innovation Hub</h3>
                            <p className="text-sm text-gray-400">Laboratorio vivo de ideas y evolución.</p>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Decorative gradient */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-4xl bg-sinflow-accent/5 blur-[100px] rounded-full pointer-events-none" />
        </section>
    );
}
