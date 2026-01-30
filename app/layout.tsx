import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google"; // Assuming these are default fonts, will keep them.
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ChatWidget } from "@/components/ui/ChatWidget";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sinflow | Agencia de IA y Desarrollo de Software",
  description: "Transformamos empresas con Inteligencia Artificial, Data y Software a la medida. Innovación desde Medellín para el mundo.",
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
        <Footer />
      </body>
    </html>
  );
}
