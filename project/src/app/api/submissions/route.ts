import { prisma } from "@/lib/prisma";
import { getTeamId } from "@/lib/auth";
import { isAssignmentUnlockedForTeam } from "@/lib/assignments";
import { deleteImage } from "@/lib/storage";
import { submissionCreateSchema, validationError } from "@/lib/validation";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const teamId = await getTeamId();
    if (!teamId) {
      return NextResponse.json(
        { error: "Team authentication required" },
        { status: 401 },
      );
    }

    const parsed = submissionCreateSchema.safeParse(await request.json());
    if (!parsed.success) {
      return validationError(parsed.error);
    }
    const { assignmentId, answerText, answerImage, playerId } = parsed.data;

    // Check if submission already exists
    const existingSubmission = await prisma.submission.findUnique({
      where: {
        teamId_assignmentId: {
          teamId,
          assignmentId,
        },
      },
    });

    let submission;

    if (existingSubmission) {
      // If submission exists and status is FEEDBACK, allow resubmission
      if (existingSubmission.status === "FEEDBACK") {
        // Oude foto opruimen als er een nieuwe wordt ingeleverd
        if (existingSubmission.answerImage !== (answerImage || null)) {
          await deleteImage(existingSubmission.answerImage);
        }
        submission = await prisma.submission.update({
          where: {
            id: existingSubmission.id,
          },
          data: {
            answerText: answerText || null,
            answerImage: answerImage || null,
            status: "PENDING",
            feedback: null, // Clear previous feedback
            updatedAt: new Date(),
          },
          include: {
            assignment: true,
            team: true,
            player: true,
          },
        });
      } else {
        return NextResponse.json(
          { error: "Submission already exists for this assignment" },
          { status: 400 },
        );
      }
    } else {
      // Nieuwe inzending: controleer dat de opdracht echt vrijgegeven is voor
      // dit team (anti-bypass: niet inleveren op een LOCKED/niet-toegewezen opdracht).
      const unlocked = await isAssignmentUnlockedForTeam(teamId, assignmentId);
      if (!unlocked) {
        return NextResponse.json(
          { error: "Deze opdracht is nog niet beschikbaar voor jouw team" },
          { status: 403 },
        );
      }

      // Create new submission
      submission = await prisma.submission.create({
        data: {
          teamId,
          assignmentId,
          playerId: playerId || null,
          answerText: answerText || null,
          answerImage: answerImage || null,
          status: "PENDING",
        },
        include: {
          assignment: true,
          team: true,
          player: true,
        },
      });
    }

    return NextResponse.json(submission);
  } catch (error) {
    console.error("Error creating submission:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
