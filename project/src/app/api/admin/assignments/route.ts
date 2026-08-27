import { NextResponse } from "next/server";
import { currentActor, logAudit } from "@/lib/audit";
import { getAdminId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { assignmentSchema, validationError } from "@/lib/validation";

// GET all the assignments
export async function GET(request: Request) {
  try {
    const adminId = await getAdminId();
    if (!adminId) {
      return NextResponse.json(
        { error: "Admin authentication required" },
        { status: 401 },
      );
    }

    const assignments = await prisma.assignment.findMany({
      include: {
        _count: {
          select: {
            submissions: true,
            teams: true,
          },
        },
      },
      orderBy: { order: "asc" },
    });

    return NextResponse.json(assignments);
  } catch (error) {
    console.error("Error fetching assignments:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// POST create the new assignment
export async function POST(request: Request) {
  try {
    const adminId = await getAdminId();
    if (!adminId) {
      return NextResponse.json(
        { error: "Admin authentication required" },
        { status: 401 },
      );
    }

    const parsed = assignmentSchema.safeParse(await request.json());
    if (!parsed.success) {
      return validationError(parsed.error);
    }
    const {
      title,
      description,
      location,
      order,
      latitude,
      longitude,
      exampleImage,
      teamIds,
    } = parsed.data;

    const assignment = await prisma.assignment.create({
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

    let teamsToAssign;
    if (teamIds && Array.isArray(teamIds) && teamIds.length > 0) {
      teamsToAssign = await prisma.team.findMany({
        where: { id: { in: teamIds } },
      });
    } else {
      teamsToAssign = await prisma.team.findMany();
    }

    await prisma.teamAssignment.createMany({
      data: teamsToAssign.map((team) => ({
        teamId: team.id,
        assignmentId: assignment.id,
        order: assignment.order,
      })),
    });

    const actor = await currentActor();
    await logAudit({
      action: "ASSIGNMENT_CREATED",
      ...actor,
      targetType: "Assignment",
      targetId: assignment.id,
      detail: `Opdracht "${assignment.title}" (volgorde ${assignment.order})`,
    });

    return NextResponse.json(assignment);
  } catch (error) {
    console.error("Error creating assignment:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
