"use server";

import { z } from "zod";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { anthropic } from "@/lib/anthropic";

async function requireTeacher() {
  const session = await auth();
  if (!session?.user || (session.user.role !== "TEACHER" && session.user.role !== "ADMIN")) {
    throw new Error("Non autorizzato");
  }
  return session.user;
}

async function assertOwnedQuiz(quizId: string, userId: string, isAdmin: boolean) {
  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    include: { module: { include: { course: true, lessons: true } } },
  });
  if (!quiz) throw new Error("Quiz non trovato");
  if (!isAdmin && quiz.module.course.teacherId !== userId) throw new Error("Non autorizzato");
  return quiz;
}

const GeneratedQuizSchema = z.object({
  questions: z
    .array(
      z.object({
        text: z.string(),
        options: z.array(z.string()).length(4),
        correctIndex: z.number().int().min(0).max(3),
      })
    )
    .min(1)
    .max(8),
});

export type GenerateQuizState = { error?: string; success?: string } | undefined;

export async function generateQuizQuestionsAction(
  quizId: string,
  courseId: string,
  _prevState: GenerateQuizState,
  formData: FormData
): Promise<GenerateQuizState> {
  const user = await requireTeacher();
  const quiz = await assertOwnedQuiz(quizId, user.id, user.role === "ADMIN");

  const count = Math.min(8, Math.max(1, Number(formData.get("count")) || 5));

  const lessonText = quiz.module.lessons
    .filter((l) => l.type === "TEXT")
    .map((l) => `## ${l.title}\n${l.content}`)
    .join("\n\n")
    .slice(0, 12000);

  if (!lessonText.trim()) {
    return { error: "Il modulo non ha lezioni testuali da cui generare le domande." };
  }

  let generated;
  try {
    const response = await anthropic.messages.parse({
      model: "claude-opus-4-8",
      max_tokens: 4096,
      system:
        "Sei un assistente che crea quiz didattici in italiano per una piattaforma e-learning. Genera domande a risposta multipla chiare e pertinenti al contenuto fornito, con esattamente 4 opzioni ciascuna e una sola risposta corretta.",
      messages: [
        {
          role: "user",
          content: `Genera ${count} domande a risposta multipla in italiano basate esclusivamente sul seguente contenuto del modulo "${quiz.module.title}":\n\n${lessonText}`,
        },
      ],
      output_config: {
        format: zodOutputFormat(GeneratedQuizSchema),
      },
    });
    generated = response.parsed_output;
  } catch {
    return { error: "Errore durante la generazione AI. Riprova tra poco." };
  }

  if (!generated) {
    return { error: "La generazione AI non ha prodotto un risultato valido. Riprova." };
  }

  const existingCount = await prisma.question.count({ where: { quizId } });
  for (let i = 0; i < generated.questions.length; i++) {
    const q = generated.questions[i];
    await prisma.question.create({
      data: {
        text: q.text,
        order: existingCount + i,
        quizId,
        answers: {
          create: q.options.map((text, idx) => ({
            text,
            isCorrect: idx === q.correctIndex,
          })),
        },
      },
    });
  }

  revalidatePath(`/teacher/courses/${courseId}/quizzes/${quizId}`);
  return { success: `${generated.questions.length} domande generate con successo.` };
}
