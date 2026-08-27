import { prisma } from "@/lib/prisma";
import { getTeamId } from "@/lib/auth";


export async function GET(request: Request) {
  try {
    const teamId = await getTeamId();

    if (!teamId) {
      return new Response(JSON.stringify({ error: "Team ID is required" }), {
        status: 400,
      });
    }

    // fetch only assignments assigned to this team
    const teamAssignments = await prisma.teamAssignment.findMany({
      where: { teamId },
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
      orderBy: {
        order: "asc",
      },
    });

    // Format the assignments and determine status
    const formatted = teamAssignments.map((ta, index) => {
      const a = ta.assignment;
      const submission = a.submissions[0];

      // If there's a submission, use its status
      if (submission) {
        return {
          id: a.id,
          title: a.title,
          description: a.description,
          location: a.location,
          order: a.order,
          exampleImage: a.exampleImage,
          status: submission.status,
        };
      }

      // If no submission, check if previous assignments are completed
      // First assignment is always available
      if (index === 0) {
        return {
          id: a.id,
          title: a.title,
          description: a.description,
          location: a.location,
          order: a.order,
          exampleImage: a.exampleImage,
          status: "AVAILABLE" as const,
        };
      }

      // Check if previous assignment is approved
      const previousAssignment = teamAssignments[index - 1];
      const previousSubmission = previousAssignment.assignment.submissions[0];

      if (previousSubmission?.status === "APPROVED") {
        return {
          id: a.id,
          title: a.title,
          description: a.description,
          location: a.location,
          order: a.order,
          exampleImage: a.exampleImage,
          status: "AVAILABLE" as const,
        };
      }

      // Otherwise, it's locked
      return {
        id: a.id,
        title: a.title,
        description: a.description,
        location: a.location,
        order: a.order,
        exampleImage: a.exampleImage,
        status: "LOCKED" as const,
      };
    });

    return Response.json(formatted);
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ message: (error as Error).message }), {
      status: 500,
    });
  }
}
