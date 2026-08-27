"use client";

import { useEffect, useState } from "react";
import {
  X,
  PartyPopper,
  MapPin,
  Trophy,
  CheckCircle,
  Lightbulb,
} from "lucide-react";

interface CompletionOutroProps {
  isOpen: boolean;
  onClose: () => void;
  totalExercises: number;
}

export default function CompletionOutro({
  isOpen,
  onClose,
}: CompletionOutroProps) {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShowConfetti(true);
      // Stop confetti na 3 seconds
      const timer = setTimeout(() => setShowConfetti(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      {/* Confetti effect */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-fall"
              style={{
                left: `${Math.random() * 100}%`,
                top: `-${Math.random() * 20}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
              }}
            >
              <div
                className="w-2 h-2 rounded-full"
                style={{
                  backgroundColor: [
                    "#FFE600",
                    "#FF6B6B",
                    "#4ECDC4",
                    "#45B7D1",
                    "#FFA07A",
                  ][Math.floor(Math.random() * 5)],
                }}
              />
            </div>
          ))}
        </div>
      )}

      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl relative">
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg transition-colors z-10"
          aria-label="Sluiten"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header with trophy */}
        <div className="bg-gradient-to-br from-[#FFE600] to-[#FFD700] p-8 text-center">
          <div className="inline-block bg-white rounded-full p-4 mb-4 shadow-lg">
            <Trophy className="h-16 w-16 text-[#FFE600]" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-[#2C2C2C] mb-2">
            Gefeliciteerd!
          </h2>
          <p className="text-lg text-[#2C2C2C]">
            Jullie hebben alle opdrachten voltooid!
          </p>
        </div>

        {/* Content */}
        <div className="p-6 md:p-8 space-y-6">
          {/* Success message */}
          <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-6">
            <div className="flex items-start gap-4">
              <PartyPopper className="h-8 w-8 text-green-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-bold text-[#2C2C2C] mb-2">
                  Bingo! Jullie zijn klaar!
                </h3>
                <p className="text-base text-[#2C2C2C]/90 leading-relaxed">
                  Wat een prestatie! Jullie hebben alle opdrachten in Groningen
                  succesvol afgerond. Hopelijk hebben jullie genoten van het
                  ontdekken van deze prachtige stad.
                </p>
              </div>
            </div>
          </div>

          {/* Next steps */}
          <div className="bg-[#CDEFFF] rounded-2xl p-6">
            <h3 className="text-xl font-bold text-[#2C2C2C] mb-4 flex items-center gap-2">
              <MapPin className="h-6 w-6" />
              Laatste stap: Bezoek je docent
            </h3>
            <p className="text-base text-[#2C2C2C]/90 leading-relaxed mb-4">
              De laatste opdracht heeft jullie naar de locatie van je docenten
              geleid. Ga daar naartoe om je voltooide bingo te laten zien en je
              beloning in ontvangst te nemen!
            </p>
            <div className="bg-white rounded-lg p-4 border-2 border-[#FFE600]">
              <div className="flex items-center gap-2 mb-2">
                <Lightbulb className="h-4 w-4 text-[#FFE600]" />
                <p className="text-sm font-semibold text-[#2C2C2C]">
                  Vergeet niet:
                </p>
              </div>
              <ul className="text-sm text-[#2C2C2C]/90 space-y-1 list-disc list-inside">
                <li>Neem je telefoon mee met deze app</li>
                <li>Kom met je hele team</li>
                <li>Wees trots op wat jullie hebben bereikt!</li>
              </ul>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#F5F0E8] rounded-xl p-4 text-center">
              <div className="flex justify-center mb-2">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <p className="text-sm text-[#2C2C2C]/70">Alle opdrachten</p>
              <p className="text-sm text-[#2C2C2C]/70">voltooid</p>
            </div>
            <div className="bg-[#F5F0E8] rounded-xl p-4 text-center">
              <div className="flex justify-center mb-2">
                <Trophy className="h-8 w-8 text-[#FFE600]" />
              </div>
              <p className="text-sm text-[#2C2C2C]/70">Groningen</p>
              <p className="text-sm text-[#2C2C2C]/70">ontdekt!</p>
            </div>
          </div>

          {/* Thank you message */}
          <div className="text-center pt-4 border-t">
            <p className="text-base text-[#2C2C2C]/80 leading-relaxed">
              Bedankt voor het spelen van de Groningse Stadsbingo! We hopen dat
              jullie veel plezier hebben gehad en mooie herinneringen hebben
              gemaakt.
            </p>
          </div>

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="w-full bg-[#FFE600] hover:bg-[#FFE600]/90 text-[#2C2C2C] font-semibold py-4 rounded-xl transition-colors"
          >
            Sluiten
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes fall {
          to {
            transform: translateY(100vh) rotate(360deg);
          }
        }
        .animate-fall {
          animation: fall linear forwards;
        }
      `}</style>
    </div>
  );
}
