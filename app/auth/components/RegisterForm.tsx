"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import {
  registerUser,
  createProfile,
  normalizeUsername,
} from "@auth/helpers/auth.service";

import Label from "@components/ui/label";
import Input from "@components/ui/input";

export default function RegisterForm({
  onSwitchToLogin,
}: {
  onSwitchToLogin: () => void;
}) {
  const router = useRouter();

  const [form, setForm] = useState({
    username: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      return setError("Las contraseñas no coinciden.");
    }

    setLoading(true);

    try {
      const username = normalizeUsername(form.username);

      const data = await registerUser(username, form.password);

      const user = data.user;
      const session = data.session;

      if (!user || !session) {
        setError(
          "Debes desactivar la verificación por email en Supabase (Auth → Providers → Email → Disable Confirm Email)."
        );
        onSwitchToLogin();
        return;
      }

      await createProfile(user.id, username);

      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleRegister} className="space-y-5 px-4 pb-6 sm:px-6">
      <div>
        <Label htmlFor="reg-username" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Usuario</Label>
        <Input
          id="reg-username"
          type="text"
          className="block w-full px-4 py-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-300 dark:border-slate-600"
          value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })}
          minLength={3}
          required
        />
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1.5">
        Mínimo 3 caracteres
        </p>
      </div>

      <div>
        <Label htmlFor="reg-password" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Contraseña</Label>
        <Input
          id="reg-password"
          type="password"
          className="block w-full px-4 py-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-300 dark:border-slate-600"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
        />
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1.5">
        Mínimo 6 caracteres
        </p>
      </div>

      <div>
        <Label htmlFor="reg-confirm" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Confirmar contraseña</Label>
        <Input
          id="reg-confirm"
          type="password"
          className="block w-full px-4 py-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-300 dark:border-slate-600"
          value={form.confirmPassword}
          onChange={(e) =>
            setForm({ ...form, confirmPassword: e.target.value })
          }
          required
        />
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-3 rounded-r-lg">
            <p className="text-sm text-red-900 dark:text-red-100 font-medium">
                {error}
            </p>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
            <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Registrando...
            </div>
        ) : "Crear cuenta"}
      </button>
    </form>
  );
}
