import { prisma } from "@/lib/prisma";
import { getAdminId } from "@/lib/auth";
import { NextResponse } from "next/server";


// GET all submissions for review
export async function GET(request: Request) {
  try {
    const adminId = await getAdminId();
    if (!adminId) {
      return NextResponse.json(
        { error: "Admin authentication required" },
        { status: 401 },
      );
    }

    const url = new URL(request.url);
    const status = url.searchParams.get("status");
    const teamId = url.searchParams.get("teamId");
    const assignmentId = url.searchParams.get("assignmentId");

    const where: any = {};

    if (status) {
      where.status = status;
    }
    if (teamId) {
      where.teamId = teamId;
    }
    if (assignmentId) {
      where.assignmentId = assignmentId;
    }

    const submissions = await prisma.submission.findMany({
      where,
      include: {
        team: {
          select: { name: true, code: true },
        },
        assignment: {
          select: { title: true, order: true },
        },
        player: {
          select: { name: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(submissions);
  } catch (error) {
    console.error("Error fetching submissions:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
