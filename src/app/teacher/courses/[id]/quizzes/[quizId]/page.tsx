import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ConfirmForm } from "@/components/teacher/ConfirmForm";
import { addQuestionAction, deleteQuestionAction } from "@/lib/actions/teacher";

export default async function ManageQuizPage({
  params,
}: {
  params: Promise<{ id: string; quizId: string }>;
}) {
  const { id, quizId } = await params;
  const session = await auth();
  if (!session) redirect("/login");

  const course = await prisma.course.findUnique({ where: { id } });
  if (!course) notFound();
  if (session.user.role !== "ADMIN" && course.teacherId !== session.user.id) {
    redirect("/teacher/courses");
  }

  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    include: { questions: { orderBy: { order: "asc" }, include: { answers: true } } },
  });
  if (!quiz) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <Link href={`/teacher/courses/${id}/edit`} className="text-sm font-medium text-primary hover:underline">
        ← Torna al corso
      </Link>
      <h1 className="mt-1 text-2xl font-bold">{quiz.title}</h1>
      <p className="mt-1 text-sm text-slate-500">Gestisci le domande a risposta multipla del quiz.</p>

      <div className="mt-6 space-y-4">
        {quiz.questions.map((q, i) => (
          <div key={q.id} className="rounded-2xl border border-border bg-white p-5">
            <div className="flex items-start justify-between">
              <p className="font-medium">
                {i + 1}. {q.text}
              </p>
              <ConfirmForm action={deleteQuestionAction.bind(null, q.id, id)} message="Eliminare questa domanda?">
                <button className="text-xs font-medium text-red-500 hover:underline">Elimina</button>
              </ConfirmForm>
            </div>
            <ul className="mt-2 space-y-1">
              {q.answers.map((a) => (
                <li
                  key={a.id}
                  className={`rounded-md px-3 py-1.5 text-sm ${
                    a.isCorrect ? "bg-teal-50 text-teal-700 ring-1 ring-inset ring-teal-200" : "bg-slate-50 text-slate-600"
                  }`}
                >
                  {a.isCorrect ? "✓ " : ""}
                  {a.text}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <form
        action={addQuestionAction.bind(null, quizId, id)}
        className="mt-6 space-y-3 rounded-2xl border border-dashed border-border bg-white p-5"
      >
        <p className="font-medium">Nuova domanda</p>
        <input
          name="text"
          required
          placeholder="Testo della domanda"
          className="w-full rounded-lg border border-border px-3 py-2 text-sm"
        />
        <div className="space-y-2">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                type="radio"
                name="correctIndex"
                value={i}
                required
                defaultChecked={i === 0}
                className="accent-indigo-600"
              />
              <input
                name={`option${i}`}
                required={i < 2}
                placeholder={`Opzione ${i + 1}${i < 2 ? "" : " (opzionale)"}`}
                className="flex-1 rounded-lg border border-border px-3 py-1.5 text-sm"
              />
            </div>
          ))}
        </div>
        <p className="text-xs text-slate-400">Seleziona il pallino accanto alla risposta corretta.</p>
        <button className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark">
          Aggiungi domanda
        </button>
      </form>
    </div>
  );
}
