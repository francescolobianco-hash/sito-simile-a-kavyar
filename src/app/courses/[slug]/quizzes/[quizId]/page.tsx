import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { QuizForm } from "./QuizForm";

export default async function QuizPage({
  params,
}: {
  params: Promise<{ slug: string; quizId: string }>;
}) {
  const { slug, quizId } = await params;
  const session = await auth();
  if (!session) redirect("/login");

  const course = await prisma.course.findUnique({ where: { slug } });
  if (!course) notFound();

  if (session.user.role === "STUDENT") {
    const enrollment = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId: session.user.id, courseId: course.id } },
    });
    if (!enrollment) redirect(`/courses/${slug}`);
  }

  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    include: {
      questions: {
        orderBy: { order: "asc" },
        include: { answers: true },
      },
    },
  });
  if (!quiz) notFound();

  const questions = quiz.questions.map((q) => ({
    id: q.id,
    text: q.text,
    answers: q.answers.map((a) => ({ id: a.id, text: a.text })),
  }));

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <Link href={`/courses/${slug}`} className="text-sm font-medium text-primary hover:underline">
        ← Torna al corso
      </Link>
      <h1 className="mt-3 text-2xl font-bold">{quiz.title}</h1>
      <p className="mt-1 text-sm text-slate-500">{questions.length} domande a risposta multipla</p>

      <div className="mt-6">
        <QuizForm quizId={quiz.id} slug={slug} questions={questions} />
      </div>
    </div>
  );
}
