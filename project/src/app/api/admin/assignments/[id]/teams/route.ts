import { prisma } from "@/lib/prisma";
import { getAdminId } from "@/lib/auth";
import { NextResponse } from "next/server";


// GET teams assigned to an assignment
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

    const teamAssignments = await prisma.teamAssignment.findMany({
      where: { assignmentId: id },
      include: {
        team: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });

    return NextResponse.json(teamAssignments.map((ta) => ta.team));
  } catch (error) {
    console.error("Error fetching assignment teams:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// PUT update teams assigned to an assignment
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
    const { teamIds } = await request.json();

    if (!Array.isArray(teamIds)) {
      return NextResponse.json(
        { error: "teamIds must be an array" },
        { status: 400 },
      );
    }

    // Remove existing team assignments
    await prisma.teamAssignment.deleteMany({
      where: { assignmentId: id },
    });

    // Add new team assignments
    if (teamIds.length > 0) {
      await Promise.all(
        teamIds.map((teamId: string) =>
          prisma.teamAssignment.create({
            data: {
              teamId,
              assignmentId: id,
            },
          }),
        ),
      );
    } else {
      // If no teams is specified, assign exercise to all teams
      const allTeams = await prisma.team.findMany();
      await Promise.all(
        allTeams.map((team) =>
          prisma.teamAssignment.create({
            data: {
              teamId: team.id,
              assignmentId: id,
            },
          }),
        ),
      );
    }

    return NextResponse.json({
      message: "Team assignments updated successfully",
    });
  } catch (error) {
    console.error("Error updating assignment teams:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
