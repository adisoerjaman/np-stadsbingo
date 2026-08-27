import { prisma } from "@/lib/prisma";
import { getAdminId } from "@/lib/auth";
import { currentActor, logAudit } from "@/lib/audit";
import { submissionUpdateSchema, validationError } from "@/lib/validation";
import { NextResponse } from "next/server";


// GET single submission
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const adminId = await getAdminId();
    if (!adminId) {
      return NextResponse.json(
        { error: "Admin authentication required" },
        { status: 401 },
      );
    }

    const { id } = await params;

    const submission = await prisma.submission.findUnique({
      where: { id },
      include: {
        team: {
          include: {
            players: true,
            captain: true,
          },
        },
        assignment: true,
        player: true,
      },
    });

    if (!submission) {
      return NextResponse.json(
        { error: "Submission not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(submission);
  } catch (error) {
    console.error("Error fetching submission:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// PUT update submission status
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const adminId = await getAdminId();
    if (!adminId) {
      return NextResponse.json(
        { error: "Admin authentication required" },
        { status: 401 },
      );
    }

    const { id } = await params;
    const parsed = submissionUpdateSchema.safeParse(await request.json());
    if (!parsed.success) {
      return validationError(parsed.error);
    }
    const { status, feedback } = parsed.data;

    // Update the submission
    const submission = await prisma.submission.update({
      where: { id },
      data: {
        status,
        feedback: feedback || null,
        updatedAt: new Date(),
      },
      include: {
        team: true,
        assignment: true,
      },
    });

    // If approved, check if we need to unlock the next assignment for this team
    if (status === "APPROVED") {
      const currentOrder = submission.assignment.order;
      const nextAssignment = await prisma.assignment.findFirst({
        where: { order: currentOrder + 1 },
      });

      if (nextAssignment) {
        const teamAssignment = await prisma.teamAssignment.findUnique({
          where: {
            teamId_assignmentId: {
              teamId: submission.teamId,
              assignmentId: nextAssignment.id,
            },
          },
        });

        if (!teamAssignment) {
          await prisma.teamAssignment.create({
            data: {
              teamId: submission.teamId,
              assignmentId: nextAssignment.id,
            },
          });
        }
      }
    }

    // Audit log van de beoordeling
    const actor = await currentActor();
    await logAudit({
      action: `SUBMISSION_${status}`,
      ...actor,
      targetType: "Submission",
      targetId: submission.id,
      detail: `Team ${submission.team.name} – opdracht "${submission.assignment.title}"${
        feedback ? ` – feedback: ${feedback}` : ""
      }`,
    });

    return NextResponse.json(submission);
  } catch (error) {
    console.error("Error updating submission:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
