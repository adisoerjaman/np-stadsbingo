import { prisma } from "@/lib/prisma";
import { getAdminId } from "@/lib/auth";
import { NextResponse } from "next/server";


// GET single team
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

    const team = await prisma.team.findUnique({
      where: { id },
      include: {
        captain: true,
        players: true,
        createdBy: {
          select: { name: true, email: true },
        },
        submissions: {
          include: {
            assignment: true,
            player: true,
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    return NextResponse.json(team);
  } catch (error) {
    console.error("Error fetching team:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// Update team
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
    const { name, playerNames } = await request.json();

    if (!name) {
      return NextResponse.json(
        { error: "Team name is required" },
        { status: 400 },
      );
    }

    // Update name of the team
    await prisma.team.update({
      where: { id },
      data: { name },
    });

    if (playerNames && Array.isArray(playerNames)) {
      await prisma.teamPlayer.deleteMany({
        where: { teamId: id },
      });

      const players = await Promise.all(
        playerNames.map((playerName: string, index: number) =>
          prisma.teamPlayer.create({
            data: {
              name: playerName,
              studentNumber: `S${Date.now()}${index}`,
              teamId: id,
            },
          }),
        ),
      );

      if (players.length > 0) {
        await prisma.team.update({
          where: { id },
          data: { captainId: players[0].id },
        });
      }
    }

    const updatedTeam = await prisma.team.findUnique({
      where: { id },
      include: {
        captain: true,
        players: true,
        createdBy: {
          select: { name: true, email: true },
        },
      },
    });

    return NextResponse.json(updatedTeam);
  } catch (error) {
    console.error("Error updating team:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// DELETE team
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

    await prisma.submission.deleteMany({
      where: { teamId: id },
    });

    await prisma.teamAssignment.deleteMany({
      where: { teamId: id },
    });

    await prisma.teamPlayer.deleteMany({
      where: { teamId: id },
    });

    await prisma.team.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Team deleted successfully" });
  } catch (error) {
    console.error("Error deleting team:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
