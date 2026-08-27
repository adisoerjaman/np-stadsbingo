import { NextResponse } from "next/server";
import { getAdminId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { teamOrderSchema, validationError } from "@/lib/validation";

// GET de opdrachten van een team in de huidige (per-team) volgorde
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const adminId = await getAdminId();
  if (!adminId) {
    return NextResponse.json(
      { error: "Admin authentication required" },
      { status: 401 },
    );
  }

  const { id } = await params;
  const teamAssignments = await prisma.teamAssignment.findMany({
    where: { teamId: id },
    include: { assignment: { select: { id: true, title: true } } },
    orderBy: { order: "asc" },
  });

  return NextResponse.json(
    teamAssignments.map((ta) => ({
      assignmentId: ta.assignmentId,
      title: ta.assignment.title,
      order: ta.order,
    })),
  );
}

// PUT: nieuwe per-team volgorde opslaan (lijst van assignmentIds in volgorde)
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const adminId = await getAdminId();
  if (!adminId) {
    return NextResponse.json(
      { error: "Admin authentication required" },
      { status: 401 },
    );
  }

  const { id } = await params;
  const parsed = teamOrderSchema.safeParse(await request.json());
  if (!parsed.success) {
    return validationError(parsed.error);
  }
  const { assignmentIds } = parsed.data;

  await prisma.$transaction(
    assignmentIds.map((assignmentId, index) =>
      prisma.teamAssignment.updateMany({
        where: { teamId: id, assignmentId },
        data: { order: index + 1 },
      }),
    ),
  );

  return NextResponse.json({ message: "Volgorde opgeslagen" });
}
