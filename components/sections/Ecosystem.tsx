"use client";

import { motion } from "framer-motion";
import { MapPin, Building2, Network } from "lucide-react";

export function Ecosystem() {
    return (
        <section className="py-24 bg-[#050810] relative overflow-hidden">
            {/* Background Map Effect */}
            <div className="absolute inset-0 opacity-20 pointer-events-none">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-sinflow-secondary/10 via-[#050810] to-[#050810]" />
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

                    {/* Content */}
                    <div>
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="inline-block mb-4 px-4 py-1.5 rounded-full border border-sinflow-secondary/30 bg-sinflow-secondary/10 text-sinflow-secondary text-sm font-semibold tracking-wide uppercase"
                        >
                            Live Data
                        </motion.div>
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-4xl lg:text-5xl font-bold text-white mb-6"
                        >
                            Tech Ecosystem <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sinflow-secondary to-sinflow-accent">
                                Medellín
                            </span>
                        </motion.h2>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="text-gray-400 text-lg mb-8 leading-relaxed"
                        >
                            Medellín presenta un entorno favorable para Sinflow, con una notable concentración de centros de innovación tecnológica. La ciudad cuenta con hubs clave como Ruta N, el Centro para la Cuarta Revolución Industrial y una vibrante comunidad de coworking y empresas de software.
                        </motion.p>

                        <div className="space-y-6">
                            {[
                                { title: "Innovation Hubs", desc: "Ruta N, C4TA, Centro del Valle del Software", icon: Network },
                                { title: "Coworking & Community", desc: "WeWork, Tinkko, Co-Work Latam", icon: Building2 },
                                { title: "Software Landscape", desc: "Globant, Endava, Ceiba, Pragma", icon: MapPin }
                            ].map((item, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, x: -20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.2 + (idx * 0.1) }}
                                    className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/5 hover:border-sinflow-secondary/30 transition-colors"
                                >
                                    <div className="p-3 rounded-lg bg-sinflow-secondary/10 text-sinflow-secondary">
                                        <item.icon className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-white font-bold mb-1">{item.title}</h3>
                                        <p className="text-gray-400 text-sm">{item.desc}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Stats / Interactive Visual Placeholder */}
                    <div className="relative">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            className="relative z-10 p-8 rounded-3xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 backdrop-blur-xl"
                        >
                            <div className="space-y-8">
                                <div>
                                    <h4 className="text-gray-400 text-sm uppercase tracking-wider mb-2">Ubicación y Contexto</h4>
                                    <h3 className="text-2xl font-bold text-white">Estrategia basada en Geointeligencia</h3>
                                </div>
                                <p className="text-gray-300">
                                    No solo estamos en Medellín, somos parte de su ecosistema de innovación. Usamos IA para conectar con los mejores centros de talento.
                                </p>
                                <div className="p-4 rounded-xl bg-black/50 border border-white/10">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                        <span className="text-xs text-green-400 font-mono">SYSTEM ONLINE</span>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="h-1.5 w-3/4 bg-white/10 rounded-full" />
                                        <div className="h-1.5 w-1/2 bg-white/10 rounded-full" />
                                        <div className="h-1.5 w-5/6 bg-white/10 rounded-full" />
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Decorative blobs */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-sinflow-secondary/20 blur-[100px] rounded-full -z-10" />
                    </div>

                </div>
            </div>
        </section>
    );
}
