"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function submitQuizAction(quizId: string, answers: Record<string, string>) {
  const session = await auth();
  if (!session?.user) throw new Error("Non autenticato");

  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    include: { questions: { include: { answers: true } } },
  });
  if (!quiz) throw new Error("Quiz non trovato");

  let correctCount = 0;
  const correctAnswers: Record<string, string> = {};
  for (const question of quiz.questions) {
    const correct = question.answers.find((a) => a.isCorrect);
    if (correct) correctAnswers[question.id] = correct.id;
    if (correct && answers[question.id] === correct.id) correctCount++;
  }

  const total = quiz.questions.length;
  const score = total === 0 ? 0 : Math.round((correctCount / total) * 100);

  await prisma.quizAttempt.create({
    data: { userId: session.user.id, quizId, score },
  });

  revalidatePath("/dashboard");

  return { score, correctCount, total, correctAnswers };
}
