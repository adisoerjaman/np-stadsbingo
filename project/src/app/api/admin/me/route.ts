import { NextResponse } from "next/server";
import { getAdminFromSession } from "@/lib/auth";

// GET het huidige adminprofiel (incl. of het een superadmin is).
export async function GET() {
  const admin = await getAdminFromSession();
  if (!admin) {
    return NextResponse.json(
      { error: "Admin authentication required" },
      { status: 401 },
    );
  }

  return NextResponse.json({
    id: admin.id,
    name: admin.name,
    email: admin.email,
    isSuperAdmin: admin.isSuperAdmin,
  });
}
