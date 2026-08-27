"use client";

import { useEffect, useRef } from "react";
import toast from "react-hot-toast";

interface Exercise {
  id: string;
  title: string;
  status: "LOCKED" | "AVAILABLE" | "PENDING" | "FEEDBACK" | "APPROVED";
}

export default function TeamNotificationListener() {
  const previousStatusesRef = useRef<Record<string, string>>({});
  const isFirstLoadRef = useRef(true);

  useEffect(() => {
    const checkExercises = async () => {
      try {
        const response = await fetch("/api/exercises", {
          credentials: "include",
        });
        if (!response.ok) return;
        const data: Exercise[] = await response.json();

        const currentStatuses: Record<string, string> = {};
        for (const ex of data) {
          currentStatuses[ex.id] = ex.status;
        }

        if (isFirstLoadRef.current) {
          previousStatusesRef.current = currentStatuses;
          isFirstLoadRef.current = false;
          return;
        }

        for (const ex of data) {
          const prevStatus = previousStatusesRef.current[ex.id];
          const newStatus = ex.status;

          if (prevStatus && prevStatus !== newStatus) {
            // Check status change from PENDING to APPROVED or FEEDBACK
            if (prevStatus === "PENDING" && newStatus === "APPROVED") {
              toast.success(`Opdracht "${ex.title}" is nagekeken. Opdracht is voltooid!`, {
                duration: 6000,
                position: "top-center",
              });
            } else if (prevStatus === "PENDING" && newStatus === "FEEDBACK") {
              toast.error(`Opdracht "${ex.title}" is nagekeken. Opdracht is afgekeurd.`, {
                duration: 6000,
                position: "top-center",
              });
            }
          }
        }

        previousStatusesRef.current = currentStatuses;
      } catch (error) {
        console.error("Failed to check exercises status:", error);
      }
    };

    // Initial check
    checkExercises();

    // Check every 10 seconds
    const interval = setInterval(checkExercises, 10000);
    return () => clearInterval(interval);
  }, []);

  return null;
}
