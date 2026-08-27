"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { FileText, Phone, HelpCircle, Lightbulb, Landmark } from "lucide-react";
import {
  HamburgerMenu,
  HamburgerTrigger,
  useHamburgerMenu,
} from "@/components/ui/hamburger-menu";
import TutorialModal from "./TutorialModal";

interface Team {
  id: string;
  name: string;
  code: string;
}

interface DashboardContentProps {
  team: Team;
}

export default function DashboardContent({ team }: DashboardContentProps) {
  const { isOpen, openMenu, closeMenu } = useHamburgerMenu();
  const [showTutorial, setShowTutorial] = useState(false);

  useEffect(() => {
    const tutorialCompleted = localStorage.getItem("tutorialCompleted");
    if (!tutorialCompleted) {
      setShowTutorial(true);
    }
  }, []);

  return (
    <main className="min-h-screen bg-[#EDE6DC] pb-8">
      {/* Tutorial Modal */}
      <TutorialModal
        isOpen={showTutorial}
        onClose={() => setShowTutorial(false)}
      />

      {/* Hamburger Menu */}
      <HamburgerMenu isOpen={isOpen} onClose={closeMenu} />

      {/* Header */}
      <header className="flex items-center justify-between px-4 py-4 md:px-6 md:py-6">
        <div className="w-full max-w-xs mb-6 mt-8 md:absolute">
          <Link href={"/dashboard"}>
            <Image src="/logo.png" alt="NexEd" width={128} height={128} />
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <HamburgerTrigger onClick={openMenu} className="md:hidden" />
        </div>
      </header>

      <div className="px-4 md:px-6 md:max-w-4xl md:mx-auto">
        {/* Welcome Box */}
        <div className="bg-[#FFE600] rounded-2xl p-6 mb-6 pt-4 md:p-8">
          <h2 className="text-2xl font-bold text-[#2C2C2C] mb-2 md:text-3xl">
            Welkom, Team {team.name}!
          </h2>
          <p className="text-base text-[#2C2C2C] leading-relaxed md:text-lg">
            De Groningse stads bingo voor de studenten van de Bit Academy
          </p>
        </div>

        {/* Tutorial Button */}
        <button
          type="button"
          onClick={() => setShowTutorial(true)}
          className="bg-[#CDEFFF] rounded-2xl p-4 mb-4 md:p-6 w-full text-left hover:bg-[#CDEFFF]/80 transition-colors flex items-center gap-3"
        >
          <HelpCircle className="h-6 w-6 text-[#2C2C2C] flex-shrink-0" />
          <div>
            <h3 className="font-bold text-lg md:text-xl mb-1">
              Hoe werkt het?
            </h3>
            <p className="text-[#2C2C2C]/90 text-sm md:text-base">
              Bekijk de tutorial om te zien hoe je opdrachten kunt voltooien
            </p>
          </div>
        </button>

        {/* Navigation Cards */}
        <div className="space-y-4 max-w-md mx-auto md:max-w-none md:grid md:grid-cols-2 md:gap-6 md:space-y-0 mb-8">
          {/* Opdrachten Card */}
          <Link
            href="/dashboard/exercises"
            className="block bg-[#F5F0E8] rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow active:scale-[0.98] md:p-6"
          >
            <div className="flex items-start gap-4 md:flex-col md:items-center md:text-center md:gap-3">
              <div className="bg-[#FFE600] rounded-lg p-3 flex-shrink-0 md:p-4">
                <FileText className="h-6 w-6 text-[#4A5568] md:h-8 md:w-8" />
              </div>
              <div className="flex-1 md:flex-none">
                <h4 className="text-large font-bold text-[#2C2C2C] mb-1 md:text-2xl md:mb-2">
                  Opdrachten
                </h4>
                <p className="text-sm text-[#2C2C2C]/80 md:text-base font-light">
                  Bekijk en voltooi je opdrachten
                </p>
              </div>
            </div>
          </Link>

          {/* Contact Card */}
          <Link
            href="/dashboard/contact"
            className="block bg-[#F5F0E8] rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow active:scale-[0.98] md:p-6"
          >
            <div className="flex items-start gap-4 md:flex-col md:items-center md:text-center md:gap-3">
              <div className="bg-[#FFE600] rounded-lg p-3 flex-shrink-0 md:p-4">
                <Phone className="h-6 w-6 text-[#4A5568] md:h-6 md:w-6" />
              </div>
              <div className="flex-1 md:flex-none">
                <h4 className="text-large font-bold text-[#2C2C2C] mb-1 md:text-2xl md:mb-2">
                  Contact
                </h4>
                <p className="text-sm text-[#2C2C2C]/80 md:text-base font-light">
                  Neem contact op met de docenten
                </p>
              </div>
            </div>
          </Link>
        </div>

        {/* Tips Section */}
        <div className="bg-white/50 rounded-2xl p-6 mb-6 max-w-md mx-auto md:max-w-none">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-[#FFE600] rounded-lg p-2">
              <Lightbulb className="h-5 w-5 text-[#4A5568]" />
            </div>
            <h3 className="font-bold text-lg md:text-xl text-[#2C2C2C]">
              Tips voor succes
            </h3>
          </div>
          <ul className="space-y-3 text-[#2C2C2C]/90">
            <li className="flex gap-3">
              <span className="text-[#FFE600] font-bold">→</span>
              <span className="text-sm md:text-base">
                Maak duidelijke foto's met goede belichting
              </span>
            </li>
            <li className="flex gap-3">
              <span className="text-[#FFE600] font-bold">→</span>
              <span className="text-sm md:text-base">
                Werk samen met je team en verdeel de taken
              </span>
            </li>
            <li className="flex gap-3">
              <span className="text-[#FFE600] font-bold">→</span>
              <span className="text-sm md:text-base">
                Lees de opdrachten goed door voordat je begint
              </span>
            </li>
            <li className="flex gap-3">
              <span className="text-[#FFE600] font-bold">→</span>
              <span className="text-sm md:text-base">
                <span className="font-bold">Stuur normale foto's</span>,
                Docenten bekijken elke foto.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="text-[#FFE600] font-bold">→</span>
              <span className="text-sm md:text-base">
                Heb je vragen? Neem{" "}
                <Link
                  href="/dashboard/contact"
                  className="font-semibold underline hover:text-[#2C2C2C] transition-colors"
                >
                  contact
                </Link>{" "}
                op met je docent
              </span>
            </li>
          </ul>
        </div>

        {/* Fun Fact about Groningen */}
        <div className="mt-8 text-center max-w-md mx-auto">
          <p className="text-xs text-[#2C2C2C]/50 leading-relaxed">
            💡 Wist je dat Groningen meer dan 50.000 studenten heeft? Veel
            plezier met het ontdekken van de stad!
          </p>
        </div>
      </div>
    </main>
  );
}
