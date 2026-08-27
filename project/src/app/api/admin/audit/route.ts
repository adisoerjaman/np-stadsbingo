import { NextResponse } from "next/server";
import { getAdminId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET recente audit-logregels (alleen admin)
export async function GET() {
  const adminId = await getAdminId();
  if (!adminId) {
    return NextResponse.json(
      { error: "Admin authentication required" },
      { status: 401 },
    );
  }

  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return NextResponse.json(logs);
}
