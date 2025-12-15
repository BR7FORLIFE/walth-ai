"use client";

//imports de nextJS
import Link from "next/link";
import Image from "next/image";

//imports de react
import { ArrowLeft, BarChart3, Sparkles, TrendingUp } from "lucide-react";
import { useState } from "react";

//componentes de la capa Auth
import LoginForm from "@auth/components/LoginForm";
import RegisterForm from "@auth/components/RegisterForm";

//hooks de la capa auth
import useRedirectIfLogged from "@auth/hooks/auth.hooks";

export default function AuthPage() {
  const loadingSession = useRedirectIfLogged();
  const [tab, setTab] = useState<"login" | "register">("login");

  if (loadingSession) return null;

  return (
    <section className="h-screen flex overflow-hidden bg-white dark:bg-slate-900">
      {/* LEFT */}
      <section className="w-1/2 p-10  lg:w-1/2 flex flex-col h-full relative z-10 overflow-y-auto">

        <Link href="/landing" className="inline-flex items-center text-sm text-slate-500 hover:text-primary dark:text-slate-400 dark:hover:text-primary transition-colors group">
          <ArrowLeft className="mr-2 w-4 h-4" />
          Volver
        </Link>

        <div className="grow flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 max-w-lg mx-auto w-full">
            <div className="text-center mb-8">
                <div className="flex items-center justify-center mb-4 space-x-2">
                <Image
                    src="/images/logo.jpg"
                    alt="WelthIA Logo"
                    width={40}
                    height={40}
                    className="rounded-xl"
                    unoptimized
                />
                <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                    WelthIA
                </span>
            </div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                Bienvenido
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
                Accede a tu asistente de salud personalizado
            </p>
          </div>
          <div className="w-full bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 p-1">
            <div className="grid grid-cols-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl mb-6 m-4">
                <button
                onClick={() => setTab("login")}
                className={`flex items-center justify-center py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                  tab === "login"
                    ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
                >
                Iniciar Sesión
                </button>

                <button
                onClick={() => setTab("register")}
                className={
                  `flex items-center justify-center py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                  tab === "register"
                    ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
                >
                Registrarse
                </button>
            </div>

            {tab === "login" ? (
                <LoginForm />
            ) : (
                <RegisterForm onSwitchToLogin={() => setTab("login")} />
            )}
        </div>

        <p className="mt-8 text-center text-xs text-slate-500 dark:text-slate-500 max-w-xs">
            Al continuar, aceptas nuestros{" "}
            <a href="#" className="font-medium text-primary hover:underline">
              Términos de Servicio
            </a>{" "}
            y{" "}
            <a href="#" className="font-medium text-primary hover:underline">
              Política de Privacidad
            </a>
            .
        </p>
        </div>
      </section>

      {/* Right Side - Hero */}
      <article className="hidden lg:flex w-1/2 bg-[#0a1120] relative items-center justify-center p-12 overflow-hidden">
        {/* Animated blur effects */}
        <section className="absolute top-0 right-0 w-full h-full opacity-30 pointer-events-none">
          <div className="absolute top-[-10%] right-[-10%] w-125 h-125 bg-blue-600 rounded-full mix-blend-multiply filter blur-[120px] animate-pulse"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-150 h-150 bg-indigo-900 rounded-full mix-blend-multiply filter blur-[100px] opacity-70"></div>
        </section>

        <section className="relative z-10 max-w-lg">
          <h2 className="text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight mb-6">
            Transforma tu Salud con{" "}
            <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-400 to-indigo-300">
              Inteligencia Artificial
            </span>
          </h2>
          <p className="text-lg text-slate-300 mb-12 leading-relaxed">
            Evaluaciones personalizadas que se adaptan a tus necesidades únicas
            para un estilo de vida más saludable.
          </p>

          <div className="space-y-8">
            <div className="flex items-start">
              <div className="shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
                  <BarChart3 className="h-6 w-6" />
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-white">
                  Análisis Completo
                </h3>
                <p className="mt-1 text-slate-400 text-sm">
                  Evaluamos cada aspecto de tu bienestar físico y mental con
                  precisión.
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
                  <Sparkles className="h-6 w-6" />
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-white">
                  Planes Personalizados
                </h3>
                <p className="mt-1 text-slate-400 text-sm">
                  Recomendaciones únicas basadas en IA adaptadas a tu perfil.
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  <TrendingUp className="h-6 w-6" />
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-white">
                  Seguimiento Continuo
                </h3>
                <p className="mt-1 text-slate-400 text-sm">
                  Monitorea tu progreso en tiempo real y ajusta tus metas
                  fácilmente.
                </p>
              </div>
            </div>
          </div>
        </section>
      </article>
    </section>
  );
}
