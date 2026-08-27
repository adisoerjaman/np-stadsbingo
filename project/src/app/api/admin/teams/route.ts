import { NextResponse } from "next/server";
import { currentActor, logAudit } from "@/lib/audit";
import { getAdminId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { teamCreateSchema, validationError } from "@/lib/validation";

// GET all teams
export async function GET(request: Request) {
  try {
    const adminId = await getAdminId();
    if (!adminId) {
      return NextResponse.json(
        { error: "Admin authentication required" },
        { status: 401 },
      );
    }

    const teams = await prisma.team.findMany({
      include: {
        captain: true,
        players: true,
        createdBy: {
          select: { name: true, email: true },
        },
        _count: {
          select: {
            players: true,
            submissions: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(teams);
  } catch (error) {
    console.error("Error fetching teams:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// POST create new team
export async function POST(request: Request) {
  try {
    const adminId = await getAdminId();
    if (!adminId) {
      return NextResponse.json(
        { error: "Admin authentication required" },
        { status: 401 },
      );
    }

    const parsed = teamCreateSchema.safeParse(await request.json());
    if (!parsed.success) {
      return validationError(parsed.error);
    }
    const { name, playerNames } = parsed.data;

    const code = Math.random().toString(36).substring(2, 8).toUpperCase();

    const team = await prisma.team.create({
      data: {
        name,
        code,
        createdById: adminId,
      },
    });

    // Captain apart aanmaken (we hebben het id nodig), de rest in bulk.
    const [captainName, ...otherNames] = playerNames as string[];
    const captain = await prisma.teamPlayer.create({
      data: {
        name: captainName,
        studentNumber: `S${Date.now()}0`,
        teamId: team.id,
      },
    });

    if (otherNames.length > 0) {
      await prisma.teamPlayer.createMany({
        data: otherNames.map((name, index) => ({
          name,
          studentNumber: `S${Date.now()}${index + 1}`,
          teamId: team.id,
        })),
      });
    }

    await prisma.team.update({
      where: { id: team.id },
      data: { captainId: captain.id },
    });

    const assignments = await prisma.assignment.findMany();
    await prisma.teamAssignment.createMany({
      data: assignments.map((assignment) => ({
        teamId: team.id,
        assignmentId: assignment.id,
        order: assignment.order,
      })),
    });

    const createdTeam = await prisma.team.findUnique({
      where: { id: team.id },
      include: {
        captain: true,
        players: true,
        createdBy: {
          select: { name: true, email: true },
        },
      },
    });

    const actor = await currentActor();
    await logAudit({
      action: "TEAM_CREATED",
      ...actor,
      targetType: "Team",
      targetId: team.id,
      detail: `Team "${name}" (code ${team.code}) met ${playerNames.length} speler(s)`,
    });

    return NextResponse.json(createdTeam);
  } catch (error) {
    console.error("Error creating team:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
