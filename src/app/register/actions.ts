"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signIn } from "@/auth";
import { AuthError } from "next-auth";

const PALETTE = ["#4f46e5", "#0891b2", "#c026d3", "#ea580c", "#16a34a", "#db2777"];

export async function registerAction(_prevState: string | undefined, formData: FormData) {
  const name = (formData.get("name") as string)?.trim();
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const password = formData.get("password") as string;
  const role = formData.get("role") as string;

  if (!name || !email || !password) {
    return "Compila tutti i campi.";
  }
  if (password.length < 8) {
    return "La password deve avere almeno 8 caratteri.";
  }
  if (role !== "STUDENT" && role !== "TEACHER") {
    return "Ruolo non valido.";
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return "Esiste già un account con questa email.";
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      role,
      avatarColor: PALETTE[Math.floor(Math.random() * PALETTE.length)],
    },
  });

  try {
    await signIn("credentials", { email, password, redirectTo: "/dashboard" });
  } catch (error) {
    if (error instanceof AuthError) {
      return "Registrazione riuscita, ma accesso automatico fallito. Prova ad accedere.";
    }
    throw error;
  }
}
