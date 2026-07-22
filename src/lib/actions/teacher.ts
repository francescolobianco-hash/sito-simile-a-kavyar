"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

async function requireTeacher() {
  const session = await auth();
  if (!session?.user || (session.user.role !== "TEACHER" && session.user.role !== "ADMIN")) {
    throw new Error("Non autorizzato");
  }
  return session.user;
}

async function assertCourseOwner(courseId: string, userId: string, isAdmin: boolean) {
  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course) throw new Error("Corso non trovato");
  if (!isAdmin && course.teacherId !== userId) throw new Error("Non autorizzato");
  return course;
}

// The following helpers authorize a mutation using the resource's *actual*
// parent course (via its DB relations), never a client-supplied courseId.
// This prevents a teacher from operating on another teacher's module,
// lesson, quiz or question by pairing their own courseId with someone
// else's resource id.

async function assertOwnedModule(moduleId: string, userId: string, isAdmin: boolean) {
  const mod = await prisma.module.findUnique({ where: { id: moduleId }, include: { course: true } });
  if (!mod) throw new Error("Modulo non trovato");
  if (!isAdmin && mod.course.teacherId !== userId) throw new Error("Non autorizzato");
  return mod;
}

async function assertOwnedLesson(lessonId: string, userId: string, isAdmin: boolean) {
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: { module: { include: { course: true } } },
  });
  if (!lesson) throw new Error("Lezione non trovata");
  if (!isAdmin && lesson.module.course.teacherId !== userId) throw new Error("Non autorizzato");
  return lesson;
}

async function assertOwnedQuiz(quizId: string, userId: string, isAdmin: boolean) {
  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    include: { module: { include: { course: true } } },
  });
  if (!quiz) throw new Error("Quiz non trovato");
  if (!isAdmin && quiz.module.course.teacherId !== userId) throw new Error("Non autorizzato");
  return quiz;
}

async function assertOwnedQuestion(questionId: string, userId: string, isAdmin: boolean) {
  const question = await prisma.question.findUnique({
    where: { id: questionId },
    include: { quiz: { include: { module: { include: { course: true } } } } },
  });
  if (!question) throw new Error("Domanda non trovata");
  if (!isAdmin && question.quiz.module.course.teacherId !== userId) throw new Error("Non autorizzato");
  return question;
}

function slugify(title: string) {
  return (
    title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .slice(0, 60) +
    "-" +
    Math.random().toString(36).slice(2, 7)
  );
}

export async function createCourseAction(formData: FormData) {
  const user = await requireTeacher();
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const category = (formData.get("category") as string) || "Generale";
  const level = (formData.get("level") as string) || "Base";
  const coverColor = (formData.get("coverColor") as string) || "#4f46e5";

  const course = await prisma.course.create({
    data: {
      title,
      description,
      category,
      level,
      coverColor,
      slug: slugify(title),
      teacherId: user.id,
    },
  });

  revalidatePath("/teacher/courses");
  redirect(`/teacher/courses/${course.id}/edit`);
}

export async function updateCourseAction(courseId: string, formData: FormData) {
  const user = await requireTeacher();
  await assertCourseOwner(courseId, user.id, user.role === "ADMIN");

  await prisma.course.update({
    where: { id: courseId },
    data: {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      category: formData.get("category") as string,
      level: formData.get("level") as string,
      coverColor: formData.get("coverColor") as string,
      published: formData.get("published") === "on",
    },
  });

  revalidatePath(`/teacher/courses/${courseId}/edit`);
  revalidatePath("/courses");
}

export async function deleteCourseAction(courseId: string) {
  const user = await requireTeacher();
  await assertCourseOwner(courseId, user.id, user.role === "ADMIN");
  await prisma.course.delete({ where: { id: courseId } });
  revalidatePath("/teacher/courses");
  redirect("/teacher/courses");
}

