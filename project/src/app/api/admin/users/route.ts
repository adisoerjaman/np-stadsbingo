import { Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { currentActor, logAudit } from "@/lib/audit";
import { getSuperAdminId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { userCreateSchema, validationError } from "@/lib/validation";

// GET alle docent-/adminaccounts (zonder wachtwoord) — alleen superadmin
export async function GET() {
  const superAdminId = await getSuperAdminId();
  if (!superAdminId) {
    return NextResponse.json(
      { error: "Alleen een superadmin mag gebruikers beheren" },
      { status: 403 },
    );
  }

  const users = await prisma.user.findMany({
    where: { role: Role.ADMIN },
    select: {
      id: true,
      name: true,
      email: true,
      isSuperAdmin: true,
      createdAt: true,
    },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(users);
}

// POST nieuw adminaccount aanmaken — alleen superadmin
export async function POST(request: Request) {
  const superAdminId = await getSuperAdminId();
  if (!superAdminId) {
    return NextResponse.json(
      { error: "Alleen een superadmin mag gebruikers aanmaken" },
      { status: 403 },
    );
  }

  const parsed = userCreateSchema.safeParse(await request.json());
  if (!parsed.success) {
    return validationError(parsed.error);
  }
  const { name, email, password, isSuperAdmin } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json(
      { error: "Er bestaat al een account met dit e-mailadres" },
      { status: 409 },
    );
  }

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: await bcrypt.hash(password, 12),
      role: Role.ADMIN,
      isSuperAdmin: isSuperAdmin ?? false,
    },
    select: {
      id: true,
      name: true,
      email: true,
      isSuperAdmin: true,
      createdAt: true,
    },
  });

  const actor = await currentActor();
  await logAudit({
    action: "USER_CREATED",
    ...actor,
    targetType: "User",
    targetId: user.id,
    detail: `Account ${user.name} (${user.email})`,
  });

  return NextResponse.json(user);
}
