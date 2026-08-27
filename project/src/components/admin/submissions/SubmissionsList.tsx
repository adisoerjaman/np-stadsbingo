"use client";

import { Check, X, MessageSquare, Download } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import ImageModal from "@/components/shared/ImageModal";
import {
  downloadSinglePhoto,
  generatePhotoFilename,
} from "@/lib/photoDownload";

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

interface SubmissionsListProps {
  submissions: Submission[];
  loading: boolean;
  onApprove: (submissionId: string) => void;
  onReject: (submission: Submission) => void;
}

export default function SubmissionsList({
  submissions,
  loading,
  onApprove,
  onReject,
}: SubmissionsListProps) {
  const [selectedImage, setSelectedImage] = useState<{
    url: string;
    title: string;
    filename: string;
  } | null>(null);
  const [downloading, setDownloading] = useState(false);

  const handleDownloadPhoto = async (submission: Submission) => {
    if (!submission.answerImage) return;

    try {
      setDownloading(true);
      const filename = generatePhotoFilename(
        submission.team.name,
        submission.assignment.title,
        submission.createdAt,
      );
      await downloadSinglePhoto(submission.answerImage, filename);
    } catch (error) {
      toast.error("Kon foto niet downloaden. Probeer het opnieuw.");
    } finally {
      setDownloading(false);
    }
  };
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return (
          <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
            Wachtend
          </span>
        );
      case "APPROVED":
        return (
          <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
            Goedgekeurd
          </span>
        );
      case "FEEDBACK":
        return (
          <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">
            Feedback
          </span>
        );
      default:
        return (
          <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs font-medium">
            {status}
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <p className="text-[#2C2C2C]">Inzendingen laden...</p>
      </div>
    );
  }

  if (submissions.length === 0) {
    return (
      <div className="bg-[#F5F0E8] rounded-2xl p-6 text-center">
        <MessageSquare className="h-12 w-12 text-[#2C2C2C] mx-auto mb-4" />
        <p className="text-[#2C2C2C]">Geen inzendingen gevonden</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {submissions.map((submission) => (
          <div
            key={submission.id}
            className="bg-white rounded-2xl p-5 shadow-sm"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-lg font-bold text-[#2C2C2C]">
                  {submission.assignment.title}
                </h3>
                <p className="text-sm text-[#6B7280]">
                  Team: {submission.team.name}
                </p>
                {submission.player && (
                  <p className="text-sm text-[#6B7280]">
                    Door: {submission.player.name}
                  </p>
                )}
              </div>
              {getStatusBadge(submission.status)}
            </div>

            {/* Submission Content */}
            <div className="mb-4">
              {submission.answerText && (
                <div className="mb-3">
                  <p className="text-sm font-medium text-[#2C2C2C] mb-1">
                    Antwoord:
                  </p>
                  <p className="text-sm text-[#6B7280] bg-gray-50 p-2 rounded">
                    {submission.answerText}
                  </p>
                </div>
              )}

              {submission.answerImage && (
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium text-[#2C2C2C]">Foto:</p>
                    <button
                      type="button"
                      onClick={() => handleDownloadPhoto(submission)}
                      disabled={downloading}
                      className="text-xs text-[#4B5563] hover:text-[#2C2C2C] flex items-center gap-1 disabled:opacity-50"
                      title="Download foto"
                    >
                      <Download className="h-3 w-3" />
                      Download
                    </button>
                  </div>
                  <button
                    type="button"
                    aria-label="Foto vergroten"
                    className="w-full h-32 bg-gray-100 rounded-lg overflow-hidden block"
                    onClick={() =>
                      setSelectedImage({
                        url: submission.answerImage!,
                        title: `${submission.assignment.title} - Team ${submission.team.name}`,
                        filename: generatePhotoFilename(
                          submission.team.name,
                          submission.assignment.title,
                          submission.createdAt,
                        ),
                      })
                    }
                  >
                    <img
                      src={submission.answerImage}
                      alt="Inzending"
                      className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
                    />
                  </button>
                  <p className="text-xs text-[#6B7280] mt-1">
                    Klik om te vergroten
                  </p>
                </div>
              )}
            </div>

            {/* Feedback */}
            {submission.feedback && (
              <div className="mb-4 p-3 bg-red-50 rounded-lg">
                <p className="text-sm font-medium text-red-800 mb-1">
                  Feedback:
                </p>
                <p className="text-sm text-red-700">{submission.feedback}</p>
              </div>
            )}

            {/* Action Buttons */}
            {submission.status === "PENDING" && (
              <div className="flex gap-2">
                <Button
                  onClick={() => onApprove(submission.id)}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  size="sm"
                >
                  <Check className="h-4 w-4 mr-1" />
                  Goedkeuren
                </Button>
                <Button
                  onClick={() => onReject(submission)}
                  variant="outline"
                  className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
                  size="sm"
                >
                  <X className="h-4 w-4 mr-1" />
                  Afwijzen
                </Button>
              </div>
            )}

            <div className="mt-3 pt-3 border-t text-xs text-[#9CA3AF]">
              Ingediend:{" "}
              {new Date(submission.createdAt).toLocaleDateString("nl-NL")}
            </div>
          </div>
        ))}

        {/* Image Modal */}
        {selectedImage && (
          <ImageModal
            imageUrl={selectedImage.url}
            title={selectedImage.title}
            downloadFilename={selectedImage.filename}
            onClose={() => setSelectedImage(null)}
          />
        )}
      </div>
    </>
  );
}
