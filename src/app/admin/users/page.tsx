import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { updateUserRoleAction } from "@/lib/actions/admin";

const roleLabel: Record<string, string> = {
  STUDENT: "Studente",
  TEACHER: "Docente",
  ADMIN: "Amministratore",
};

export default async function AdminUsersPage() {
  const session = await auth();
  // Re-check the role here (using the DB-refreshed session) rather than
  // relying solely on the middleware redirect, which decodes a JWT that
  // can lag behind a just-revoked role until it is next refreshed.
  if (session?.user.role !== "ADMIN") redirect("/dashboard");

  const users = await prisma.user.findMany({
    include: {
      _count: { select: { enrollments: true, coursesTaught: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-bold">Gestione utenti</h1>
      <p className="mt-1 text-slate-500">{users.length} utenti registrati sulla piattaforma.</p>

      <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-slate-50 text-left text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Nome</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Corsi</th>
              <th className="px-4 py-3">Ruolo</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {users.map((u) => (
              <tr key={u.id}>
                <td className="px-4 py-3 font-medium">{u.name}</td>
                <td className="px-4 py-3 text-slate-500">{u.email}</td>
                <td className="px-4 py-3 text-slate-500">
                  {u.role === "STUDENT" ? `${u._count.enrollments} iscrizioni` : `${u._count.coursesTaught} corsi creati`}
                </td>
                <td className="px-4 py-3">
                  {u.id === session!.user.id ? (
                    <span className="text-slate-500">{roleLabel[u.role]} (tu)</span>
                  ) : (
                    <form action={updateUserRoleAction.bind(null, u.id)} className="flex items-center gap-2">
                      <select
                        name="role"
                        defaultValue={u.role}
                        className="rounded-md border border-border px-2 py-1 text-xs"
                      >
                        <option value="STUDENT">Studente</option>
                        <option value="TEACHER">Docente</option>
                        <option value="ADMIN">Amministratore</option>
                      </select>
                      <button className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium hover:bg-slate-200">
                        Salva
                      </button>
                    </form>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
