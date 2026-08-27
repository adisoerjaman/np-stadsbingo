import { getAdminFromSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * Audit logging: legt belangrijke acties van docenten/admins vast (wie deed wat,
 * wanneer). Best-effort — een mislukte log mag de hoofdactie nooit blokkeren.
 */
export async function logAudit(entry: {
  action: string;
  actorId?: string | null;
  actorName?: string | null;
  targetType: string;
  targetId: string;
  detail?: string | null;
}): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        action: entry.action,
        actorId: entry.actorId ?? null,
        actorName: entry.actorName ?? null,
        targetType: entry.targetType,
        targetId: entry.targetId,
        detail: entry.detail ?? null,
      },
    });
  } catch (error) {
    console.error("logAudit error:", error);
  }
}

/** Huidige admin als actor voor een audit-entry. */
export async function currentActor(): Promise<{
  actorId: string | null;
  actorName: string | null;
}> {
  const admin = await getAdminFromSession();
  return { actorId: admin?.id ?? null, actorName: admin?.name ?? null };
}
