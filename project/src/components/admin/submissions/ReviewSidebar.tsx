"use client";

import Link from "next/link";
import Image from "next/image";

interface Team {
  id: string;
  name: string;
}

interface ReviewSidebarProps {
  teams: Team[];
  loadingTeams: boolean;
  currentTeamId?: string;
}

export default function ReviewSidebar({
  teams,
  loadingTeams,
  currentTeamId,
}: ReviewSidebarProps) {
  return (
    <>
      {/* Logo */}
      <div className="w-full max-w-xs mb-6 mt-8 md:absolute md:top-6 md:left-6">
        <Link href="/admin">
          <Image src="/logo.png" alt="NexEd" width={128} height={128} />
        </Link>
      </div>

      {/* Left Sidebar */}
      <aside className="w-80 bg-[#EAE2D5] shadow-sm pt-32 pb-10 px-6 hidden md:block min-h-screen">
        <div className="bg-[#FFE600] rounded-2xl p-5 mb-10">
          <h2 className="text-2xl font-extrabold text-[#2C2C2C]">Welkom,</h2>
          <p className="text-2xl font-extrabold text-[#2C2C2C]">Admin</p>
        </div>

        <div>
          <h3 className="text-lg font-extrabold text-[#2C2C2C] mb-4">Teams</h3>
          <div className="space-y-1">
            {loadingTeams ? (
              <div className="text-sm text-[#6B7280]">Teams laden...</div>
            ) : teams.length === 0 ? (
              <div className="text-sm text-[#6B7280]">
                Nog geen teams beschikbaar
              </div>
            ) : (
              teams.map((team) => (
                <div
                  key={team.id}
                  className="flex items-center justify-between py-3 cursor-pointer rounded hover:bg-[#F5F0E8]"
                >
                  <div>
                    <div className="font-medium text-[#111827]">
                      {team.name}
                    </div>
                    <div className="text-sm text-[#6B7280]">
                      {team.id === currentTeamId ? "Geselecteerd" : "Active"}
                    </div>
                  </div>
                  <span className="text-[#9CA3AF] text-lg">›</span>
                </div>
              ))
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
