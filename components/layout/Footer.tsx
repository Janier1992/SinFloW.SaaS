import Link from "next/link";
import { Rocket, Github, Linkedin, Twitter, Mail, MapPin } from "lucide-react";
import Image from "next/image";

export function Footer() {
    return (
        <footer className="bg-sinflow-primary border-t border-gray-800 text-gray-400">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="col-span-1 md:col-span-1">
                        <Link href="/" className="flex items-center gap-2 mb-4">
                            <Image
                                src="/sinflow-logo.png"
                                alt="Sinflow Logo"
                                width={32}
                                height={32}
                                className="w-8 h-8 object-contain"
                            />
                            <span className="text-2xl font-bold text-white tracking-tighter">Sinflow</span>
                        </Link>
                        <p className="text-sm mb-6">
                            Transformamos empresas mediante inteligencia artificial, datos y automatización avanzada.
                        </p>
                        <div className="flex space-x-4">
                            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="hover:text-sinflow-secondary transition-colors">
                                <span className="sr-only">LinkedIn</span>
                                <Linkedin className="h-6 w-6" />
                            </a>
                            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-sinflow-secondary transition-colors">
                                <span className="sr-only">Twitter</span>
                                <Twitter className="h-6 w-6" />
                            </a>
                            <a href="https://github.com/jhmosquera38-dev" target="_blank" rel="noopener noreferrer" className="hover:text-sinflow-secondary transition-colors">
                                <span className="sr-only">GitHub</span>
                                <Github className="h-6 w-6" />
                            </a>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">Servicios</h3>
                        <ul className="space-y-3">
                            <li><Link href="#servicios" className="hover:text-sinflow-secondary transition-colors">Desarrollo de Software</Link></li>
                            <li><Link href="#servicios" className="hover:text-sinflow-secondary transition-colors">Inteligencia Artificial</Link></li>
                            <li><Link href="#servicios" className="hover:text-sinflow-secondary transition-colors">Automatización RPA</Link></li>
                            <li><Link href="#servicios" className="hover:text-sinflow-secondary transition-colors">Data & Analytics</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">Empresa</h3>
                        <ul className="space-y-3">
                            <li><Link href="#hero" className="hover:text-sinflow-secondary transition-colors">Sobre Nosotros</Link></li>
                            <li><Link href="#" className="hover:text-sinflow-secondary transition-colors">Carreras</Link></li>
                            <li><Link href="#" className="hover:text-sinflow-secondary transition-colors">Blog</Link></li>
                            <li><Link href="#contacto" className="hover:text-sinflow-secondary transition-colors">Contacto</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">Contacto</h3>
                        <ul className="space-y-3">
                            <li className="flex items-start gap-3">
                                <MapPin className="h-5 w-5 text-sinflow-secondary shrink-0 mt-0.5" />
                                <span>Medellín, Colombia</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Mail className="h-5 w-5 text-sinflow-secondary shrink-0" />
                                <a href="mailto:ded.uno@gmail.com" className="hover:text-white transition-colors">ded.uno@gmail.com</a>
                            </li>
                        </ul>
                    </div>
                </div>
                <div className="mt-12 pt-8 border-t border-gray-800 text-center md:text-left flex flex-col md:flex-row justify-between items-center text-sm">
                    <div className="flex flex-col gap-1">
                        <p>&copy; {new Date().getFullYear()} Sinflow. Todos los derechos reservados.</p>
                        <p className="text-xs text-gray-600">Developed by Jhanier Mosquera</p>
                    </div>
                    <div className="mt-4 md:mt-0 flex space-x-6">
                        <Link href="#" className="hover:text-white transition-colors">Políticas de Privacidad</Link>
                        <Link href="#" className="hover:text-white transition-colors">Términos de Servicio</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
