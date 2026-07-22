"use client";

import { useActionState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { loginAction } from "./actions";
import { Button } from "@/components/ui/Button";

export function LoginForm() {
  const [error, formAction, pending] = useActionState(loginAction, undefined);
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  return (
    <div className="rounded-2xl border border-border bg-white p-8 shadow-sm">
      <h1 className="text-2xl font-bold">Accedi</h1>
      <p className="mt-1 text-sm text-slate-500">
        Bentornato su Kavyar. Inserisci le tue credenziali.
      </p>

      <form action={formAction} className="mt-6 space-y-4">
        <input type="hidden" name="callbackUrl" value={callbackUrl} />
        <div>
          <label className="mb-1 block text-sm font-medium">Email</label>
          <input
            name="email"
            type="email"
            required
            className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            placeholder="nome@esempio.it"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Password</label>
          <input
            name="password"
            type="password"
            required
            className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            placeholder="••••••••"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <Button type="submit" disabled={pending} className="w-full">
          {pending ? "Accesso in corso..." : "Accedi"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Non hai un account?{" "}
        <Link href="/register" className="font-medium text-primary hover:underline">
          Registrati
        </Link>
      </p>

      <div className="mt-6 rounded-lg bg-slate-50 p-3 text-xs text-slate-500">
        <p className="font-medium text-slate-600">Account demo:</p>
        <p>Studente: studente@kavyar.it / password123</p>
        <p>Docente: docente@kavyar.it / password123</p>
        <p>Admin: admin@kavyar.it / password123</p>
      </div>
    </div>
  );
}
