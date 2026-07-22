import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { markLessonCompleteAction } from "@/lib/actions/enrollment";

export default async function LessonPage({
  params,
}: {
  params: Promise<{ slug: string; lessonId: string }>;
}) {
  const { slug, lessonId } = await params;
  const session = await auth();
  if (!session) redirect("/login");

  const course = await prisma.course.findUnique({
    where: { slug },
    include: {
      modules: {
        orderBy: { order: "asc" },
        include: {
          lessons: { orderBy: { order: "asc" } },
          quizzes: true,
        },
      },
    },
  });
  if (!course) notFound();

  const isOwnerOrAdmin = session.user.role !== "STUDENT";
  if (!isOwnerOrAdmin) {
    const enrollment = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId: session.user.id, courseId: course.id } },
    });
    if (!enrollment) redirect(`/courses/${slug}`);
  }

  const lesson = course.modules.flatMap((m) => m.lessons).find((l) => l.id === lessonId);
  if (!lesson) notFound();

  const progress = await prisma.lessonProgress.findUnique({
    where: { userId_lessonId: { userId: session.user.id, lessonId } },
  });
  const isCompleted = progress?.completed ?? false;

  // Flatten items (lessons + quizzes) in module order for prev/next nav
  const items = course.modules.flatMap((m) => [
    ...m.lessons.map((l) => ({ kind: "lesson" as const, id: l.id, title: l.title })),
    ...m.quizzes.map((q) => ({ kind: "quiz" as const, id: q.id, title: q.title })),
  ]);
  const idx = items.findIndex((it) => it.kind === "lesson" && it.id === lessonId);
  const prevItem = idx > 0 ? items[idx - 1] : null;
  const nextItem = idx < items.length - 1 ? items[idx + 1] : null;

  const completedLessons = await prisma.lessonProgress.findMany({
    where: { userId: session.user.id, completed: true },
    select: { lessonId: true },
  });
  const completedIds = new Set(completedLessons.map((p) => p.lessonId));

  return (
    <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[280px_1fr]">
      <aside className="order-2 lg:order-1">
        <Link href={`/courses/${slug}`} className="text-sm font-medium text-primary hover:underline">
          ← Torna al corso
        </Link>
        <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
          {course.title}
        </p>
        <div className="mt-2 space-y-4">
          {course.modules.map((mod, i) => (
            <div key={mod.id}>
              <p className="mb-1 text-xs font-semibold text-slate-500">
                Modulo {i + 1}: {mod.title}
              </p>
              <ul className="space-y-0.5">
                {mod.lessons.map((l) => (
                  <li key={l.id}>
                    <Link
                      href={`/courses/${slug}/lessons/${l.id}`}
                      className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-sm ${
                        l.id === lessonId
                          ? "bg-primary/10 font-medium text-primary"
                          : "text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      <span className="text-xs">{completedIds.has(l.id) ? "✅" : "⚪️"}</span>
                      {l.title}
                    </Link>
                  </li>
                ))}
                {mod.quizzes.map((q) => (
                  <li key={q.id}>
                    <Link
                      href={`/courses/${slug}/quizzes/${q.id}`}
                      className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-slate-600 hover:bg-slate-100"
                    >
                      <span className="text-xs">📝</span>
                      {q.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </aside>

      <div className="order-1 lg:order-2">
        <div className="rounded-2xl border border-border bg-white p-6">
          <h1 className="text-2xl font-bold">{lesson.title}</h1>
          <p className="mt-1 text-sm text-slate-500">{lesson.duration} min di lettura/visione</p>

          <div className="mt-6">
            {lesson.type === "VIDEO" ? (
              <div className="aspect-video w-full overflow-hidden rounded-xl bg-black">
                <iframe
                  src={lesson.content}
                  title={lesson.title}
                  className="h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : (
              <div className="prose max-w-none text-sm leading-relaxed text-slate-700">
                {lesson.content.split("\n\n").map((para, i) => (
                  <p key={i} className="mb-4">
                    {para}
                  </p>
                ))}
              </div>
            )}
          </div>

          <form
            action={async () => {
              "use server";
              await markLessonCompleteAction(lessonId, !isCompleted);
              redirect(`/courses/${slug}/lessons/${lessonId}`);
            }}
            className="mt-6"
          >
            <button
              className={`rounded-lg px-4 py-2 text-sm font-medium ${
                isCompleted
                  ? "bg-teal-50 text-teal-700 ring-1 ring-inset ring-teal-200"
                  : "bg-primary text-white hover:bg-primary-dark"
              }`}
            >
              {isCompleted ? "✓ Lezione completata" : "Segna come completata"}
            </button>
          </form>
        </div>

        <div className="mt-4 flex items-center justify-between">
          {prevItem ? (
            <Link
              href={
                prevItem.kind === "lesson"
                  ? `/courses/${slug}/lessons/${prevItem.id}`
                  : `/courses/${slug}/quizzes/${prevItem.id}`
              }
              className="rounded-lg bg-white px-4 py-2 text-sm font-medium ring-1 ring-inset ring-border hover:bg-slate-50"
            >
              ← {prevItem.title}
            </Link>
          ) : (
            <span />
          )}
          {nextItem && (
            <Link
              href={
                nextItem.kind === "lesson"
                  ? `/courses/${slug}/lessons/${nextItem.id}`
                  : `/courses/${slug}/quizzes/${nextItem.id}`
              }
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
            >
              {nextItem.title} →
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
