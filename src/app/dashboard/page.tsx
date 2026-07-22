import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { courseCompletion, findNextLesson } from "@/lib/progress";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Badge } from "@/components/ui/Badge";
import { formatMinutes } from "@/lib/utils";

export default async function DashboardPage() {
  const session = await auth();
  const userId = session!.user.id;

  const enrollments = await prisma.enrollment.findMany({
    where: { userId },
    include: {
      course: {
        include: {
          teacher: true,
          modules: {
            orderBy: { order: "asc" },
            include: { lessons: { orderBy: { order: "asc" } } },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const progressRecords = await prisma.lessonProgress.findMany({
    where: { userId, completed: true },
    select: { lessonId: true },
  });
  const completedLessonIds = new Set(progressRecords.map((p) => p.lessonId));

  const courseStats = enrollments.map((e) => ({
    enrollment: e,
    stats: courseCompletion(e.course.modules, completedLessonIds),
    nextLessonId: findNextLesson(e.course.modules, completedLessonIds),
  }));

  const coursesCompleted = courseStats.filter((c) => c.stats.percent === 100).length;
  const totalMinutes = courseStats.reduce((sum, c) => sum + c.stats.minutesCompleted, 0);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-bold">Ciao, {session!.user.name?.split(" ")[0]} 👋</h1>
      <p className="mt-1 text-slate-500">Ecco il riepilogo del tuo percorso di apprendimento.</p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Corsi iscritti" value={enrollments.length} />
        <StatCard label="Corsi completati" value={coursesCompleted} />
        <StatCard label="Tempo di studio" value={formatMinutes(totalMinutes)} />
      </div>

      <div className="mt-10 flex items-center justify-between">
        <h2 className="text-lg font-semibold">I miei corsi</h2>
        <Link href="/courses" className="text-sm font-medium text-primary hover:underline">
          Esplora il catalogo →
        </Link>
      </div>

      {courseStats.length === 0 ? (
        <div className="mt-4 rounded-2xl border border-dashed border-border bg-white p-10 text-center">
          <p className="text-slate-500">Non sei ancora iscritto a nessun corso.</p>
          <Link
            href="/courses"
            className="mt-4 inline-block rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
          >
            Sfoglia i corsi disponibili
          </Link>
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {courseStats.map(({ enrollment, stats, nextLessonId }) => (
            <div key={enrollment.id} className="flex flex-col rounded-2xl border border-border bg-white p-5 shadow-sm">
              <div
                className="h-24 rounded-xl"
                style={{ background: `linear-gradient(135deg, ${enrollment.course.coverColor}, #14b8a6)` }}
              />
              <div className="mt-4 flex-1">
                <Badge variant="neutral">{enrollment.course.category}</Badge>
                <h3 className="mt-2 font-semibold leading-snug">{enrollment.course.title}</h3>
                <p className="text-xs text-slate-500">di {enrollment.course.teacher.name}</p>
              </div>
              <div className="mt-4">
                <div className="mb-1 flex items-center justify-between text-xs text-slate-500">
                  <span>{stats.completed}/{stats.total} lezioni</span>
                  <span>{stats.percent}%</span>
                </div>
                <ProgressBar value={stats.percent} />
              </div>
              <Link
                href={
                  nextLessonId
                    ? `/courses/${enrollment.course.slug}/lessons/${nextLessonId}`
                    : `/courses/${enrollment.course.slug}`
                }
                className="mt-4 rounded-lg bg-primary px-4 py-2 text-center text-sm font-medium text-white hover:bg-primary-dark"
              >
                {stats.percent === 100 ? "Rivedi corso" : stats.completed === 0 ? "Inizia corso" : "Continua"}
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-border bg-white p-5">
      <p className="text-2xl font-bold text-foreground">{value}</p>
      <p className="mt-1 text-sm text-slate-500">{label}</p>
    </div>
  );
}
