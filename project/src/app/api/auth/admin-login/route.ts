import { Role } from "@prisma/client";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { getClientIp, rateLimit } from "@/lib/rateLimit";
import { getSession } from "@/lib/session";
import { adminLoginSchema, validationError } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    const limit = rateLimit(`admin-login:${getClientIp(request)}`, 5, 60_000);
    if (!limit.allowed) {
      return NextResponse.json(
        { error: "Te veel inlogpogingen. Probeer het later opnieuw." },
        {
          status: 429,
          headers: { "Retry-After": String(limit.retryAfterSeconds) },
        },
      );
    }

    const parsed = adminLoginSchema.safeParse(await request.json());
    if (!parsed.success) {
      return validationError(parsed.error);
    }
    const { email, password } = parsed.data;

    const admin = await prisma.user.findUnique({
      where: { email, role: Role.ADMIN },
    });

    // Altijd bcrypt.compare draaien (ook als admin niet bestaat) tegen een dummy
    // hash, zodat de responstijd niet verraadt of een e-mailadres bestaat.
    const dummyHash = "$2a$12$invalidinvalidinvalidinvalidinvalidinvalidinvaliduO";
    const passwordOk = await bcrypt.compare(
      password,
      admin?.password ?? dummyHash,
    );

    if (!admin || !admin.password || !passwordOk) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const session = await getSession();
    session.adminId = admin.id;
    session.teamId = undefined;
    await session.save();

    return NextResponse.json({
      name: admin.name,
      email: admin.email,
      role: admin.role,
    });
  } catch (error) {
    console.error("Admin login error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
