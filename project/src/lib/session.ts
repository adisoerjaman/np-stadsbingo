import { getIronSession, type SessionOptions } from "iron-session";
import { cookies } from "next/headers";
import type { NextRequest, NextResponse } from "next/server";

/**
 * Inhoud van de versleutelde + ondertekende sessiecookie.
 * Anders dan voorheen staat hier NIET zomaar een database-id dat een client
 * zelf kan zetten: iron-session verzegelt deze data, dus de waardes kunnen niet
 * worden vervalst zonder het SESSION_SECRET.
 */
export interface SessionData {
  adminId?: string;
  teamId?: string;
}

const password = process.env.SESSION_SECRET;

if (!password || password.length < 32) {
  throw new Error(
    "SESSION_SECRET ontbreekt of is te kort. Zet een willekeurige string van " +
      "minimaal 32 tekens in je .env (zie .env.example).",
  );
}

export const sessionOptions: SessionOptions = {
  password,
  cookieName: "sb_session",
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24, // 24 uur
  },
};

/** Sessie lezen/schrijven binnen route handlers en server components. */
export async function getSession() {
  return getIronSession<SessionData>(await cookies(), sessionOptions);
}

/** Sessie lezen binnen middleware (heeft request/response nodig). */
export async function getSessionFromRequest(
  req: NextRequest,
  res: NextResponse,
) {
  return getIronSession<SessionData>(req, res, sessionOptions);
}
