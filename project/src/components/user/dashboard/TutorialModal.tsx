"use client";

import { useState } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

interface TutorialSlide {
  image: string;
  title: string;
  description: string;
}

interface TutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const slides: TutorialSlide[] = [
  {
    image: "/grotemarkt.jpg",
    title: "Welkom bij Groningse Stadsbingo!",
    description: "Ontdek Groningen terwijl je opdrachten voltooit met je team.",
  },
  {
    image: "/tutorial/step2.png",
    title: "Bekijk je opdrachten",
    description:
      "Ga naar Opdrachten om te zien welke uitdagingen er op je wachten.",
  },
  {
    image: "/tutorial/step3.png",
    title: "Voltooi een opdracht",
    description:
      "Upload foto's en beschrijvingen om je opdrachten in te dienen.",
  },
  {
    image: "/tutorial/step4.png",
    title: "Ontvang feedback",
    description: "Je docent beoordeelt je inzendingen en geeft feedback.",
  },
];

export default function TutorialModal({ isOpen, onClose }: TutorialModalProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  if (!isOpen) return null;

  const goToNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const goToPrev = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const handleFinish = () => {
    localStorage.setItem("tutorialCompleted", "true");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-bold text-[#2C2C2C]">Hoe werkt het?</h3>
          <button
            type="button"
            onClick={handleFinish}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Sluiten"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Slide Content */}
        <div className="p-6 md:p-8">
          <div className="relative aspect-video bg-gray-100 rounded-lg mb-6 overflow-hidden">
            <Image
              src={slides[currentSlide].image}
              alt={slides[currentSlide].title}
              fill
              className="object-contain"
            />
          </div>

          <h4 className="text-xl md:text-2xl font-bold text-[#2C2C2C] mb-2">
            {slides[currentSlide].title}
          </h4>
          <p className="text-base md:text-lg text-[#2C2C2C]/80">
            {slides[currentSlide].description}
          </p>
        </div>

        {/* Footer with Navigation */}
        <div className="p-4 border-t flex items-center justify-between">
          <button
            type="button"
            onClick={goToPrev}
            disabled={currentSlide === 0}
            className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
            <span className="hidden sm:inline">Vorige</span>
          </button>

          {/* Slide Indicators */}
          <div className="flex gap-2">
            {slides.map((_, index) => (
              <button
                type="button"
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-2 rounded-full transition-all ${
                  index === currentSlide
                    ? "w-8 bg-[#FFE600]"
                    : "w-2 bg-gray-300 hover:bg-gray-400"
                }`}
                aria-label={`Ga naar slide ${index + 1}`}
              />
            ))}
          </div>

          {currentSlide === slides.length - 1 ? (
            <button
              type="button"
              onClick={handleFinish}
              className="px-6 py-2 bg-[#FFE600] hover:bg-[#FFE600]/90 rounded-lg font-semibold transition-colors"
            >
              Start!
            </button>
          ) : (
            <button
              type="button"
              onClick={goToNext}
              className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <span className="hidden sm:inline">Volgende</span>
              <ChevronRight className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
