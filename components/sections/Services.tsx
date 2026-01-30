"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Code, Bot, Settings, Database, BarChart3, Plus } from "lucide-react";
import { ServiceModal } from "@/components/ui/ServiceModal";

const services = [
    {
        title: "Inteligencia Artificial aplicada al negocio",
        description: "Transforma tu operativa con agentes autónomos y modelos a medida.",
        details: [
            "Chatbots de Atención 24/7",
            "Agentes Autónomos para Tareas Complejas",
            "Integración con OpenAI (GPT-4) y Azure AI",
            "Procesamiento de Lenguaje Natural (NLP)",
            "Sistemas de Recomendación",
            "Visión por Computadora"
        ],
        icon: Bot,
    },
    {
        title: "Automatización inteligente de procesos",
        description: "Elimina la fricción operativa y tareas repetitivas.",
        details: [
            "RPA (Robotic Process Automation)",
            "Flujos con Power Automate / n8n",
            "Integración de Sistemas Híbridos",
            "Orquestación de Procesos de Negocio",
            "Reducción de Errores Manuales",
            "Alertas Inteligentes"
        ],
        icon: Settings,
    },
    {
        title: "Analítica de datos integrada",
        description: "Convierte datos dispersos en activos estratégicos claros.",
        details: [
            "Ingeniería de Datos (ETL/ELT)",
            "Data Warehousing Moderno",
            "Limpieza y Calidad de Datos",
            "Migración a la Nube",
            "Arquitectura Escalable",
            "Gobierno del Dato"
        ],
        icon: Database,
    },
    {
        title: "Business Intelligence orientado a decisiones",
        description: "Visualiza el futuro de tu negocio en tiempo real.",
        details: [
            "Dashboards Interactivos (Power BI)",
            "KPIs en Tiempo Real",
            "Análisis Predictivo de Tendencias",
            "Reportes Ejecutivos Automatizados",
            "Data Storytelling",
            "Toma de Decisiones Basada en Datos"
        ],
        icon: BarChart3,
    },
    {
        title: "Desarrollo de software a la medida",
        description: "Soluciones robustas para problemas únicos y complejos.",
        details: [
            "Aplicaciones Web Modernas (Next.js)",
            "Apps Móviles Nativas/Híbridas",
            "Sistemas Empresariales (ERP/CRM Custom)",
            "APIs y Microservicios",
            "Arquitectura Cloud-Native",
            "Mantenimiento Evolutivo"
        ],
        icon: Code,
    },
];

export function Services() {
    const [selectedService, setSelectedService] = useState<(typeof services)[0] | null>(null);

    return (
        <section id="servicios" className="py-24 relative">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-3xl sm:text-4xl font-bold text-white mb-4"
                    >
                        Nuestras Soluciones
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-gray-400 max-w-2xl mx-auto"
                    >
                        Tecnología de punta aplicada para resolver los retos más complejos de tu negocio. Haz clic en cada tarjeta para ver más detalles.
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {services.map((service, index) => (
                        <motion.div
                            key={service.title}
                            layoutId={service.title}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ y: -5 }}
                            onClick={() => setSelectedService(service)}
                            className="glass p-8 rounded-2xl hover:border-sinflow-secondary/50 transition-all group cursor-pointer relative overflow-hidden"
                        >
                            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Plus className="w-5 h-5 text-sinflow-secondary" />
                            </div>

                            <div className="w-12 h-12 bg-sinflow-secondary/10 rounded-lg flex items-center justify-center mb-6 text-sinflow-secondary group-hover:bg-sinflow-secondary group-hover:text-sinflow-primary transition-colors">
                                <service.icon className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3">{service.title}</h3>
                            <p className="text-gray-400 group-hover:text-gray-300 transition-colors">
                                {service.description}
                            </p>
                            <div className="mt-4 text-sm text-sinflow-secondary font-medium opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                                Ver detalles <Plus className="w-3 h-3" />
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            <ServiceModal
                isOpen={!!selectedService}
                onClose={() => setSelectedService(null)}
                title={selectedService?.title || ""}
                description={selectedService?.description || ""}
                details={selectedService?.details || []}
            />
        </section>
    );
}
