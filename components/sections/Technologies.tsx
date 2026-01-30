"use client";

import { motion } from "framer-motion";

const technologies = [
    "Python", "React", "Next.js", "Node.js", "Power BI",
    "Azure", "AWS", "PostgreSQL", "SQL Server", "OpenAI"
];

export function Technologies() {
    return (
        <section id="tecnologias" className="py-24">
            <div className="relative w-full overflow-hidden mask-gradient-x">
                <div className="absolute top-0 left-0 w-20 h-full bg-gradient-to-r from-[#050810] to-transparent z-10" />
                <div className="absolute top-0 right-0 w-20 h-full bg-gradient-to-l from-[#050810] to-transparent z-10" />

                <motion.div
                    className="flex gap-8 w-max"
                    animate={{ x: "-50%" }}
                    transition={{
                        duration: 30,
                        repeat: Infinity,
                        ease: "linear",
                        repeatType: "loop"
                    }}
                >
                    {[...technologies, ...technologies, ...technologies].map((tech, index) => (
                        <div
                            key={`${tech}-${index}`}
                            className="px-8 py-4 rounded-full border border-white/5 bg-white/5 backdrop-blur-sm text-gray-300 font-medium hover:border-sinflow-secondary hover:text-sinflow-secondary transition-all cursor-default whitespace-nowrap text-lg"
                        >
                            {tech}
                        </div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
