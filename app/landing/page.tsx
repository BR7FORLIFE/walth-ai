"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Zap,
  Menu,
  Twitter,
  Linkedin,
  Instagram,
  Heart,
  ArrowRight,
} from "lucide-react";

export default function LandingPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-sans antialiased selection:bg-primary selection:text-white transition-colors duration-300 min-h-screen flex flex-col">
      {/* Navigation */}
      <nav className="fixed w-full top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-slate-100 dark:border-slate-800 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Link href="/landing" className="flex items-center gap-2.5 group">
              <Image
                src="/images/logo.jpg"
                alt="WelthIA Logo"
                width={36}
                height={36}
                className="rounded-lg shadow-lg shadow-blue-500/30 transition-transform group-hover:scale-105"
                unoptimized
              />
              <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white">
                WelthIA
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-6">
              <Link
                href="/auth"
                className="text-sm font-semibold text-slate-600 mx-6 hover:text-primary dark:text-slate-300 dark:hover:text-white transition-colors"
              >
                Iniciar Sesión
              </Link>
              <Link
                href="/auth"
                className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold text-white transition-all bg-primary rounded-lg hover:bg-primary/90 shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:focus:ring-offset-slate-900"
              >
                Comenzar Gratis
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>

            <div className="md:hidden flex items-center">
              <button
                className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white focus:outline-none"
                type="button"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                <Menu className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 py-4 px-4">
            <div className="flex flex-col gap-4">
              <Link
                href="/auth"
                className="text-sm font-semibold text-slate-600 hover:text-primary dark:text-slate-300 dark:hover:text-white transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Iniciar Sesión
              </Link>
              <Link
                href="/auth"
                className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold text-white transition-all bg-primary rounded-lg hover:bg-primary/90 shadow-lg"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Comenzar Gratis
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-radial from-blue-500/8 via-transparent to-transparent dark:from-blue-500/15 pointer-events-none"></div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-8 rounded-full bg-blue-50 dark:bg-blue-900/20 text-primary border border-blue-100 dark:border-blue-800/50 shadow-sm">
              <Zap className="h-4 w-4" />
              <span className="text-sm font-semibold tracking-wide">
                IA Personalizada para tu Bienestar
              </span>
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-6 leading-tight max-w-5xl mx-auto">
              Tu Asistente de
              <br className="hidden sm:block" />
              <span className="text-primary relative inline-block">
                {" "}
                Salud Integral
                <svg
                  className="absolute w-full h-3 -bottom-1 left-0 text-blue-200 dark:text-blue-900 opacity-50"
                  fill="none"
                  viewBox="0 0 200 9"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M2.00025 6.99997C25.7201 5.20405 24.9603 2.65655 48.9168 1.99997C90.3942 0.863371 137.948 1.46168 197.514 8.28315"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeWidth="3"
                  />
                </svg>
              </span>
            </h1>
            <p className="mt-6 text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
              Evaluaciones personalizadas impulsadas por IA que transforman tus
              datos de salud en planes de hábitos efectivos y sostenibles.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/auth"
                className="group relative inline-flex items-center justify-center px-8 py-4 text-base font-bold text-white transition-all duration-200 bg-primary rounded-xl hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:focus:ring-offset-slate-900 shadow-xl shadow-primary/20 hover:shadow-2xl hover:shadow-primary/30 hover:-translate-y-1"
              >
                Comenzar Ahora
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
          <div className="absolute top-1/2 left-0 -translate-y-1/2 w-96 h-96 bg-blue-300/10 dark:bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute top-1/4 right-0 w-80 h-80 bg-indigo-300/10 dark:bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>
        </section>

        {/* CTA Section */}
        <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <div className="relative overflow-hidden rounded-3xl bg-slate-950 dark:bg-slate-800 border border-slate-800 dark:border-slate-700 shadow-2xl text-center px-6 py-16 md:px-12 md:py-24 group">
              <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-900 to-black dark:from-slate-800 dark:via-slate-900 dark:to-slate-950 opacity-90 z-0"></div>
              <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/20 rounded-full blur-[100px] z-0 transition-opacity duration-700 group-hover:opacity-70"></div>
              <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-500/10 rounded-full blur-[100px] z-0"></div>
              <div className="relative z-10">
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 tracking-tight">
                  Comienza tu Transformación Hoy
                </h2>
                <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
                  Únete a miles de personas que ya están mejorando su salud con
                  WelthIA.
                </p>
                <Link
                  href="/auth"
                  className="inline-flex items-center justify-center px-8 py-3.5 text-base font-semibold rounded-lg text-white border border-white/20 bg-white/5 hover:bg-white hover:text-slate-950 hover:border-white transition-all duration-300 backdrop-blur-sm"
                >
                  Crear Cuenta Gratis
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 pt-16 pb-8 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8 mb-16">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 bg-primary rounded-md flex items-center justify-center text-white font-bold text-xs">
                  <Heart className="h-4 w-4" />
                </div>
                <span className="font-bold text-lg text-slate-900 dark:text-white">
                  WelthIA
                </span>
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed max-w-xs mb-6">
                Tu asistente inteligente para una vida más saludable. Tecnología
                avanzada al servicio de tu bienestar diario.
              </p>
              <div className="flex gap-4">
                <a
                  href="#"
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-white hover:bg-primary dark:hover:bg-primary transition-all"
                >
                  <Twitter className="h-4 w-4" />
                </a>
                <a
                  href="#"
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-white hover:bg-primary dark:hover:bg-primary transition-all"
                >
                  <Linkedin className="h-4 w-4" />
                </a>
                <a
                  href="#"
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-white hover:bg-primary dark:hover:bg-primary transition-all"
                >
                  <Instagram className="h-4 w-4" />
                </a>
              </div>
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white mb-4 text-xs uppercase tracking-wider">
                Producto
              </h3>
              <ul className="space-y-3">
                <li>
                  <a
                    href="#"
                    className="text-slate-500 hover:text-primary dark:text-slate-400 dark:hover:text-primary text-sm transition-colors"
                  >
                    Características
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-slate-500 hover:text-primary dark:text-slate-400 dark:hover:text-primary text-sm transition-colors"
                  >
                    Precios
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-slate-500 hover:text-primary dark:text-slate-400 dark:hover:text-primary text-sm transition-colors"
                  >
                    Actualizaciones
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-slate-500 hover:text-primary dark:text-slate-400 dark:hover:text-primary text-sm transition-colors"
                  >
                    Integraciones
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white mb-4 text-xs uppercase tracking-wider">
                Empresa
              </h3>
              <ul className="space-y-3">
                <li>
                  <a
                    href="#"
                    className="text-slate-500 hover:text-primary dark:text-slate-400 dark:hover:text-primary text-sm transition-colors"
                  >
                    Acerca de
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-slate-500 hover:text-primary dark:text-slate-400 dark:hover:text-primary text-sm transition-colors"
                  >
                    Blog
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-slate-500 hover:text-primary dark:text-slate-400 dark:hover:text-primary text-sm transition-colors"
                  >
                    Carreras
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-slate-500 hover:text-primary dark:text-slate-400 dark:hover:text-primary text-sm transition-colors"
                  >
                    Contacto
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white mb-4 text-xs uppercase tracking-wider">
                Legal
              </h3>
              <ul className="space-y-3">
                <li>
                  <a
                    href="#"
                    className="text-slate-500 hover:text-primary dark:text-slate-400 dark:hover:text-primary text-sm transition-colors"
                  >
                    Privacidad
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-slate-500 hover:text-primary dark:text-slate-400 dark:hover:text-primary text-sm transition-colors"
                  >
                    Términos
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-slate-500 hover:text-primary dark:text-slate-400 dark:hover:text-primary text-sm transition-colors"
                  >
                    Cookies
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-slate-500 hover:text-primary dark:text-slate-400 dark:hover:text-primary text-sm transition-colors"
                  >
                    Seguridad
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-slate-100 dark:border-slate-800 flex flex-col md:flex-row justify-center items-center">
            <p className="text-slate-400 text-xs">
              © 2025 WelthIA. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
