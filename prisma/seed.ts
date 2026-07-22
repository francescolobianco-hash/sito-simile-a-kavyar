import { PrismaClient } from "../src/generated/prisma";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("password123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@kavyar.it" },
    update: {},
    create: {
      name: "Admin Kavyar",
      email: "admin@kavyar.it",
      passwordHash,
      role: "ADMIN",
      avatarColor: "#0f172a",
    },
  });

  const teacher = await prisma.user.upsert({
    where: { email: "docente@kavyar.it" },
    update: {},
    create: {
      name: "Giulia Bianchi",
      email: "docente@kavyar.it",
      passwordHash,
      role: "TEACHER",
      avatarColor: "#4f46e5",
    },
  });

  const teacher2 = await prisma.user.upsert({
    where: { email: "marco.docente@kavyar.it" },
    update: {},
    create: {
      name: "Marco Ferri",
      email: "marco.docente@kavyar.it",
      passwordHash,
      role: "TEACHER",
      avatarColor: "#ea580c",
    },
  });

  const student = await prisma.user.upsert({
    where: { email: "studente@kavyar.it" },
    update: {},
    create: {
      name: "Sara Colombo",
      email: "studente@kavyar.it",
      passwordHash,
      role: "STUDENT",
      avatarColor: "#0891b2",
    },
  });

  const student2 = await prisma.user.upsert({
    where: { email: "luca.studente@kavyar.it" },
    update: {},
    create: {
      name: "Luca Romano",
      email: "luca.studente@kavyar.it",
      passwordHash,
      role: "STUDENT",
      avatarColor: "#16a34a",
    },
  });

  console.log("Utenti creati:", { admin: admin.email, teacher: teacher.email, student: student.email });

  // ---- Course 1: JavaScript moderno ----
  const course1 = await prisma.course.upsert({
    where: { slug: "javascript-moderno" },
    update: {},
    create: {
      title: "JavaScript Moderno da Zero",
      slug: "javascript-moderno",
      description:
        "Impara le basi di JavaScript ES6+, dalle variabili alle funzioni asincrone, con esercizi pratici e quiz di verifica.",
      category: "Sviluppo Web",
      level: "Base",
      coverColor: "#4f46e5",
      teacherId: teacher.id,
      modules: {
        create: [
          {
            title: "Fondamenta del linguaggio",
            order: 0,
            lessons: {
              create: [
                {
                  title: "Variabili, tipi e operatori",
                  type: "TEXT",
                  order: 0,
                  duration: 12,
                  content:
                    "In JavaScript le variabili si dichiarano con let, const e var. const crea un riferimento immutabile, let permette la riassegnazione, var è la forma storica con scope di funzione.\n\nI tipi primitivi sono: string, number, boolean, null, undefined, symbol e bigint. JavaScript è tipizzato dinamicamente, quindi il tipo di una variabile può cambiare a runtime.\n\nGli operatori aritmetici (+, -, *, /, %) funzionano come in altri linguaggi, ma attenzione all'operatore + con le stringhe: concatena invece di sommare.",
                },
                {
                  title: "Funzioni e arrow function",
                  type: "TEXT",
                  order: 1,
                  duration: 15,
                  content:
                    "Le funzioni tradizionali si dichiarano con function nome() {}. Le arrow function, introdotte in ES6, offrono una sintassi più compatta: const somma = (a, b) => a + b;\n\nUna differenza chiave è il binding di 'this': le arrow function non hanno un proprio 'this', ma ereditano quello del contesto in cui sono definite, il che le rende molto utili nelle callback.\n\nLe funzioni possono avere parametri di default e usare la rest syntax (...args) per accettare un numero variabile di argomenti.",
                },
                {
                  title: "Introduzione pratica in video",
                  type: "VIDEO",
                  order: 2,
                  duration: 8,
                  content: "https://www.youtube.com/embed/W6NZfCO5SIk",
                },
              ],
            },
            quizzes: {
              create: [
                {
                  title: "Quiz: Fondamenta",
                  questions: {
                    create: [
                      {
                        text: "Quale parola chiave crea un riferimento non riassegnabile?",
                        order: 0,
                        answers: {
                          create: [
                            { text: "let", isCorrect: false },
                            { text: "const", isCorrect: true },
                            { text: "var", isCorrect: false },
                            { text: "static", isCorrect: false },
                          ],
                        },
                      },
                      {
                        text: "Cosa restituisce 'this' in una arrow function?",
                        order: 1,
                        answers: {
                          create: [
                            { text: "Un nuovo oggetto vuoto", isCorrect: false },
                            { text: "Il this del contesto circostante", isCorrect: true },
                            { text: "Sempre undefined", isCorrect: false },
                            { text: "L'oggetto window", isCorrect: false },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
          {
            title: "Asincronia e Promise",
            order: 1,
            lessons: {
              create: [
                {
                  title: "Callback, Promise e async/await",
                  type: "TEXT",
                  order: 0,
                  duration: 18,
                  content:
                    "Le Promise rappresentano un valore che sarà disponibile in futuro, con tre stati: pending, fulfilled, rejected.\n\nasync/await è zucchero sintattico sopra le Promise: una funzione async restituisce sempre una Promise, e await sospende l'esecuzione fino alla risoluzione della Promise, rendendo il codice asincrono leggibile come se fosse sincrono.\n\nÈ buona pratica avvolgere le chiamate await in blocchi try/catch per gestire correttamente gli errori.",
                },
                {
                  title: "Lavorare con le fetch API",
                  type: "TEXT",
                  order: 1,
                  duration: 10,
                  content:
                    "La funzione fetch() permette di effettuare richieste HTTP. Restituisce una Promise che si risolve con un oggetto Response.\n\nEsempio: const res = await fetch(url); const data = await res.json();\n\nRicorda di controllare res.ok prima di processare i dati, per gestire correttamente gli errori HTTP.",
                },
              ],
            },
            quizzes: {
              create: [
                {
                  title: "Quiz: Asincronia",
                  questions: {
                    create: [
                      {
                        text: "Quanti stati può avere una Promise?",
                        order: 0,
                        answers: {
                          create: [
                            { text: "2", isCorrect: false },
                            { text: "3", isCorrect: true },
                            { text: "4", isCorrect: false },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  });

  // ---- Course 2: Design UI/UX ----
  const course2 = await prisma.course.upsert({
    where: { slug: "design-ui-ux-fondamentali" },
    update: {},
    create: {
      title: "Design UI/UX: le basi",
      slug: "design-ui-ux-fondamentali",
      description:
        "Principi fondamentali di design delle interfacce, teoria del colore, tipografia e usabilità per creare prodotti digitali efficaci.",
      category: "Design",
      level: "Base",
      coverColor: "#c026d3",
      teacherId: teacher.id,
      modules: {
        create: [
          {
            title: "Principi di base",
            order: 0,
            lessons: {
              create: [
                {
                  title: "Cos'è lo User Experience Design",
                  type: "TEXT",
                  order: 0,
                  duration: 10,
                  content:
                    "Lo UX design si occupa di progettare l'esperienza complessiva di un utente con un prodotto, includendo usabilità, accessibilità e piacevolezza d'uso.\n\nSi differenzia dallo UI design, che si concentra sull'aspetto visivo e sull'interazione con i singoli elementi dell'interfaccia.\n\nUn buon processo UX parte sempre dalla ricerca utente: interviste, test di usabilità e analisi dei dati.",
                },
                {
                  title: "Teoria del colore",
                  type: "TEXT",
                  order: 1,
                  duration: 12,
                  content:
                    "I colori comunicano emozioni e gerarchie visive. Una palette efficace di solito ha un colore primario, uno o due colori di accento e una scala di grigi neutri.\n\nIl contrasto tra testo e sfondo deve rispettare le linee guida WCAG per l'accessibilità (rapporto minimo 4.5:1 per il testo normale).",
                },
              ],
            },
            quizzes: {
              create: [
                {
                  title: "Quiz: Principi di base",
                  questions: {
                    create: [
                      {
                        text: "Qual è il rapporto di contrasto minimo WCAG AA per testo normale?",
                        order: 0,
                        answers: {
                          create: [
                            { text: "2:1", isCorrect: false },
                            { text: "3:1", isCorrect: false },
                            { text: "4.5:1", isCorrect: true },
                            { text: "7:1", isCorrect: false },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
          {
            title: "Tipografia e layout",
            order: 1,
            lessons: {
              create: [
                {
                  title: "Scegliere i font giusti",
                  type: "TEXT",
                  order: 0,
                  duration: 9,
                  content:
                    "Una buona coppia tipografica combina al massimo due o tre font: uno per i titoli, uno per il corpo del testo.\n\nLa leggibilità dipende da dimensione, interlinea (idealmente 1.4-1.6 volte la dimensione del font) e lunghezza della riga (45-75 caratteri).",
                },
              ],
            },
          },
        ],
      },
    },
  });

  // ---- Course 3: Data Analysis (second teacher) ----
  const course3 = await prisma.course.upsert({
    where: { slug: "analisi-dati-python" },
    update: {},
    create: {
      title: "Analisi dei Dati con Python",
      slug: "analisi-dati-python",
      description:
        "Un percorso pratico per imparare ad analizzare dataset con Python, pandas e le principali tecniche di visualizzazione.",
      category: "Data Science",
      level: "Intermedio",
      coverColor: "#16a34a",
      teacherId: teacher2.id,
      modules: {
        create: [
          {
            title: "Introduzione a pandas",
            order: 0,
            lessons: {
              create: [
                {
                  title: "DataFrame e Series",
                  type: "TEXT",
                  order: 0,
                  duration: 14,
                  content:
                    "pandas è la libreria Python più usata per la manipolazione di dati tabellari. Le sue due strutture principali sono la Series (array monodimensionale etichettato) e il DataFrame (tabella bidimensionale).\n\nSi crea un DataFrame da un dizionario, una lista di liste o leggendo un file con pd.read_csv().",
                },
                {
                  title: "Pulizia dei dati",
                  type: "TEXT",
                  order: 1,
                  duration: 16,
                  content:
                    "La pulizia dei dati è spesso la fase più lunga di un'analisi. Include la gestione dei valori mancanti (dropna, fillna), la rimozione dei duplicati (drop_duplicates) e la conversione dei tipi di dato (astype).",
                },
              ],
            },
            quizzes: {
              create: [
                {
                  title: "Quiz: pandas base",
                  questions: {
                    create: [
                      {
                        text: "Quale struttura pandas rappresenta dati tabellari bidimensionali?",
                        order: 0,
                        answers: {
                          create: [
                            { text: "Series", isCorrect: false },
                            { text: "DataFrame", isCorrect: true },
                            { text: "Array", isCorrect: false },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  });

  console.log("Corsi creati:", [course1.title, course2.title, course3.title]);

  // ---- Enrollments & progress for demo student ----
  await prisma.enrollment.upsert({
    where: { userId_courseId: { userId: student.id, courseId: course1.id } },
    update: {},
    create: { userId: student.id, courseId: course1.id },
  });
  await prisma.enrollment.upsert({
    where: { userId_courseId: { userId: student.id, courseId: course2.id } },
    update: {},
    create: { userId: student.id, courseId: course2.id },
  });
  await prisma.enrollment.upsert({
    where: { userId_courseId: { userId: student2.id, courseId: course1.id } },
    update: {},
    create: { userId: student2.id, courseId: course1.id },
  });

  const course1Full = await prisma.course.findUnique({
    where: { id: course1.id },
    include: { modules: { include: { lessons: true, quizzes: true } } },
  });
  const firstModuleLessons = course1Full!.modules[0].lessons;
  for (const lesson of firstModuleLessons) {
    await prisma.lessonProgress.upsert({
      where: { userId_lessonId: { userId: student.id, lessonId: lesson.id } },
      update: { completed: true, completedAt: new Date() },
      create: { userId: student.id, lessonId: lesson.id, completed: true, completedAt: new Date() },
    });
  }
  const firstQuiz = course1Full!.modules[0].quizzes[0];
  if (firstQuiz) {
    await prisma.quizAttempt.create({
      data: { userId: student.id, quizId: firstQuiz.id, score: 100 },
    });
  }

  console.log("Iscrizioni e progressi demo creati.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
