"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useEffect } from "react";

interface ServiceModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    description: string;
    details: string[];
}

export function ServiceModal({ isOpen, onClose, title, description, details }: ServiceModalProps) {
    // Prevent scrolling when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isOpen]);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
                        onClick={onClose}
                    />
                    <div className="fixed inset-0 overflow-y-auto z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-sinflow-primary border border-white/10 rounded-2xl w-full max-w-2xl relative shadow-2xl overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Decorative Header Background */}
                            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-sinflow-secondary/20 to-sinflow-accent/20 pointer-events-none" />

                            <div className="relative p-6 sm:p-8">
                                <button
                                    onClick={onClose}
                                    className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white bg-black/20 hover:bg-black/40 rounded-full transition-colors backdrop-blur-md"
                                >
                                    <X className="w-5 h-5" />
                                </button>

                                <h3 className="text-3xl font-bold text-white mb-4 mt-8">{title}</h3>
                                <p className="text-lg text-gray-300 mb-8 leading-relaxed border-l-4 border-sinflow-secondary pl-4">
                                    {description}
                                </p>

                                <div className="bg-white/5 rounded-xl p-6 border border-white/5">
                                    <h4 className="text-sm font-semibold text-sinflow-secondary uppercase tracking-wider mb-4">
                                        Capacidades Clave
                                    </h4>
                                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {details.map((detail, index) => (
                                            <li key={index} className="flex items-start gap-2 text-gray-300">
                                                <span className="w-1.5 h-1.5 rounded-full bg-sinflow-accent mt-2 shrink-0" />
                                                <span>{detail}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
}
