"use client";

import { motion } from "framer-motion";
import QRCode from "react-qr-code";
import { ExternalLink, Smartphone, Zap, Lock, Globe, Activity, Store, ShoppingBag } from "lucide-react";
import Link from "next/link";

const portfolioItems = [
    {
        title: "FitnessFlow",
        description: "Plataforma IA para gestión de gimnasios y entrenadores. Tecnología de élite para el bienestar físico.",
        type: "SaaS AI Platform",
        stack: ["Next.js", "Python", "AWS", "Gemini"],
        status: "LIVE",
        url: "https://jhmosquera38-dev.github.io/Fitness-ProIA/",
        icon: Activity,
        color: "from-orange-500 to-rose-600"
    },
    {
        title: "Negocio SaaS",
        description: "Plataforma de gestión para PyMES y tiendas de barrio. Control de ventas, inventario y clientes.",
        type: "SaaS Platform",
        stack: ["React", "SaaS", "Web"],
        status: "LIVE",
        url: "https://janier1992.github.io/Negocio_SaaS/auth",
        icon: Store,
        color: "from-blue-500 to-cyan-600"
    },
    {
        title: "AmiOriente",
        description: "Plataforma integral de comercio y servicios (PWA). App nativa instalable con soporte offline para el Oriente Antioqueño.",
        type: "PWA E-commerce",
        stack: ["PWA", "React", "Vercel"],
        status: "LIVE",
        url: "https://ami-oriente-app.vercel.app/",
        icon: ShoppingBag,
        color: "from-emerald-500 to-teal-600"
    }
];

export function PortfolioExperience() {
    return (
        <section id="sinflow-lab" className="py-32 bg-[#050810] relative overflow-hidden">
            {/* Background Ambience */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[10%] left-[20%] w-[30vw] h-[30vw] bg-sinflow-accent/5 rounded-full blur-[150px] animate-pulse" />
                <div className="absolute bottom-[10%] right-[20%] w-[25vw] h-[25vw] bg-sinflow-secondary/5 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: "2s" }} />
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

                {/* 1. Hero Emocional */}
                <div className="text-center mb-20">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="inline-block mb-4 px-4 py-1.5 rounded-full border border-sinflow-accent/30 bg-sinflow-accent/10 text-sinflow-accent text-sm font-semibold tracking-wide uppercase"
                    >
                        🔥 Sinflow Lab
                    </motion.div>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight"
                    >
                        No hablamos de lo que podemos hacer. <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-sinflow-secondary to-sinflow-accent">
                            Creamos lo que ya está funcionando.
                        </span>
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-xl text-gray-400 max-w-2xl mx-auto"
                    >
                        Explora nuestras soluciones reales, escanea el QR y vive la experiencia Sinflow desde adentro. Ideas que ya están vivas.
                    </motion.p>
                </div>

                {/* 2. Grid de Experiencias */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-24">
                    {portfolioItems.map((item, index) => (
                        <motion.div
                            key={item.title}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.15 }}
                            className="group relative bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-sinflow-secondary/50 transition-all duration-500"
                        >
                            {/* Card Header Gradient */}
                            <div className={`h-2 bg-gradient-to-r ${item.color}`} />

                            <div className="p-8">
                                <div className="flex justify-between items-start mb-6">
                                    <div className={`p-3 rounded-lg bg-gradient-to-br ${item.color} bg-opacity-10 text-white`}>
                                        <item.icon className="w-6 h-6" />
                                    </div>
                                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-white border border-white/10">
                                        {item.status}
                                    </span>
                                </div>

                                <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-sinflow-secondary transition-colors">
                                    {item.title}
                                </h3>
                                <p className="text-gray-400 text-sm mb-6 h-12">
                                    {item.description}
                                </p>

                                {/* Tech Stack */}
                                <div className="flex flex-wrap gap-2 mb-8">
                                    {item.stack.map((tech) => (
                                        <span key={tech} className="text-xs text-gray-500 font-mono bg-black/30 px-2 py-1 rounded">
                                            {tech}
                                        </span>
                                    ))}
                                </div>

                                {/* Interactive QR Area */}
                                <div className="relative bg-white/5 rounded-xl p-6 flex flex-col items-center justify-center gap-4 group-hover:bg-white/10 transition-colors">
                                    <div className="bg-white p-2 rounded-lg shadow-lg">
                                        <QRCode
                                            value={item.url}
                                            size={120}
                                            style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                                            viewBox={`0 0 256 256`}
                                        />
                                    </div>
                                    <span className="text-xs text-gray-400 font-medium tracking-wider uppercase flex items-center gap-1">
                                        <Zap className="w-3 h-3 text-yellow-400" /> Escanea para demo
                                    </span>

                                    {/* Hover Overlay Button */}
                                    <div className="absolute inset-0 bg-sinflow-primary/90 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        <a href={item.url} target="_blank" rel="noopener noreferrer" className="px-6 py-2 bg-sinflow-secondary text-sinflow-primary font-bold rounded-full flex items-center gap-2 hover:scale-105 transition-transform">
                                            Explorar App <ExternalLink className="w-4 h-4" />
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* 3. CTA Emocional Final */}
                <div className="text-center relative">
                    <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-gradient-to-r from-sinflow-secondary/10 to-sinflow-accent/10 blur-[80px] rounded-full pointer-events-none" />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="relative z-10"
                    >
                        <h3 className="text-3xl md:text-5xl font-bold text-white mb-6">
                            ¿Te imaginas tu idea aquí? <br />
                            <span className="text-gray-500">Nosotros sí.</span>
                        </h3>

                        <Link
                            href="https://wa.me/573000000000?text=Hola,%20quisiera%20construir%20una%20idea%20con%20Sinflow"
                            target="_blank"
                            className="inline-flex items-center gap-3 px-8 py-4 bg-white text-sinflow-primary font-bold text-lg rounded-full hover:bg-gray-100 transition-colors shadow-xl hover:shadow-2xl hover:-translate-y-1 transform"
                        >
                            Construyámosla juntos
                            <Zap className="w-5 h-5 fill-current" />
                        </Link>
                    </motion.div>
                </div>

            </div>
        </section>
    );
}
