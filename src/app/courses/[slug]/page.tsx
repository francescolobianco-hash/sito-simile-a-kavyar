import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { courseCompletion } from "@/lib/progress";
import { formatMinutes } from "@/lib/utils";
import { enrollAction } from "@/lib/actions/enrollment";

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const session = await auth();

  const course = await prisma.course.findUnique({
    where: { slug },
    include: {
      teacher: true,
      modules: {
        orderBy: { order: "asc" },
        include: {
          lessons: { orderBy: { order: "asc" } },
          quizzes: { include: { questions: true } },
        },
      },
    },
  });

  if (!course) notFound();

  const isCourseOwnerOrAdmin =
    !!session &&
    (session.user.role === "ADMIN" ||
      (session.user.role === "TEACHER" && session.user.id === course.teacherId));
  if (!course.published && !isCourseOwnerOrAdmin) notFound();

  let isEnrolled = false;
  let completedLessonIds = new Set<string>();
  const quizAttempts = new Map<string, number>();

  if (session) {
    const enrollment = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId: session.user.id, courseId: course.id } },
    });
    isEnrolled = !!enrollment;

    if (isEnrolled || session.user.role !== "STUDENT") {
      const progress = await prisma.lessonProgress.findMany({
        where: { userId: session.user.id, completed: true },
        select: { lessonId: true },
      });
      completedLessonIds = new Set(progress.map((p) => p.lessonId));

      const attempts = await prisma.quizAttempt.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: "desc" },
      });
      for (const a of attempts) {
        if (!quizAttempts.has(a.quizId)) quizAttempts.set(a.quizId, a.score);
      }
    }
  }

  const stats = courseCompletion(course.modules, completedLessonIds);
  const totalMinutes = course.modules
    .flatMap((m) => m.lessons)
    .reduce((s, l) => s + l.duration, 0);
  const canAccessContent = isEnrolled || session?.user.role !== "STUDENT";

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <div
        className="rounded-2xl p-8 text-white"
        style={{ background: `linear-gradient(135deg, ${course.coverColor}, #14b8a6)` }}
      >
        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-medium text-white ring-1 ring-inset ring-white/30">
            {course.category}
          </span>
          <span className="inline-flex items-center rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-medium text-white ring-1 ring-inset ring-white/30">
            {course.level}
          </span>
        </div>
        <h1 className="mt-3 text-3xl font-bold">{course.title}</h1>
        <p className="mt-2 max-w-2xl text-white/90">{course.description}</p>
        <p className="mt-4 text-sm text-white/80">
          A cura di {course.teacher.name} · {course.modules.length} moduli ·{" "}
          {formatMinutes(totalMinutes)} di contenuti
        </p>
      </div>

      {session?.user.role === "STUDENT" && !isEnrolled && (
        <div className="mt-6 flex items-center justify-between rounded-xl border border-border bg-white p-4">
          <p className="text-sm text-slate-600">Iscriviti per accedere a lezioni e quiz.</p>
          <form
            action={async () => {
              "use server";
              await enrollAction(course.id);
            }}
          >
            <button className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark">
              Iscriviti al corso
            </button>
          </form>
        </div>
      )}

      {isEnrolled && (
        <div className="mt-6 rounded-xl border border-border bg-white p-4">
          <div className="mb-1 flex items-center justify-between text-sm">
            <span className="font-medium">Il tuo avanzamento</span>
            <span className="text-slate-500">
              {stats.completed}/{stats.total} lezioni · {stats.percent}%
            </span>
          </div>
          <ProgressBar value={stats.percent} />
        </div>
      )}

      <div className="mt-8 space-y-4">
        {course.modules.map((mod, i) => (
          <div key={mod.id} className="rounded-2xl border border-border bg-white">
            <div className="border-b border-border px-5 py-3">
              <h2 className="font-semibold">
                Modulo {i + 1}: {mod.title}
              </h2>
            </div>
            <ul className="divide-y divide-border">
              {mod.lessons.map((lesson) => {
                const done = completedLessonIds.has(lesson.id);
                return (
                  <li key={lesson.id}>
                    {canAccessContent ? (
                      <Link
                        href={`/courses/${course.slug}/lessons/${lesson.id}`}
                        className="flex items-center justify-between px-5 py-3 hover:bg-slate-50"
                      >
                        <span className="flex items-center gap-3 text-sm">
                          <span
                            className={`flex h-5 w-5 items-center justify-center rounded-full text-xs ${
                              done ? "bg-teal-500 text-white" : "bg-slate-100 text-slate-400"
                            }`}
                          >
                            {done ? "✓" : ""}
                          </span>
                          {lesson.type === "VIDEO" ? "🎬" : "📄"} {lesson.title}
                        </span>
                        <span className="text-xs text-slate-400">{lesson.duration} min</span>
                      </Link>
                    ) : (
                      <div className="flex items-center justify-between px-5 py-3 text-slate-400">
                        <span className="flex items-center gap-3 text-sm">
                          🔒 {lesson.title}
                        </span>
                        <span className="text-xs">{lesson.duration} min</span>
                      </div>
                    )}
                  </li>
                );
              })}
              {mod.quizzes.map((quiz) => {
                const score = quizAttempts.get(quiz.id);
                return (
                  <li key={quiz.id}>
                    {canAccessContent ? (
                      <Link
                        href={`/courses/${course.slug}/quizzes/${quiz.id}`}
                        className="flex items-center justify-between px-5 py-3 hover:bg-slate-50"
                      >
                        <span className="flex items-center gap-3 text-sm">
                          <span
                            className={`flex h-5 w-5 items-center justify-center rounded-full text-xs ${
                              score !== undefined ? "bg-teal-500 text-white" : "bg-slate-100 text-slate-400"
                            }`}
                          >
                            {score !== undefined ? "✓" : ""}
                          </span>
                          📝 {quiz.title} ({quiz.questions.length} domande)
                        </span>
                        <span className="text-xs text-slate-400">
                          {score !== undefined ? `${score}%` : "Da svolgere"}
                        </span>
                      </Link>
                    ) : (
                      <div className="flex items-center justify-between px-5 py-3 text-slate-400">
                        <span className="flex items-center gap-3 text-sm">
                          🔒 📝 {quiz.title}
                        </span>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
