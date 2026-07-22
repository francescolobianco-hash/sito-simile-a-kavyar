import Link from "next/link";
import { auth } from "@/auth";

export default async function Home() {
  const session = await auth();

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <div className="grid items-center gap-12 md:grid-cols-2">
        <div>
          <span className="inline-flex items-center rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 ring-1 ring-inset ring-indigo-200">
            Piattaforma e-learning
          </span>
          <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
            Impara nuove competenze con <span className="text-primary">Kavyar</span>
          </h1>
          <p className="mt-4 text-lg text-slate-600">
            Corsi online strutturati in moduli e lezioni, con video, contenuti testuali
            e quiz per verificare i tuoi progressi. Traccia il tuo avanzamento in ogni corso.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href={session ? "/dashboard" : "/register"}
              className="rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-primary-dark"
            >
              {session ? "Vai alla dashboard" : "Inizia gratis"}
            </Link>
            <Link
              href="/courses"
              className="rounded-lg bg-white px-6 py-3 text-sm font-semibold text-foreground ring-1 ring-inset ring-border hover:bg-slate-50"
            >
              Esplora il catalogo
            </Link>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: "Corsi disponibili", value: "50+" },
            { label: "Studenti attivi", value: "2.400+" },
            { label: "Ore di contenuti", value: "1.200+" },
            { label: "Docenti", value: "80+" },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-border">
              <p className="text-3xl font-bold text-primary">{s.value}</p>
              <p className="mt-1 text-sm text-slate-500">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-24 grid gap-8 sm:grid-cols-3">
        {[
          {
            title: "Corsi a moduli",
            desc: "Contenuti organizzati in moduli e lezioni video o testuali, al tuo ritmo.",
          },
          {
            title: "Quiz e verifica",
            desc: "Metti alla prova le tue conoscenze con quiz a risposta multipla e punteggio.",
          },
          {
            title: "Progressi tracciati",
            desc: "Dashboard personale con avanzamento per corso e attestati di completamento.",
          },
        ].map((f) => (
          <div key={f.title} className="rounded-2xl border border-border bg-white p-6">
            <h3 className="font-semibold text-lg">{f.title}</h3>
            <p className="mt-2 text-sm text-slate-600">{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
