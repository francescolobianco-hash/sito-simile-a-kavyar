"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Non autorizzato");
  }
  return session.user;
}

export async function updateUserRoleAction(userId: string, formData: FormData) {
  const admin = await requireAdmin();
  const role = formData.get("role") as "STUDENT" | "TEACHER" | "ADMIN";
  if (userId === admin.id) throw new Error("Non puoi modificare il tuo stesso ruolo");

  await prisma.user.update({ where: { id: userId }, data: { role } });
  revalidatePath("/admin/users");
}
