import { prisma } from "@/lib/prisma";

/**
 * Bepaalt of een opdracht voor een team daadwerkelijk vrijgegeven (unlocked) is.
 * Voorkomt dat een team kan inleveren op een opdracht die nog LOCKED is of niet
 * aan het team is toegewezen — dezelfde regels als de statusberekening in
 * /api/exercises.
 */
export async function isAssignmentUnlockedForTeam(
  teamId: string,
  assignmentId: string,
): Promise<boolean> {
  const teamAssignments = await prisma.teamAssignment.findMany({
    where: { teamId },
    include: {
      assignment: {
        include: { submissions: { where: { teamId }, take: 1 } },
      },
    },
    orderBy: { order: "asc" },
  });

  const index = teamAssignments.findIndex(
    (ta) => ta.assignmentId === assignmentId,
  );

  if (index === -1) return false; // niet aan dit team toegewezen
  if (index === 0) return true; // eerste opdracht is altijd beschikbaar

  const previous = teamAssignments[index - 1];
  return previous.assignment.submissions[0]?.status === "APPROVED";
}
