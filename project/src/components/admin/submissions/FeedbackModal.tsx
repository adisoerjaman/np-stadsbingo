"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface Submission {
  id: string;
  answerText: string | null;
  answerImage: string | null;
  status: "PENDING" | "APPROVED" | "FEEDBACK";
  feedback: string | null;
  createdAt: string;
  updatedAt: string;
  team: {
    name: string;
    code: string;
  };
  assignment: {
    title: string;
    order: number;
  };
  player: {
    name: string;
  } | null;
}

interface FeedbackModalProps {
  selectedSubmission: Submission | null;
  feedback: string;
  setFeedback: (feedback: string) => void;
  onSubmitFeedback: (submissionId: string, feedback: string) => void;
  onClose: () => void;
}

export default function FeedbackModal({
  selectedSubmission,
  feedback,
  setFeedback,
  onSubmitFeedback,
  onClose,
}: FeedbackModalProps) {
  if (!selectedSubmission) return null;

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full">
        <h3 className="text-lg font-bold text-[#2C2C2C] mb-4">
          Feedback geven
        </h3>
        <p className="text-sm text-[#6B7280] mb-4">
          {selectedSubmission.assignment.title} - {selectedSubmission.team.name}
        </p>

        <div className="mb-4">
          <Label htmlFor="feedback">Feedback bericht:</Label>
          <textarea
            id="feedback"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Voer feedback in voor het team..."
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FFE600] focus:border-transparent"
            rows={4}
          />
        </div>

        <div className="flex gap-2">
          <Button
            onClick={() => onSubmitFeedback(selectedSubmission.id, feedback)}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white"
            disabled={!feedback.trim()}
          >
            Feedback Versturen
          </Button>
          <Button onClick={onClose} variant="outline" className="flex-1">
            Annuleren
          </Button>
        </div>
      </div>
    </div>
  );
}
