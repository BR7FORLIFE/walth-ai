import { supabase } from "@lib/supabase/client";

//normalizar al usuario
export function normalizeUsername(raw: string) {
  return raw
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ".")
    .replace(/[^a-z0-9._-]/g, "")
    .replace(/\.+/g, ".")
    .replace(/^\.|\.$/g, "");
}

//colocar el prefijo del dominio del correo de nuestra aplicacion
export function usernameToSyntheticEmail(raw: string) {
  const username = normalizeUsername(raw);
  if (!username) return "";
  return `${username}@welth.app`;
}

// errores de Authenticacion por parte de supabase
export function humanizeAuthError(message: string) {
  const raw = (message || "").trim();
  const lower = raw.toLowerCase();

  if (lower.includes("email signups are disabled")) {
    return (
      "Supabase bloqueó el registro: ‘Email signups are disabled’. " +
      "Revisa Authentication → Providers: habilita Email y ‘Allow new users to sign up’."
    );
  }

  if (lower.includes("user already registered")) {
    return "Ese usuario ya existe. Intenta con otro.";
  }

  return raw || "Ocurrió un error";
}

//servicios Auth


//funciona para logear al usuario
export async function loginUser(username: string, password: string) {
  const normalized = normalizeUsername(username);
  if (!normalized) throw new Error("Ingresa un usuario válido");

  const email = usernameToSyntheticEmail(normalized);

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw new Error(humanizeAuthError(error.message));
}

//funcion para registrar el usuario
export async function registerUser(username: string, password: string) {
  const normalized = normalizeUsername(username);

  if (!normalized || normalized.length < 3) {
    throw new Error(
      "El usuario debe tener al menos 3 caracteres (a-z, 0-9, . _ -)"
    );
  }

  const email = usernameToSyntheticEmail(normalized);

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { username: normalized } },
  });

  if (error) throw new Error(humanizeAuthError(error.message));

  return data;
}

//creamos un perfil del usuario
export async function createProfile(userId: string, username: string) {
  const { error } = await supabase.from("profiles").insert({
    user_id: userId,
    username,
  });

  if (error) throw new Error("No se pudo insertar el perfil.");
}
