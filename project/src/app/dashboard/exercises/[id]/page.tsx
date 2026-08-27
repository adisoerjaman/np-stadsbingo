"use client";

import { useParams } from "next/navigation";
import ExerciseDetailContent from "@/components/user/exercises/ExerciseDetailContent";

export default function ExerciseDetailPage() {
  const params = useParams();
  const exerciseId = params.id as string;

  return <ExerciseDetailContent exerciseId={exerciseId} />;
}
