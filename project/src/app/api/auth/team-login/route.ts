import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getClientIp, rateLimit } from "@/lib/rateLimit";
import { getSession } from "@/lib/session";
import { teamLoginSchema, validationError } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    const limit = rateLimit(`team-login:${getClientIp(request)}`, 10, 60_000);
    if (!limit.allowed) {
      return NextResponse.json(
        { error: "Te veel inlogpogingen. Probeer het later opnieuw." },
        {
          status: 429,
          headers: { "Retry-After": String(limit.retryAfterSeconds) },
        },
      );
    }

    const parsed = teamLoginSchema.safeParse(await request.json());
    if (!parsed.success) {
      return validationError(parsed.error);
    }
    const { code } = parsed.data;

    const team = await prisma.team.findUnique({
      where: { code: code.toUpperCase() },
      include: { captain: true, players: true },
    });

    if (!team) {
      return NextResponse.json({ error: "Invalid team code" }, { status: 401 });
    }

    const session = await getSession();
    session.teamId = team.id;
    session.adminId = undefined;
    await session.save();

    return NextResponse.json({
      teamId: team.id,
      captainId: team.captain?.id ?? null,
      players: team.players.map((p) => ({ id: p.id, name: p.name })),
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
