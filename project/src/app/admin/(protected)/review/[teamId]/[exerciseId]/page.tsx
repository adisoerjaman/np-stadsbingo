"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import toast from "react-hot-toast";
import ReviewSidebar from "@/components/admin/submissions/ReviewSidebar";
import ReviewContent from "@/components/admin/submissions/ReviewContent";

interface Team {
  id: string;
  name: string;
}

interface AssignmentDetail {
  id: string;
  title: string;
  description: string;
  location: string | null;
  status: string;
}

export default function ReviewAssignmentPage() {
  const params = useParams();
  const teamId = params?.teamId as string;
  const exerciseId = params?.exerciseId as string;

  const [teams, setTeams] = useState<Team[]>([]);
  const [assignment, setAssignment] = useState<AssignmentDetail | null>(null);
  const [loadingTeams, setLoadingTeams] = useState(true);
  const [loadingAssignment, setLoadingAssignment] = useState(true);
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const res = await fetch("/api/admin/teams");
        if (!res.ok) return;
        const data: Team[] = await res.json();
        setTeams(data);
      } catch (error) {
        console.error("Error fetching teams:", error);
      } finally {
        setLoadingTeams(false);
      }
    };

    fetchTeams();
  }, []);

  useEffect(() => {
    const fetchAssignment = async () => {
      if (!teamId || !exerciseId) return;
      try {
        const res = await fetch(`/api/exercises/${teamId}/${exerciseId}`);
        if (!res.ok) return;
        const data = await res.json();
        setAssignment({
          id: data.id,
          title: data.title,
          description: data.description,
          location: data.location,
          status: data.status,
        });
      } catch (error) {
        console.error("Error fetching assignment detail:", error);
      } finally {
        setLoadingAssignment(false);
      }
    };

    fetchAssignment();
  }, [teamId, exerciseId]);

  const currentTeam = teams.find((t) => t.id === teamId);

  const handleApprove = async () => {
    console.log("Goedgekeurd:", feedback);
  };

  const handleReject = async () => {
    if (!feedback.trim()) {
      toast.error("Feedback is verplicht bij afkeuring");
      return;
    }
    console.log("Afgekeurd met feedback:", feedback);
  };

  return (
    <main className="min-h-screen bg-[#EDE6DC] flex relative pb-10 items-stretch">
      <ReviewSidebar
        teams={teams}
        loadingTeams={loadingTeams}
        currentTeamId={teamId}
      />

      <ReviewContent
        assignment={assignment}
        currentTeam={currentTeam}
        loadingAssignment={loadingAssignment}
        onApprove={handleApprove}
        onReject={handleReject}
        feedback={feedback}
        setFeedback={setFeedback}
      />
    </main>
  );
}
