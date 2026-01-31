"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, Rocket } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

// Helper for GitHub Pages prefix
const prefix = process.env.NODE_ENV === 'production' ? '/SinFloW.SaaS' : '';
import { motion, AnimatePresence } from "framer-motion";

export function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const navLinks = [
        { name: "Inicio", href: "#hero" },
        { name: "Servicios", href: "#servicios" },
        { name: "Diferenciales", href: "#diferenciales" },
        { name: "Tecnologías", href: "#tecnologias" },
    ];

    return (
        <nav
            className={cn(
                "fixed top-0 w-full z-50 transition-all duration-300 border-b border-transparent",
                scrolled
                    ? "glass"
                    : "bg-transparent"
            )}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    <div className="flex-shrink-0 flex items-center gap-2">
                        <Link href="/" className="flex items-center gap-2 text-2xl font-bold text-white tracking-tighter">
                            <Image
                                src={`${prefix}/sinflow-logo.jpg`}
                                alt="SynFlow Logo"
                                width={48}
                                height={48}
                                className="w-12 h-12 rounded-full object-cover"
                            />
                            <span>SynFlow</span>
                        </Link>
                    </div>

                    <div className="hidden md:block">
                        <div className="ml-10 flex items-baseline space-x-8">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    className="text-gray-300 hover:text-sinflow-secondary px-3 py-2 rounded-md text-sm font-medium transition-colors"
                                >
                                    {link.name}
                                </Link>
                            ))}
                            <Link
                                href="#contacto"
                                className="bg-sinflow-accent hover:bg-sinflow-accent/90 text-white px-5 py-2.5 rounded-full text-sm font-medium transition-all shadow-lg shadow-sinflow-accent/25"
                            >
                                Agenda una demo
                            </Link>
                        </div>
                    </div>

                    <div className="md:hidden">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="text-gray-300 hover:text-white p-2"
                        >
                            <span className="sr-only">Abrir menú</span>
                            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden glass border-t border-gray-800"
                    >
                        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    onClick={() => setIsOpen(false)}
                                    className="text-gray-300 hover:text-sinflow-secondary block px-3 py-2 rounded-md text-base font-medium"
                                >
                                    {link.name}
                                </Link>
                            ))}
                            <div className="pt-4 pb-2">
                                <Link
                                    href="#contacto"
                                    onClick={() => setIsOpen(false)}
                                    className="w-full block text-center bg-sinflow-accent hover:bg-sinflow-accent/90 text-white px-5 py-3 rounded-full text-base font-medium shadow-lg shadow-sinflow-accent/25"
                                >
                                    Agenda una demo
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}
