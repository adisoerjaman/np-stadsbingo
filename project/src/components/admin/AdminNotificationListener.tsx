"use client";

import { useEffect, useRef } from "react";
import toast from "react-hot-toast";

interface PendingSubmission {
  id: string;
  team: {
    name: string;
  };
  assignment: {
    title: string;
  };
}

export default function AdminNotificationListener() {
  const knownSubmissionsRef = useRef<Set<string>>(new Set());
  const isFirstLoadRef = useRef(true);

  useEffect(() => {
    const checkSubmissions = async () => {
      try {
        const response = await fetch("/api/admin/submissions?status=PENDING", {
          credentials: "include",
        });
        if (!response.ok) return;
        const data: PendingSubmission[] = await response.json();

        const currentIds = new Set(data.map((s) => s.id));

        if (isFirstLoadRef.current) {
          // On first load, just record the existing pending submissions without showing toasts
          knownSubmissionsRef.current = currentIds;
          isFirstLoadRef.current = false;
          return;
        }

        // Check for new submissions
        for (const sub of data) {
          if (!knownSubmissionsRef.current.has(sub.id)) {
            toast(`Nieuwe inzending van ${sub.team.name} voor "${sub.assignment.title}"!`, {
              icon: "🔔",
              duration: 6000,
              position: "top-center",
            });
          }
        }

        knownSubmissionsRef.current = currentIds;
      } catch (error) {
        console.error("Failed to check pending submissions:", error);
      }
    };

    // Initial check
    checkSubmissions();

    // Check every 10 seconds
    const interval = setInterval(checkSubmissions, 10000);
    return () => clearInterval(interval);
  }, []);

  return null;
}
