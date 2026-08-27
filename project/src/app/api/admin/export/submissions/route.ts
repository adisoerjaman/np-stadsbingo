import { NextResponse } from "next/server";
import { getAdminId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/** Escapet een waarde voor CSV (RFC 4180). */
function csvCell(value: string | null | undefined): string {
  const v = value ?? "";
  if (/[",\n]/.test(v)) {
    return `"${v.replace(/"/g, '""')}"`;
  }
  return v;
}

const STATUS_LABELS: Record<string, string> = {
  LOCKED: "Vergrendeld",
  AVAILABLE: "Beschikbaar",
  PENDING: "In behandeling",
  FEEDBACK: "Feedback",
  APPROVED: "Goedgekeurd",
};

// GET een CSV-export van alle inzendingen (alleen admin).
export async function GET() {
  const adminId = await getAdminId();
  if (!adminId) {
    return NextResponse.json(
      { error: "Admin authentication required" },
      { status: 401 },
    );
  }

  const submissions = await prisma.submission.findMany({
    include: { team: true, assignment: true, player: true },
    orderBy: [{ team: { name: "asc" } }, { assignment: { order: "asc" } }],
  });

  const header = [
    "Team",
    "Teamcode",
    "Opdracht",
    "Volgorde",
    "Speler",
    "Status",
    "Feedback",
    "Ingeleverd op",
    "Bijgewerkt op",
  ].join(",");

  const rows = submissions.map((s) =>
    [
      csvCell(s.team.name),
      csvCell(s.team.code),
      csvCell(s.assignment.title),
      csvCell(String(s.assignment.order)),
      csvCell(s.player?.name ?? ""),
      csvCell(STATUS_LABELS[s.status] ?? s.status),
      csvCell(s.feedback),
      csvCell(s.createdAt.toISOString()),
      csvCell(s.updatedAt.toISOString()),
    ].join(","),
  );

  // BOM zodat Excel UTF-8 correct herkent.
  const csv = `﻿${[header, ...rows].join("\n")}`;
  const date = new Date().toISOString().split("T")[0];

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="stadsbingo-inzendingen-${date}.csv"`,
    },
  });
}
