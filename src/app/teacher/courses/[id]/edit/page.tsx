import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ConfirmForm } from "@/components/teacher/ConfirmForm";
import {
  updateCourseAction,
  deleteCourseAction,
  addModuleAction,
  deleteModuleAction,
  addLessonAction,
  deleteLessonAction,
  addQuizAction,
  deleteQuizAction,
} from "@/lib/actions/teacher";

export default async function EditCoursePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (!session) redirect("/login");

  const course = await prisma.course.findUnique({
    where: { id },
    include: {
      modules: {
        orderBy: { order: "asc" },
        include: {
          lessons: { orderBy: { order: "asc" } },
          quizzes: { include: { questions: true } },
        },
      },
      enrollments: { include: { user: true } },
    },
  });
  if (!course) notFound();
  if (session.user.role !== "ADMIN" && course.teacherId !== session.user.id) {
    redirect("/teacher/courses");
  }

  const progressByStudent = new Map<string, { completed: number; total: number }>();
  const totalLessons = course.modules.reduce((s, m) => s + m.lessons.length, 0);
  if (course.enrollments.length > 0) {
    const allProgress = await prisma.lessonProgress.findMany({
      where: {
        completed: true,
        userId: { in: course.enrollments.map((e) => e.userId) },
        lesson: { module: { courseId: course.id } },
      },
    });
    for (const e of course.enrollments) {
      const completed = allProgress.filter((p) => p.userId === e.userId).length;
      progressByStudent.set(e.userId, { completed, total: totalLessons });
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/teacher/courses" className="text-sm font-medium text-primary hover:underline">
            ← I miei corsi
          </Link>
          <h1 className="mt-1 text-2xl font-bold">{course.title}</h1>
        </div>
        <ConfirmForm
          action={deleteCourseAction.bind(null, course.id)}
          message="Eliminare definitivamente questo corso e tutti i suoi contenuti?"
        >
          <button className="rounded-lg bg-red-50 px-4 py-2 text-sm font-medium text-red-600 ring-1 ring-inset ring-red-200 hover:bg-red-100">
            Elimina corso
          </button>
        </ConfirmForm>
      </div>

      {/* Course info */}
      <section className="mt-6 rounded-2xl border border-border bg-white p-6">
        <h2 className="font-semibold">Informazioni corso</h2>
        <form action={updateCourseAction.bind(null, course.id)} className="mt-4 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Titolo</label>
            <input
              name="title"
              defaultValue={course.title}
              required
              className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Descrizione</label>
            <textarea
              name="description"
              defaultValue={course.description}
              rows={3}
              required
              className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Categoria</label>
              <input
                name="category"
                defaultValue={course.category}
                className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Livello</label>
              <select
                name="level"
                defaultValue={course.level}
                className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option>Base</option>
                <option>Intermedio</option>
                <option>Avanzato</option>
              </select>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Colore</label>
              <input name="coverColor" type="color" defaultValue={course.coverColor} className="h-9 w-14 rounded border border-border" />
            </div>
            <label className="flex items-center gap-2 text-sm font-medium">
              <input type="checkbox" name="published" defaultChecked={course.published} />
              Pubblicato
            </label>
          </div>
          <button className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark">
            Salva modifiche
          </button>
        </form>
      </section>

      {/* Enrolled students */}
      <section className="mt-6 rounded-2xl border border-border bg-white p-6">
        <h2 className="font-semibold">Studenti iscritti ({course.enrollments.length})</h2>
        {course.enrollments.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">Nessuno studente iscritto ancora.</p>
        ) : (
          <ul className="mt-3 divide-y divide-border">
            {course.enrollments.map((e) => {
              const p = progressByStudent.get(e.userId) ?? { completed: 0, total: totalLessons };
              const pct = p.total === 0 ? 0 : Math.round((p.completed / p.total) * 100);
              return (
                <li key={e.id} className="flex items-center justify-between py-2 text-sm">
                  <span>{e.user.name}</span>
                  <span className="text-slate-500">
                    {p.completed}/{p.total} lezioni ({pct}%)
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* Modules */}
      <section className="mt-6 space-y-4">
        <h2 className="font-semibold">Moduli e contenuti</h2>
        {course.modules.map((mod, i) => (
          <div key={mod.id} className="rounded-2xl border border-border bg-white">
            <div className="flex items-center justify-between border-b border-border px-5 py-3">
              <h3 className="font-medium">
                Modulo {i + 1}: {mod.title}
              </h3>
              <ConfirmForm action={deleteModuleAction.bind(null, mod.id, course.id)} message="Eliminare questo modulo e tutto il suo contenuto?">
                <button className="text-xs font-medium text-red-600 hover:underline">Elimina modulo</button>
              </ConfirmForm>
            </div>

            <ul className="divide-y divide-border">
              {mod.lessons.map((l) => (
                <li key={l.id} className="flex items-center justify-between px-5 py-2 text-sm">
                  <span>
                    {l.type === "VIDEO" ? "🎬" : "📄"} {l.title} · {l.duration} min
                  </span>
                  <ConfirmForm action={deleteLessonAction.bind(null, l.id, course.id)} message="Eliminare questa lezione?">
                    <button className="text-xs font-medium text-red-500 hover:underline">Elimina</button>
                  </ConfirmForm>
                </li>
              ))}
              {mod.quizzes.map((q) => (
                <li key={q.id} className="flex items-center justify-between px-5 py-2 text-sm">
                  <Link
                    href={`/teacher/courses/${course.id}/quizzes/${q.id}`}
                    className="text-primary hover:underline"
                  >
                    📝 {q.title} ({q.questions.length} domande)
                  </Link>
                  <ConfirmForm action={deleteQuizAction.bind(null, q.id, course.id)} message="Eliminare questo quiz?">
                    <button className="text-xs font-medium text-red-500 hover:underline">Elimina</button>
                  </ConfirmForm>
                </li>
              ))}
            </ul>

            <div className="grid grid-cols-1 gap-3 border-t border-border p-4 sm:grid-cols-2">
              <form action={addLessonAction.bind(null, mod.id, course.id)} className="space-y-2 rounded-lg bg-slate-50 p-3">
                <p className="text-xs font-semibold text-slate-500">Aggiungi lezione</p>
                <input
                  name="title"
                  required
                  placeholder="Titolo lezione"
                  className="w-full rounded-md border border-border px-2 py-1.5 text-sm"
                />
                <div className="flex gap-2">
                  <select name="type" className="rounded-md border border-border px-2 py-1.5 text-sm">
                    <option value="TEXT">Testo</option>
                    <option value="VIDEO">Video</option>
                  </select>
                  <input
                    name="duration"
                    type="number"
                    min={1}
                    defaultValue={10}
                    className="w-20 rounded-md border border-border px-2 py-1.5 text-sm"
                  />
                </div>
                <textarea
                  name="content"
                  required
                  rows={2}
                  placeholder="Testo della lezione o URL embed video"
                  className="w-full rounded-md border border-border px-2 py-1.5 text-sm"
                />
                <button className="w-full rounded-md bg-white px-3 py-1.5 text-xs font-medium ring-1 ring-inset ring-border hover:bg-slate-100">
                  Aggiungi lezione
                </button>
              </form>

              <form action={addQuizAction.bind(null, mod.id, course.id)} className="space-y-2 rounded-lg bg-slate-50 p-3">
                <p className="text-xs font-semibold text-slate-500">Aggiungi quiz</p>
                <input
                  name="title"
                  required
                  placeholder="Titolo quiz"
                  className="w-full rounded-md border border-border px-2 py-1.5 text-sm"
                />
                <button className="w-full rounded-md bg-white px-3 py-1.5 text-xs font-medium ring-1 ring-inset ring-border hover:bg-slate-100">
                  Crea quiz
                </button>
                <p className="text-[11px] text-slate-400">Dopo la creazione potrai aggiungere le domande.</p>
              </form>
            </div>
          </div>
        ))}

        <form action={addModuleAction.bind(null, course.id)} className="flex gap-2 rounded-2xl border border-dashed border-border bg-white p-4">
          <input
            name="title"
            required
            placeholder="Titolo nuovo modulo"
            className="flex-1 rounded-lg border border-border px-3 py-2 text-sm"
          />
          <button className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark">
            + Aggiungi modulo
          </button>
        </form>
      </section>
    </div>
  );
}
