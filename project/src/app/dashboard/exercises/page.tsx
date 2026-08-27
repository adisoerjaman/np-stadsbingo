import { redirect } from "next/navigation";
import ExercisesListContent from "@/components/user/exercises/ExercisesListContent";
import { getTeamFromSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface Exercise {
  id: string;
  title: string;
  description: string;
  location: string;
  order: number;
  exampleImage?: string | null;
  status: "LOCKED" | "AVAILABLE" | "PENDING" | "FEEDBACK" | "APPROVED";
}

async function getExercises(teamId: string): Promise<Exercise[]> {
  try {
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
        assignment: {
          order: "asc",
        },
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
          status: submission.status as Exercise["status"],
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

    return formatted;
  } catch (error) {
    console.error("Error fetching exercises:", error);
    return [];
  }
}

export default async function Exercises() {
  const team = await getTeamFromSession();
  if (!team) redirect("/team-login");

  const exercises = await getExercises(team.id);

  return <ExercisesListContent exercises={exercises} />;
}
