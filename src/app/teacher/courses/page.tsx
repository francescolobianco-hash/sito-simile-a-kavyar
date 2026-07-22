import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/Badge";

export default async function TeacherCoursesPage() {
  const session = await auth();
  const isAdmin = session!.user.role === "ADMIN";

  const courses = await prisma.course.findMany({
    where: isAdmin ? {} : { teacherId: session!.user.id },
    include: {
      teacher: true,
      modules: { include: { lessons: true } },
      enrollments: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{isAdmin ? "Tutti i corsi" : "I miei corsi"}</h1>
          <p className="mt-1 text-slate-500">Gestisci i tuoi corsi, moduli, lezioni e quiz.</p>
        </div>
        <Link
          href="/teacher/courses/new"
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
        >
          + Nuovo corso
        </Link>
      </div>

      {courses.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-border bg-white p-10 text-center text-slate-500">
          Non hai ancora creato nessun corso.
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-white">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-slate-50 text-left text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Corso</th>
                {isAdmin && <th className="px-4 py-3">Docente</th>}
                <th className="px-4 py-3">Moduli</th>
                <th className="px-4 py-3">Iscritti</th>
                <th className="px-4 py-3">Stato</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {courses.map((c) => (
                <tr key={c.id}>
                  <td className="px-4 py-3 font-medium">{c.title}</td>
                  {isAdmin && <td className="px-4 py-3 text-slate-500">{c.teacher.name}</td>}
                  <td className="px-4 py-3 text-slate-500">{c.modules.length}</td>
                  <td className="px-4 py-3 text-slate-500">{c.enrollments.length}</td>
                  <td className="px-4 py-3">
                    <Badge variant={c.published ? "accent" : "neutral"}>
                      {c.published ? "Pubblicato" : "Bozza"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/teacher/courses/${c.id}/edit`}
                      className="font-medium text-primary hover:underline"
                    >
                      Gestisci
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
