"use client";

import Link from "next/link";

interface AssignmentDetail {
  id: string;
  title: string;
  description: string;
  location: string | null;
  status: string;
}

interface Team {
  id: string;
  name: string;
}

interface ReviewContentProps {
  assignment: AssignmentDetail | null;
  currentTeam: Team | undefined;
  loadingAssignment: boolean;
  onApprove: () => void;
  onReject: () => void;
  feedback: string;
  setFeedback: (feedback: string) => void;
}

export default function ReviewContent({
  assignment,
  currentTeam,
  loadingAssignment,
  onApprove,
  onReject,
  feedback,
  setFeedback,
}: ReviewContentProps) {
  const pageTitle =
    assignment && currentTeam
      ? `${assignment.title} - ${currentTeam.name}`
      : "Opdracht - Team";

  const renderImagePlaceholder = () => (
    <div className="w-full rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] p-4">
      <div className="h-48 w-full bg-[repeating-linear-gradient(45deg,#E5E7EB,#E5E7EB_10px,#F9FAFB_10px,#F9FAFB_20px)] rounded-xl" />
    </div>
  );

  return (
    <section className="flex-1 px-6 pt-32 md:pt-32 md:px-16">
      <Link
        href="/admin"
        className="mb-6 inline-block text-sm text-[#4B5563] hover:text-[#111827]"
      >
        ← Ga terug
      </Link>

      <h1 className="text-3xl md:text-4xl font-bold text-[#2C2C2C] mb-10">
        {loadingAssignment ? "Opdracht laden..." : pageTitle}
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] gap-8 max-w-5xl">
        {/* Left column: submission + feedback + actions */}
        <div className="space-y-6">
          {/* Submission image */}
          {renderImagePlaceholder()}

          {/* Feedback box */}
          <div className="bg-white rounded-2xl border border-[#E5E7EB] p-4">
            <h2 className="text-sm font-semibold text-[#111827] mb-2">
              Eventuele feedback
            </h2>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Vul hier je feedback in, dit is verplicht als je afkeurt"
              className="w-full min-h-[120px] rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#FFE600] focus:border-transparent"
            />
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-4">
            <button
              type="button"
              onClick={onReject}
              className="px-8 py-2 rounded-lg bg-[#EF4444] text-sm font-semibold text-white hover:bg-[#DC2626]"
            >
              Keur af
            </button>
            <button
              type="button"
              onClick={onApprove}
              className="px-8 py-2 rounded-lg bg-[#16A34A] text-sm font-semibold text-white hover:bg-[#15803D]"
            >
              Keur goed
            </button>
          </div>
        </div>

        {/* Right column: description, location, inspiration */}
        <div className="space-y-6">
          {/* Beschrijving */}
          <div className="bg-white rounded-2xl border border-[#E5E7EB] p-4">
            <h2 className="text-sm font-semibold text-[#111827] mb-2">
              Beschrijving
            </h2>
            <p className="text-sm text-[#4B5563] leading-relaxed">
              {assignment?.description ||
                "Hier komt de beschrijving van de opdracht te staan."}
            </p>
          </div>

          {/* Locatie */}
          <div className="bg-white rounded-2xl border border-[#E5E7EB] p-4">
            <h2 className="text-sm font-semibold text-[#111827] mb-2">
              Locatie{assignment?.location ? `: ${assignment.location}` : ""}
            </h2>
            <div className="mb-2 rounded-xl border border-[#E5E7EB] overflow-hidden">
              <div className="h-40 w-full bg-[repeating-linear-gradient(45deg,#E5E7EB,#E5E7EB_10px,#F9FAFB_10px,#F9FAFB_20px)]" />
            </div>
            <p className="text-xs text-[#6B7280]">
              Kaartvoorbeeld van de locatie (later te vervangen door echte map).
            </p>
          </div>

          {/* Inspiratie foto */}
          <div className="bg-white rounded-2xl border border-[#E5E7EB] p-4">
            <h2 className="text-sm font-semibold text-[#111827] mb-2">
              Inspiratie foto
            </h2>
            {renderImagePlaceholder()}
            <p className="mt-2 text-xs text-[#6B7280]">
              Hier kun je een inspiratiefoto tonen met extra uitleg.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
