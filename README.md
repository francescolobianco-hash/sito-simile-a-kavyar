# Kavyar Learning

Piattaforma di e-learning full-stack: corsi organizzati in moduli e lezioni (video/testo), quiz a risposta multipla con punteggio, tracking dei progressi, pannello per docenti (creazione/gestione corsi) e pannello admin (gestione utenti).

## Stack

- [Next.js](https://nextjs.org) (App Router) + TypeScript
- Tailwind CSS
- Prisma + SQLite
- NextAuth.js (Auth.js) v5 — autenticazione a credenziali con ruoli STUDENT / TEACHER / ADMIN

## Avvio in locale

```bash
npm install
cp .env.example .env   # poi genera un AUTH_SECRET con: openssl rand -base64 32
npx prisma migrate dev
npm run db:seed
npm run dev
```

L'app sarà disponibile su http://localhost:3000.

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
