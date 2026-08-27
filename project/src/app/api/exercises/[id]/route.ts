import { prisma } from "@/lib/prisma";
import { getTeamId } from "@/lib/auth";


export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const teamId = await getTeamId();
    const { id: exerciseId } = await params;

    console.log("API Debug - teamId:", teamId, "exerciseId:", exerciseId);

    if (!teamId) {
      console.log("No team ID found in headers");
      return new Response(JSON.stringify({ error: "Team ID is required" }), {
        status: 400,
      });
    }

    if (!exerciseId) {
      console.log("No exercise ID found in params");
      return new Response(
        JSON.stringify({ error: "Exercise ID is required" }),
        { status: 400 },
      );
    }

    // Find the assignment and check if it's assigned to this team
    const teamAssignment = await prisma.teamAssignment.findFirst({
      where: {
        teamId,
        assignmentId: exerciseId,
      },
      include: {
        assignment: {
          include: {
            submissions: {
              where: { teamId },
              take: 1,
            },
          },
        },
      },
    });

    if (!teamAssignment) {
      return new Response(
        JSON.stringify({
          error: "Exercise not found or not assigned to your team",
        }),
        { status: 404 },
      );
    }

    const assignment = teamAssignment.assignment;
    const submission = assignment.submissions[0] || null;

    const exerciseDetail = {
      id: assignment.id,
      title: assignment.title,
      description: assignment.description,
      location: assignment.location,
      latitude: assignment.latitude,
      longitude: assignment.longitude,
      order: assignment.order,
      exampleImage: assignment.exampleImage,
      status: submission?.status || "AVAILABLE",
      submission: submission
        ? {
            id: submission.id,
            answerText: submission.answerText,
            answerImage: submission.answerImage,
            status: submission.status,
            feedback: submission.feedback,
            createdAt: submission.createdAt.toISOString(),
          }
        : null,
    };

    return Response.json(exerciseDetail);
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ message: (error as Error).message }), {
      status: 500,
    });
  }
}
