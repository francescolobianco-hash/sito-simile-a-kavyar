import Link from "next/link";
import { auth, signOut } from "@/auth";
import { initials } from "@/lib/utils";

const roleLabel: Record<string, string> = {
  STUDENT: "Studente",
  TEACHER: "Docente",
  ADMIN: "Amministratore",
};

export async function Navbar() {
  const session = await auth();
  const user = session?.user;

  const links = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/courses", label: "Catalogo corsi" },
  ];
  if (user?.role === "TEACHER" || user?.role === "ADMIN") {
    links.push({ href: "/teacher/courses", label: "I miei corsi" });
  }
  if (user?.role === "ADMIN") {
    links.push({ href: "/admin/users", label: "Utenti" });
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-6 px-4 py-3 sm:px-6">
        <Link href={user ? "/dashboard" : "/"} className="flex items-center gap-2 font-bold text-lg">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white">
            K
          </span>
          Kavyar
        </Link>

        {user && (
          <nav className="hidden flex-1 items-center gap-1 md:flex">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-foreground"
              >
                {l.label}
              </Link>
            ))}
          </nav>
        )}

        <div className="ml-auto flex items-center gap-3">
          {user ? (
            <>
              <div className="hidden text-right sm:block">
                <p className="text-sm font-medium leading-tight">{user.name}</p>
                <p className="text-xs text-slate-500 leading-tight">{roleLabel[user.role]}</p>
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-white">
                {initials(user.name ?? "?")}
              </div>
              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/login" });
                }}
              >
                <button className="rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100">
                  Esci
                </button>
              </form>
            </>
          ) : (
            <Link
              href="/login"
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
            >
              Accedi
            </Link>
          )}
        </div>
      </div>
      {user && (
        <nav className="flex gap-1 overflow-x-auto border-t border-border px-4 py-1 md:hidden">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
            >
              {l.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
