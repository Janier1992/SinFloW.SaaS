"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { Quote } from "lucide-react";
import { getApprovedTestimonials, Testimonial } from "@/lib/adminState";

export function Testimonials() {
    const [testimonialsList, setTestimonialsList] = useState<Testimonial[]>([]);

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
                    className="text-lg text-gray-400 max-w-2xl mx-auto"
                >
                    Empresas que confían en nuestra tecnología para liderar sus industrias.
                </motion.p>
            </div>

            {/* Marquee Container */}
            <div className="relative w-full overflow-hidden mask-linear-gradient">
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
