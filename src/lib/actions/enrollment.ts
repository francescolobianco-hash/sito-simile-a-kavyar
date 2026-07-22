"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function enrollAction(courseId: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Non autenticato");

  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course || !course.published) throw new Error("Corso non disponibile");

  await prisma.enrollment.upsert({
    where: { userId_courseId: { userId: session.user.id, courseId } },
    update: {},
    create: { userId: session.user.id, courseId },
  });

  revalidatePath("/courses");
  revalidatePath("/dashboard");
}

export async function markLessonCompleteAction(lessonId: string, completed: boolean) {
  const session = await auth();
  if (!session?.user) throw new Error("Non autenticato");

  await prisma.lessonProgress.upsert({
    where: { userId_lessonId: { userId: session.user.id, lessonId } },
    update: { completed, completedAt: completed ? new Date() : null },
    create: {
      userId: session.user.id,
      lessonId,
      completed,
      completedAt: completed ? new Date() : null,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/courses");
}
