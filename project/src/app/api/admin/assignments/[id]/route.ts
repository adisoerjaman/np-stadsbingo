import { prisma } from "@/lib/prisma";
import { getAdminId } from "@/lib/auth";
import { currentActor, logAudit } from "@/lib/audit";
import { deleteImage } from "@/lib/storage";
import { assignmentSchema, validationError } from "@/lib/validation";
import { NextResponse } from "next/server";


// GET a single assignment
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

    const assignment = await prisma.assignment.findUnique({
      where: { id },
      include: {
        submissions: {
          include: {
            team: true,
            player: true,
          },
          orderBy: { createdAt: "desc" },
        },
        _count: {
          select: {
            submissions: true,
            teams: true,
          },
        },
      },
    });

    if (!assignment) {
      return NextResponse.json(
        { error: "Assignment not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(assignment);
  } catch (error) {
    console.error("Error fetching assignment:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// Update the assignment
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
    const parsed = assignmentSchema.safeParse(await request.json());
    if (!parsed.success) {
      return validationError(parsed.error);
    }
    const { title, description, location, order, latitude, longitude, exampleImage } =
      parsed.data;

    const assignment = await prisma.assignment.update({
      where: { id },
      data: {
        title,
        description,
        location,
        order,
        latitude: latitude ?? null,
        longitude: longitude ?? null,
        exampleImage: exampleImage || null,
      },
    });

    return NextResponse.json(assignment);
  } catch (error) {
    console.error("Error updating assignment:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// DELETE the assignment
export async function DELETE(
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

    // Bijbehorende foto's opruimen (voorbeeldfoto + ingeleverde foto's)
    const assignment = await prisma.assignment.findUnique({
      where: { id },
      include: { submissions: { select: { answerImage: true } } },
    });
    if (assignment) {
      await deleteImage(assignment.exampleImage);
      await Promise.all(
        assignment.submissions.map((s) => deleteImage(s.answerImage)),
      );
    }

    await prisma.teamAssignment.deleteMany({
      where: { assignmentId: id },
    });

    await prisma.assignment.delete({
      where: { id },
    });

    const actor = await currentActor();
    await logAudit({
      action: "ASSIGNMENT_DELETED",
      ...actor,
      targetType: "Assignment",
      targetId: id,
      detail: assignment ? `Opdracht "${assignment.title}"` : undefined,
    });

    return NextResponse.json({ message: "Assignment deleted successfully" });
  } catch (error) {
    console.error("Error deleting assignment:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
