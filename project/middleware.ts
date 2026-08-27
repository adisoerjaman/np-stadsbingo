import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSessionFromRequest } from "@/lib/session";

/**
 * Gate-keeper voor pagina's en API's. De middleware verifieert hier de
 * verzegelde sessiecookie (iron-session). Route handlers lezen de sessie
 * daarna zelf opnieuw via getSession(); we geven geen onbetrouwbare
 * x-*-id headers meer door.
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const res = NextResponse.next();
  const session = await getSessionFromRequest(request, res);

  /* ================= ADMIN ================= */
  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
    // Login-pagina is publiek toegankelijk.
    if (pathname === "/admin/login") {
      return res;
    }

    if (!session.adminId) {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json(
          { error: "Admin authentication required" },
          { status: 401 },
        );
      }
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    return res;
  }

  /* ================= PUBLIEKE ROUTES ================= */
  const publicRoutes = [
    "/team-login",
    "/api/auth/team-login",
    "/api/auth/admin-login",
    "/api/auth/admin-logout",
  ];

  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    return res;
  }

  /* ====== GEDEELD: uploads + bestanden (admin OF team) ====== */
  if (pathname.startsWith("/api/uploads") || pathname.startsWith("/api/files")) {
    if (!session.adminId && !session.teamId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }
    return res;
  }

  /* ================= TEAM (BESCHERMD) ================= */
  if (!session.teamId) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { error: "Team authentication required" },
        { status: 401 },
      );
    }
    return NextResponse.redirect(new URL("/team-login", request.url));
  }

  return res;
}

export const config = {
  // Draai alleen op app-routes, niet op static assets / _next / favicon.
  matcher: ["/admin/:path*", "/dashboard/:path*", "/team-login", "/api/:path*"],
};
