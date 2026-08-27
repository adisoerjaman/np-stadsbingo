import { Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { currentActor, logAudit } from "@/lib/audit";
import { getSuperAdminId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { userUpdateSchema, validationError } from "@/lib/validation";

// PUT: naam en/of wachtwoord van een adminaccount wijzigen — alleen superadmin
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const superAdminId = await getSuperAdminId();
  if (!superAdminId) {
    return NextResponse.json(
      { error: "Alleen een superadmin mag gebruikers wijzigen" },
      { status: 403 },
    );
  }

  const { id } = await params;
  const parsed = userUpdateSchema.safeParse(await request.json());
  if (!parsed.success) {
    return validationError(parsed.error);
  }
  const { name, password } = parsed.data;

  const target = await prisma.user.findFirst({
    where: { id, role: Role.ADMIN },
  });
  if (!target) {
    return NextResponse.json(
      { error: "Account niet gevonden" },
      { status: 404 },
    );
  }

  const user = await prisma.user.update({
    where: { id },
    data: {
      ...(name !== undefined ? { name } : {}),
      ...(password !== undefined
        ? { password: await bcrypt.hash(password, 12) }
        : {}),
    },
    select: { id: true, name: true, email: true, createdAt: true },
  });

  const actor = await currentActor();
  await logAudit({
    action: "USER_UPDATED",
    ...actor,
    targetType: "User",
    targetId: id,
    detail: password
      ? `Wachtwoord gewijzigd voor ${user.email}`
      : `Naam gewijzigd voor ${user.email}`,
  });

  return NextResponse.json(user);
}

// DELETE: een adminaccount verwijderen — alleen superadmin
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const superAdminId = await getSuperAdminId();
  if (!superAdminId) {
    return NextResponse.json(
      { error: "Alleen een superadmin mag gebruikers verwijderen" },
      { status: 403 },
    );
  }

  const { id } = await params;

  if (id === superAdminId) {
    return NextResponse.json(
      { error: "Je kunt je eigen account niet verwijderen" },
      { status: 400 },
    );
  }

  const target = await prisma.user.findFirst({
    where: { id, role: Role.ADMIN },
  });
  if (!target) {
    return NextResponse.json(
      { error: "Account niet gevonden" },
      { status: 404 },
    );
  }

  // Voorkom dat de laatste superadmin wordt verwijderd (lock-out).
  if (target.isSuperAdmin) {
    const superAdminCount = await prisma.user.count({
      where: { role: Role.ADMIN, isSuperAdmin: true },
    });
    if (superAdminCount <= 1) {
      return NextResponse.json(
        { error: "Er moet minstens één superadmin overblijven" },
        { status: 400 },
      );
    }
  }

  const teamsCreated = await prisma.team.count({ where: { createdById: id } });
  if (teamsCreated > 0) {
    return NextResponse.json(
      {
        error: `Dit account heeft ${teamsCreated} team(s) aangemaakt en kan niet verwijderd worden`,
      },
      { status: 409 },
    );
  }

  await prisma.user.delete({ where: { id } });

  const actor = await currentActor();
  await logAudit({
    action: "USER_DELETED",
    ...actor,
    targetType: "User",
    targetId: id,
    detail: `Account ${target.name} (${target.email})`,
  });

  return NextResponse.json({ message: "Account verwijderd" });
}
