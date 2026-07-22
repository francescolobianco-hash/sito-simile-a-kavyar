# Kavyar Learning

Piattaforma di e-learning full-stack: corsi organizzati in moduli e lezioni (video/testo), quiz a risposta multipla con punteggio, tracking dei progressi, pannello per docenti (creazione/gestione corsi) e pannello admin (gestione utenti).

## Stack

- [Next.js](https://nextjs.org) (App Router) + TypeScript
- Tailwind CSS
- Prisma + PostgreSQL
- NextAuth.js (Auth.js) v5 — autenticazione a credenziali con ruoli STUDENT / TEACHER / ADMIN

## Avvio in locale

Serve un database PostgreSQL raggiungibile (locale, Docker o hosted). Esempio rapido con Docker:

```bash
docker run --name kavyar-db -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=kavyar -p 5432:5432 -d postgres:16
```

Poi:

```bash
npm install
cp .env.example .env   # imposta DATABASE_URL e genera AUTH_SECRET con: openssl rand -base64 32
npx prisma migrate dev
npm run db:seed
npm run dev
```

L'app sarà disponibile su http://localhost:3000.

## Deploy su Vercel

1. Importa il repository su [vercel.com](https://vercel.com/new).
2. Aggiungi un database Postgres dal marketplace di Vercel (es. Vercel Postgres, Neon, Supabase) — la `DATABASE_URL` viene impostata automaticamente come variabile d'ambiente.
3. Imposta manualmente la variabile `AUTH_SECRET` (genera con `openssl rand -base64 32`).
4. Deploy: lo script `build` (`prisma migrate deploy && next build`) applica le migration al database di produzione a ogni deploy.
5. (Opzionale) Popola dati demo eseguendo `npm run db:seed` con la `DATABASE_URL` di produzione, o crea i tuoi account tramite `/register`.

## Account demo (dopo il seed)

| Ruolo      | Email                    | Password    |
|------------|---------------------------|-------------|
| Studente   | studente@kavyar.it        | password123 |
| Docente    | docente@kavyar.it         | password123 |
| Admin      | admin@kavyar.it           | password123 |

## Funzionalità principali

- **Studenti**: catalogo corsi, iscrizione, dashboard con progressi, lezioni video/testo, quiz con feedback immediato.
- **Docenti**: creazione e modifica corsi, moduli, lezioni e quiz (con domande/risposte), visualizzazione studenti iscritti e loro avanzamento.
- **Admin**: gestione ruoli utenti, visibilità su tutti i corsi della piattaforma.
