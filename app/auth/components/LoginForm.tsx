"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { loginUser } from "@auth/helpers/auth.service";

import Label from "@components/ui/label";
import Input from "@components/ui/input";

export default function LoginForm() {
  const router = useRouter();

  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await loginUser(form.username, form.password);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleLogin} className="space-y-5 px-4 pb-6  sm:px-6">
      <div>
        <Label htmlFor="username" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Usuario</Label>
        <Input
          id="username"
          type="text"
          value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })}
          className="block w-full px-4 py-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-300 dark:border-slate-600"
          required
        />
      </div>

     <div>
        <div className="flex items-center justify-between mb-1.5">
        <Label
            htmlFor="password"
            className="block text-sm font-medium text-slate-700 dark:text-slate-300"
        >
            Contraseña
        </Label>
        <a
            href="#"
            className="text-xs font-medium text-primary hover:text-primary/80"
        >
            ¿Olvidaste tu contraseña?
        </a>
        </div>
        <Input
            id="password"
            name="password"
            type="password"
            placeholder="••••••••"
            value={form.password}
            onChange={(e) =>
                setForm({ ...form, password: e.target.value })
            }
            required
            className="block w-full px-4 py-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-300 dark:border-slate-600"
        />
    </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-3 rounded-r-lg">
            <p className="text-sm text-red-900 dark:text-red-100 font-medium">
                {error}
            </p>
        </div>
        )}

      <div className="pt-2">
        <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
            {loading ? (
                <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Ingresando...
                </div>
            ) : (
                "Iniciar Sesión"
            )}
        </button>
    </div>
    </form>
  );
}
