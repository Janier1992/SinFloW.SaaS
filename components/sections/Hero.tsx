"use client";

import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function Hero() {
    return (
        <section id="hero" className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
            {/* Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-sinflow-secondary/20 rounded-full blur-[120px]" />
                <div className="absolute top-[40%] -right-[10%] w-[40%] h-[40%] bg-sinflow-accent/20 rounded-full blur-[120px]" />
            </div>

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-sinflow-secondary text-sm font-medium mb-8 backdrop-blur-sm"
                >
                    <Sparkles className="w-4 h-4" />
                    <span>Innovación y Tecnología desde Medellín</span>
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white mb-6"
                >
                    Potenciamos el Futuro con
                    <span className="block text-transparent bg-clip-text bg-gradient-to-r from-sinflow-secondary to-sinflow-accent">
                        Inteligencia Artificial
                    </span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="text-lg sm:text-xl text-gray-400 mb-10 max-w-2xl mx-auto"
                >
                    Ofrecemos soluciones avanzadas en desarrollo de software, IA y analítica de datos para transformar y escalar tu negocio.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="flex flex-col sm:flex-row items-center justify-center gap-4"
                >
                    <Link
                        href="#contacto"
                        className="w-full sm:w-auto px-8 py-3.5 bg-sinflow-secondary text-sinflow-primary font-semibold rounded-full hover:bg-sinflow-secondary/90 transition-all flex items-center justify-center gap-2"
                    >
                        Agenda una demo
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                    <Link
                        href="#contacto"
                        className="w-full sm:w-auto px-8 py-3.5 bg-white/5 text-white font-medium rounded-full border border-white/10 hover:bg-white/10 transition-all backdrop-blur-sm"
                    >
                        Contáctanos
                    </Link>
                </motion.div>
            </div>

            {/* Grid Pattern Overlay */}
            <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
        </section>
    );
}
