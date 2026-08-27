"use client";

import { AlertCircle, ArrowRight, CheckCircle, Upload, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import ImageModal from "@/components/shared/ImageModal";
import LocationMap from "@/components/shared/LocationMap";
import {
  HamburgerMenu,
  HamburgerTrigger,
  useHamburgerMenu,
} from "@/components/ui/hamburger-menu";
import { resizeImage, uploadImageWithProgress } from "@/lib/imageUpload";

interface ExerciseDetail {
  id: string;
  title: string;
  description: string;
  location: string;
  latitude?: number | null;
  longitude?: number | null;
  order: number;
  exampleImage?: string | null;
  status: "LOCKED" | "AVAILABLE" | "PENDING" | "FEEDBACK" | "APPROVED";
  submission: {
    id: string;
    answerText: string | null;
    answerImage: string | null;
    status: string;
    feedback: string | null;
    createdAt: string;
  } | null;
}

interface ExerciseDetailContentProps {
  exerciseId: string;
}

export default function ExerciseDetailContent({
  exerciseId,
}: ExerciseDetailContentProps) {
  const { isOpen, openMenu, closeMenu } = useHamburgerMenu();
  const [exercise, setExercise] = useState<ExerciseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploadPercent, setUploadPercent] = useState<number | null>(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [modalImageUrl, setModalImageUrl] = useState<string>("");
  const [modalImageTitle, setModalImageTitle] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    // Fetch exercise details - middleware handles authentication
    fetch(`/api/exercises/${exerciseId}`, {
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Exercise not found");
        }
        return res.json();
      })
      .then((exerciseData) => {
        setExercise(exerciseData);
        if (exerciseData.submission?.answerImage) {
          setUploadedImage(exerciseData.submission.answerImage);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching exercise:", error);
        router.push("/dashboard/exercises");
      });
  }, [router, exerciseId]);

  // Realtime feedback: terwijl een inzending op beoordeling wacht (PENDING),
  // pollen we periodiek of de docent al heeft beoordeeld en melden het direct.
  useEffect(() => {
    if (exercise?.status !== "PENDING") return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/exercises/${exerciseId}`, {
          credentials: "include",
        });
        if (!res.ok) return;
        const data: ExerciseDetail = await res.json();

        if (data.status !== "PENDING") {
          setExercise(data);
          if (data.submission?.answerImage) {
            setUploadedImage(data.submission.answerImage);
          }
          if (data.status === "FEEDBACK") {
            toast("Je hebt feedback ontvangen van de docent", {
              icon: "✏️",
              position: "top-center",
            });
          } else if (data.status === "APPROVED") {
            toast.success("Je opdracht is goedgekeurd!", {
              position: "top-center",
            });
          }
        }
      } catch {
        // stil falen; volgende poll probeert opnieuw
      }
    }, 15000);

    return () => clearInterval(interval);
  }, [exercise?.status, exerciseId]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadPercent(0);
    setSubmitting(true);
    try {
      // Foto eerst in de browser verkleinen → veel snellere upload op mobiel.
      const resized = await resizeImage(file);
      const { url } = await uploadImageWithProgress(resized, setUploadPercent);
      setUploadedImage(url);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Uploaden mislukt", {
        position: "top-center",
      });
    } finally {
      setUploadPercent(null);
      setSubmitting(false);
    }
  };

  const handleRemoveImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setUploadedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleImageClick = (imageUrl: string, title: string) => {
    setModalImageUrl(imageUrl);
    setModalImageTitle(title);
    setShowImageModal(true);
  };

  const handleCloseModal = () => {
    setShowImageModal(false);
    setModalImageUrl("");
    setModalImageTitle("");
  };

  const handleSubmit = async () => {
    if (!uploadedImage || !exercise) return;

    setSubmitting(true);
    try {
      const response = await fetch("/api/submissions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          assignmentId: exercise.id,
          answerImage: uploadedImage,
          answerText: null,
          playerId: null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Inleveren mislukt");
      }

      const submission = await response.json();
      console.log("Submission created:", submission);

      // Update exercise state to reflect the new submission
      setExercise((prev) =>
        prev
          ? {
              ...prev,
              status: "PENDING",
              submission: {
                id: submission.id,
                answerText: submission.answerText,
                answerImage: submission.answerImage,
                status: submission.status,
                feedback: submission.feedback,
                createdAt: submission.createdAt,
              },
            }
          : null,
      );

      toast.success("Opdracht succesvol ingeleverd!", {
        duration: 4000,
        position: "top-center",
      });

      // Redirect to exercises dashboard after showing success message
      setTimeout(() => {
        router.push("/dashboard/exercises");
      }, 2000); // 2 second delay to let user see the success message
    } catch (error) {
      console.error("Error submitting:", error);
      toast.error(
        `Er ging iets mis: ${error instanceof Error ? error.message : "Onbekende fout"}`,
        {
          duration: 4000,
          position: "top-center",
        },
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#EDE6DC] flex items-center justify-center">
        <p className="text-[#2C2C2C]">Laden...</p>
      </div>
    );
  }

  if (!exercise) {
    return (
      <div className="min-h-screen bg-[#EDE6DC] flex items-center justify-center">
        <p className="text-[#2C2C2C]">Opdracht niet gevonden</p>
      </div>
    );
  }

  const hasSubmission = exercise.submission !== null;
  const submissionStatus = exercise.submission?.status || "Niet ingeleverd";
  const canResubmit = exercise.submission?.status === "FEEDBACK";
  const isApproved = exercise.submission?.status === "APPROVED";
  const isPending = exercise.submission?.status === "PENDING";

  const getStatusDisplay = () => {
    switch (submissionStatus) {
      case "PENDING":
        return "In behandeling";
      case "APPROVED":
        return "Goedgekeurd";
      case "FEEDBACK":
        return "Feedback ontvangen";
      default:
        return "Niet ingeleverd";
    }
  };

  const getStatusColor = () => {
    switch (submissionStatus) {
      case "PENDING":
        return "text-yellow-600";
      case "APPROVED":
        return "text-green-600";
      case "FEEDBACK":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <main className="min-h-screen bg-[#EDE6DC] pb-24">
      {/* Hamburger Menu */}
      <HamburgerMenu isOpen={isOpen} onClose={closeMenu} />

      {/* Header */}
      <header className="flex items-center justify-between px-4 py-4 md:px-6">
        <div className="w-full max-w-xs mb-6 mt-8 md:absolute">
          <Link href={"/dashboard/exercises"}>
            <Image src="/logo.png" alt="NexEd" width={128} height={128} />
          </Link>
        </div>
        <HamburgerTrigger onClick={openMenu} className="md:hidden" />
      </header>

      {/* Hero Image with Tag - Full Width */}
      <div className="relative w-full h-64 md:h-80 mb-6">
        <Image
          src="/grotemarkt.jpg"
          alt="Exercise location"
          fill
          className="object-cover brightness-80"
        />
        <div className="absolute bottom-4 left-4 md:left-6 bg-[#FFE600] rounded-xl px-5 py-2.5">
          <span className="text-[#2C2C2C] font-bold text-xl">
            Opdracht {exercise.order}
          </span>
        </div>
      </div>

      <div className="px-4 md:px-6 md:max-w-2xl md:mx-auto">
        {/* Beschrijving Section */}
        <section className="mb-6">
          <h2 className="text-xl font-bold text-[#2C2C2C] mb-3">
            Beschrijving
          </h2>
          <p className="text-base text-[#2C2C2C] font-light leading-relaxed">
            {exercise.description}
          </p>
        </section>

        {/* Locatie Section */}
        <section className="mb-6">
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <h2 className="text-xl font-bold text-[#2C2C2C] mb-3">
              Locatie: {exercise.location}
            </h2>
            {exercise.latitude != null && exercise.longitude != null && (
              <LocationMap
                latitude={exercise.latitude}
                longitude={exercise.longitude}
                label={`Locatie: ${exercise.location}`}
              />
            )}
            <div className="mt-3 flex gap-2">
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(exercise.location + ", Groningen, Netherlands")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-[#2C2C2C] text-white text-center py-3 px-4 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
              >
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <title>Locatiemarker</title>
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                </svg>
                Open in Google Maps
              </a>
            </div>
          </div>
        </section>

        {/* Inspiratie Section */}
        {exercise.exampleImage && (
          <section className="mb-6">
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <h2 className="text-xl font-bold text-[#2C2C2C] mb-3">
                Inspiratie
              </h2>
              <button
                type="button"
                aria-label="Voorbeeldfoto vergroten"
                className="w-full h-48 bg-gray-100 rounded-xl mb-3 overflow-hidden cursor-pointer hover:opacity-90 transition-opacity block"
                onClick={() =>
                  handleImageClick(
                    exercise.exampleImage!,
                    "Voorbeeld afbeelding",
                  )
                }
              >
                <Image
                  src={exercise.exampleImage}
                  alt="Voorbeeld afbeelding"
                  width={400}
                  height={192}
                  className="w-full h-full object-cover"
                />
              </button>
              <p className="text-sm text-[#2C2C2C]">
                Probeer verschillende poses uit en wees creatief met je
                compositie! Klik op de afbeelding om deze groter te bekijken.
              </p>
            </div>
          </section>
        )}

        {/* Upload Section */}
        <section className="mb-6">
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <h2 className="text-xl font-bold text-[#2C2C2C] mb-3">
              Lever hier je foto in
            </h2>
            {/* biome-ignore lint/a11y/useSemanticElements: dropzone bevat de file-input en kan geen <button> zijn */}
            <div
              role="button"
              tabIndex={0}
              aria-label="Klik om een foto te uploaden"
              className="bg-gray-100 rounded-2xl p-8 border-2 border-dashed border-gray-300 cursor-pointer hover:border-gray-400 transition-colors min-h-[200px] flex items-center justify-center"
              onClick={() => fileInputRef.current?.click()}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  fileInputRef.current?.click();
                }
              }}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              {uploadedImage ? (
                <div className="relative w-full h-64 rounded-xl overflow-hidden group">
                  <Image
                    src={uploadedImage}
                    alt="Uploaded"
                    fill
                    className="object-cover"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute top-2 right-2 bg-[#2C2C2C] text-white rounded-full p-2 hover:bg-red-600 transition-colors shadow-lg"
                    aria-label="Verwijder afbeelding"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              ) : uploadPercent !== null ? (
                <div className="flex flex-col items-center justify-center w-full px-6">
                  <p className="text-[#2C2C2C] font-medium mb-2">
                    Foto wordt geüpload… {uploadPercent}%
                  </p>
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-[#FFE600] h-2 transition-all"
                      style={{ width: `${uploadPercent}%` }}
                    />
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center">
                  <div className="bg-[#2C2C2C] rounded-lg p-3 mb-3">
                    <Upload className="h-6 w-6 text-white" />
                  </div>
                  <p className="text-[#2C2C2C] font-medium">
                    Klik om te uploaden
                  </p>
                </div>
              )}
            </div>
            <div className="mt-3 flex items-center gap-2">
              <p className="text-sm font-medium text-[#2C2C2C]">Status:</p>
              <div className={`flex items-center gap-1 ${getStatusColor()}`}>
                {isPending && <AlertCircle className="h-4 w-4" />}
                {isApproved && <CheckCircle className="h-4 w-4" />}
                {submissionStatus === "FEEDBACK" && (
                  <AlertCircle className="h-4 w-4" />
                )}
                <span className="text-sm font-medium">
                  {getStatusDisplay()}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Feedback Section */}
        <section className="mb-12">
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <h2 className="text-xl font-bold text-[#2C2C2C] mb-3">
              Feedback van docent
            </h2>
            <div
              className={`rounded-2xl p-4 min-h-[100px] ${
                exercise.submission?.feedback
                  ? exercise.submission.status === "FEEDBACK"
                    ? "bg-red-50 border-2 border-red-200"
                    : "bg-blue-50 border-2 border-blue-200"
                  : "bg-gray-100"
              }`}
            >
              {exercise.submission?.feedback ? (
                <div>
                  {exercise.submission.status === "FEEDBACK" && (
                    <div className="flex items-center gap-2 mb-3">
                      <AlertCircle className="h-5 w-5 text-red-600" />
                      <span className="font-semibold text-red-800">
                        Actie vereist
                      </span>
                    </div>
                  )}
                  <p className="text-base text-[#2C2C2C] leading-relaxed">
                    {exercise.submission.feedback}
                  </p>
                  {exercise.submission.status === "FEEDBACK" && (
                    <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-yellow-800 font-medium">
                        💡 Je kunt een nieuwe foto uploaden en opnieuw indienen
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-[#2C2C2C]/60">
                  Hier verschijnt feedback van je docent nadat je de opdracht
                  hebt ingeleverd.
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Submit Button */}
        <div className="fixed bottom-0 left-0 right-0 bg-[#EDE6DC] border-t border-gray-300 p-4 md:relative md:border-0 md:p-0 md:mt-6">
          {isApproved ? (
            <div className="w-full bg-green-600 text-white rounded-2xl py-4 px-6 font-semibold text-lg flex items-center justify-center gap-2 md:w-auto md:min-w-[300px]">
              <CheckCircle className="h-5 w-5" />
              Opdracht goedgekeurd!
            </div>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={
                !uploadedImage || submitting || (hasSubmission && !canResubmit)
              }
              className="w-full bg-[#2C2C2C] text-white rounded-2xl py-4 px-6 font-semibold text-lg flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed md:w-auto md:min-w-[300px]"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Bezig met indienen...
                </>
              ) : canResubmit ? (
                <>
                  Opnieuw indienen
                  <ArrowRight className="h-5 w-5" />
                </>
              ) : isPending ? (
                <>
                  <AlertCircle className="h-5 w-5" />
                  Ingeleverd - In behandeling
                </>
              ) : (
                <>
                  Lever je opdracht in
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </button>
          )}
          <p className="text-xs text-[#2C2C2C]/60 mt-2 text-center md:text-left">
            Heb je problemen met het inleveren? Neem contact op met een docent
          </p>
        </div>
      </div>

      {/* Image Modal */}
      {showImageModal && (
        <ImageModal
          imageUrl={modalImageUrl}
          title={modalImageTitle}
          onClose={handleCloseModal}
        />
      )}

      <Toaster />
    </main>
  );
}
