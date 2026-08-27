import { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

/**
 * Auth-helpers. De sessie-id's komen uit een door iron-session verzegelde
 * cookie en kunnen dus niet door de client worden vervalst. We vertrouwen niet
 * langer op losse headers of zelf-geparste cookies.
 */

/** Geverifieerd team-id uit de sessie, of null. */
export async function getTeamId(): Promise<string | null> {
  const session = await getSession();
  return session.teamId ?? null;
}

/** Geverifieerd admin-id uit de sessie, of null (en alleen als rol ADMIN is). */
export async function getAdminId(): Promise<string | null> {
  const session = await getSession();
  if (!session.adminId) return null;

  const admin = await prisma.user.findFirst({
    where: { id: session.adminId, role: Role.ADMIN },
    select: { id: true },
  });

  return admin?.id ?? null;
}

/** Volledig team-object op basis van de sessie (voor server components). */
export async function getTeamFromSession() {
  const teamId = await getTeamId();
  if (!teamId) return null;

  try {
    return await prisma.team.findUnique({
      where: { id: teamId },
      include: { captain: true, players: true },
    });
  } catch (error) {
    console.error("Error fetching team from session:", error);
    return null;
  }
}

/** Volledig admin-object op basis van de sessie (voor server components). */
export async function getAdminFromSession() {
  const session = await getSession();
  if (!session.adminId) return null;

  try {
    return await prisma.user.findFirst({
      where: { id: session.adminId, role: Role.ADMIN },
    });
  } catch (error) {
    console.error("Error fetching admin from session:", error);
    return null;
  }
}

/** Geverifieerd superadmin-id uit de sessie, of null (alleen als isSuperAdmin). */
export async function getSuperAdminId(): Promise<string | null> {
  const session = await getSession();
  if (!session.adminId) return null;

  const admin = await prisma.user.findFirst({
    where: { id: session.adminId, role: Role.ADMIN, isSuperAdmin: true },
    select: { id: true },
  });

  return admin?.id ?? null;
}