export async function addModuleAction(courseId: string, formData: FormData) {
  const user = await requireTeacher();
  await assertCourseOwner(courseId, user.id, user.role === "ADMIN");

  const count = await prisma.module.count({ where: { courseId } });
  await prisma.module.create({
    data: { title: formData.get("title") as string, order: count, courseId },
  });

  revalidatePath(`/teacher/courses/${courseId}/edit`);
}

export async function deleteModuleAction(moduleId: string, courseId: string) {
  const user = await requireTeacher();
  const mod = await assertOwnedModule(moduleId, user.id, user.role === "ADMIN");
  await prisma.module.delete({ where: { id: moduleId } });
  revalidatePath(`/teacher/courses/${mod.courseId}/edit`);
  revalidatePath(`/teacher/courses/${courseId}/edit`);
}

export async function addLessonAction(moduleId: string, courseId: string, formData: FormData) {
  const user = await requireTeacher();
  const mod = await assertOwnedModule(moduleId, user.id, user.role === "ADMIN");

  const count = await prisma.lesson.count({ where: { moduleId } });
  await prisma.lesson.create({
    data: {
      title: formData.get("title") as string,
      type: (formData.get("type") as "VIDEO" | "TEXT") || "TEXT",
      content: formData.get("content") as string,
      duration: Number(formData.get("duration")) || 5,
      order: count,
      moduleId,
    },
  });

  revalidatePath(`/teacher/courses/${mod.courseId}/edit`);
  revalidatePath(`/teacher/courses/${courseId}/edit`);
}

export async function deleteLessonAction(lessonId: string, courseId: string) {
  const user = await requireTeacher();
  const lesson = await assertOwnedLesson(lessonId, user.id, user.role === "ADMIN");
  await prisma.lesson.delete({ where: { id: lessonId } });
  revalidatePath(`/teacher/courses/${lesson.module.courseId}/edit`);
  revalidatePath(`/teacher/courses/${courseId}/edit`);
}

export async function addQuizAction(moduleId: string, courseId: string, formData: FormData) {
  const user = await requireTeacher();
  const mod = await assertOwnedModule(moduleId, user.id, user.role === "ADMIN");

  await prisma.quiz.create({
    data: { title: formData.get("title") as string, moduleId },
  });

  revalidatePath(`/teacher/courses/${mod.courseId}/edit`);
  revalidatePath(`/teacher/courses/${courseId}/edit`);
}

export async function deleteQuizAction(quizId: string, courseId: string) {
  const user = await requireTeacher();
  const quiz = await assertOwnedQuiz(quizId, user.id, user.role === "ADMIN");
  await prisma.quiz.delete({ where: { id: quizId } });
  revalidatePath(`/teacher/courses/${quiz.module.courseId}/edit`);
  revalidatePath(`/teacher/courses/${courseId}/edit`);
}

export async function addQuestionAction(quizId: string, courseId: string, formData: FormData) {
  const user = await requireTeacher();
  const quiz = await assertOwnedQuiz(quizId, user.id, user.role === "ADMIN");

  const text = formData.get("text") as string;
  const correctIndex = Number(formData.get("correctIndex"));
  const rawOptions = [0, 1, 2, 3].map((i) => ((formData.get(`option${i}`) as string) ?? "").trim());
  const options = rawOptions
    .map((optText, i) => ({ text: optText, isCorrect: i === correctIndex }))
    .filter((opt) => opt.text.length > 0);

  const count = await prisma.question.count({ where: { quizId } });
  await prisma.question.create({
    data: {
      text,
      order: count,
      quizId,
      answers: {
        create: options,
      },
    },
  });

  revalidatePath(`/teacher/courses/${quiz.module.courseId}/edit`);
  revalidatePath(`/teacher/courses/${courseId}/edit`);
}

export async function deleteQuestionAction(questionId: string, courseId: string) {
  const user = await requireTeacher();
  const question = await assertOwnedQuestion(questionId, user.id, user.role === "ADMIN");
  await prisma.question.delete({ where: { id: questionId } });
  revalidatePath(`/teacher/courses/${question.quiz.module.courseId}/edit`);
  revalidatePath(`/teacher/courses/${courseId}/edit`);
}
