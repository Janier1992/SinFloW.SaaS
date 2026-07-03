import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ChatWidget } from "@/components/ui/ChatWidget";
import { AdminPortal } from "@/components/ui/AdminPortal";

// Asegurando explícitamente el subset 'latin' para optimizar peso (Recomendación)
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap", // Mejora SEO de rendimiento
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "SynFlow IA SaaS | Inteligencia Artificial y Automatización en Medellín",
  description: "Transformamos PyMEs en Medellín con Inteligencia Artificial, Automatización de Procesos y Desarrollo de Software a la medida. SynFlow IA es tu aliado tecnológico.",
  keywords: ["Desarrollo de software", "Inteligencia Artificial", "RPA", "Next.js", "Automatización", "Agencia IA Medellín", "SynFlow IA"],
  openGraph: {
    title: "SynFlow IA SaaS | Transformando negocios con IA",
    description: "Agencia tecnológica líder en Medellín. Desarrollo a la medida y soluciones de Inteligencia Artificial para potenciar tu empresa.",
    type: "website",
    locale: "es_CO",
    // url: "https://synflow.io", // Descomentar cuando exista dominio
    siteName: "SynFlow IA",
  },
  twitter: {
    card: "summary_large_image",
    title: "SynFlow IA | Potenciamos el futuro con IA",
    description: "Desarrollo de apps, automatización de procesos y analítica de datos en Medellín.",
  },
  robots: {
    index: true,
    follow: true,
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="scroll-smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-sinflow-primary text-sinflow-text-light selection:bg-sinflow-secondary selection:text-sinflow-primary`}
      >
        <Navbar />
        <main className="min-h-screen">
          {children}
        </main>
        <ChatWidget />
        <AdminPortal />
        <Footer />
        <Analytics />
      </body>
    </html>
  );
}
