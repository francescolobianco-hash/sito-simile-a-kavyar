import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/Badge";
import { enrollAction } from "@/lib/actions/enrollment";

export default async function CoursesPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string }>;
}) {
  const { category, q } = await searchParams;
  const session = await auth();

  const courses = await prisma.course.findMany({
    where: {
      published: true,
      ...(category ? { category } : {}),
      ...(q ? { title: { contains: q } } : {}),
    },
    include: {
      teacher: true,
      modules: { include: { lessons: true } },
      enrollments: session ? { where: { userId: session.user.id } } : false,
    },
    orderBy: { createdAt: "desc" },
  });

  const categories = await prisma.course
    .findMany({ where: { published: true }, select: { category: true }, distinct: ["category"] })
    .then((rows) => rows.map((r) => r.category));

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold">Catalogo corsi</h1>
          <p className="mt-1 text-slate-500">Scegli un corso e inizia subito a studiare.</p>
        </div>
        <form className="flex gap-2">
          <input
            name="q"
            defaultValue={q}
            placeholder="Cerca un corso..."
            className="w-56 rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </form>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        <Link
          href="/courses"
          className={`rounded-full px-3 py-1.5 text-sm font-medium ${
            !category ? "bg-primary text-white" : "bg-white text-slate-600 ring-1 ring-border"
          }`}
        >
          Tutte
        </Link>
        {categories.map((c) => (
          <Link
            key={c}
            href={`/courses?category=${encodeURIComponent(c)}`}
            className={`rounded-full px-3 py-1.5 text-sm font-medium ${
              category === c ? "bg-primary text-white" : "bg-white text-slate-600 ring-1 ring-border"
            }`}
          >
            {c}
          </Link>
        ))}
      </div>

      {courses.length === 0 ? (
        <p className="mt-10 text-center text-slate-500">Nessun corso trovato.</p>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => {
            const lessonCount = course.modules.reduce((s, m) => s + m.lessons.length, 0);
            const isEnrolled = session && course.enrollments && course.enrollments.length > 0;
            return (
              <div key={course.id} className="flex flex-col rounded-2xl border border-border bg-white p-5 shadow-sm">
                <div
                  className="h-28 rounded-xl"
                  style={{ background: `linear-gradient(135deg, ${course.coverColor}, #14b8a6)` }}
                />
                <div className="mt-4 flex-1">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="neutral">{course.category}</Badge>
                    <Badge variant="accent">{course.level}</Badge>
                  </div>
                  <Link href={`/courses/${course.slug}`}>
                    <h3 className="mt-2 font-semibold leading-snug hover:text-primary">{course.title}</h3>
                  </Link>
                  <p className="mt-1 line-clamp-2 text-sm text-slate-500">{course.description}</p>
                  <p className="mt-2 text-xs text-slate-400">
                    {course.teacher.name} · {course.modules.length} moduli · {lessonCount} lezioni
                  </p>
                </div>

                <div className="mt-4 flex gap-2">
                  <Link
                    href={`/courses/${course.slug}`}
                    className="flex-1 rounded-lg px-4 py-2 text-center text-sm font-medium text-primary ring-1 ring-inset ring-primary/30 hover:bg-primary/5"
                  >
                    Dettagli
                  </Link>
                  {session && session.user.role === "STUDENT" && (
                    isEnrolled ? (
                      <Link
                        href={`/courses/${course.slug}`}
                        className="flex-1 rounded-lg bg-primary px-4 py-2 text-center text-sm font-medium text-white hover:bg-primary-dark"
                      >
                        Vai al corso
                      </Link>
                    ) : (
                      <form
                        action={async () => {
                          "use server";
                          await enrollAction(course.id);
                        }}
                        className="flex-1"
                      >
                        <button className="w-full rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark">
                          Iscriviti
                        </button>
                      </form>
                    )
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
