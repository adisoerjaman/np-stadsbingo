"use client";

import { Trash2, Edit, Users, ListOrdered } from "lucide-react";
import Link from "next/link";
import { SkeletonCardGrid } from "@/components/ui/skeleton";

interface Team {
  id: string;
  name: string;
  code: string;
  createdAt: string;
  captain?: {
    name: string;
  };
  players: Array<{
    id: string;
    name: string;
  }>;
  createdBy: {
    name: string;
    email: string;
  };
  _count: {
    players: number;
    submissions: number;
  };
}

interface TeamListColumnProps {
  teams: Team[];
  loading: boolean;
  onEdit: (team: Team) => void;
  onDelete: (teamId: string) => void;
}

export default function TeamListColumn({
  teams,
  loading,
  onEdit,
  onDelete,
}: TeamListColumnProps) {
  if (loading) {
    return <SkeletonCardGrid />;
  }

  if (teams.length === 0) {
    return (
      <div className="bg-[#F5F0E8] rounded-2xl p-6 text-center">
        <Users className="h-12 w-12 text-[#2C2C2C] mx-auto mb-4" />
        <p className="text-[#2C2C2C]">Geen teams gevonden</p>
        <p className="text-[#6B7280] text-sm mt-2">
          Klik op "Nieuw Team" om je eerste team aan te maken
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {teams.map((team) => (
        <div key={team.id} className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="text-lg font-bold text-[#2C2C2C]">{team.name}</h3>
              <p className="text-sm text-[#6B7280]">Code: {team.code}</p>
            </div>
            <div className="flex gap-1">
              <Link
                href={`/admin/teams/${team.id}/order`}
                className="p-2 text-[#6B7280] hover:text-[#2C2C2C] hover:bg-[#F5F0E8] rounded-lg"
                title="Opdrachtvolgorde"
              >
                <ListOrdered className="h-4 w-4" />
              </Link>
              <button
                type="button"
                onClick={() => onEdit(team)}
                className="p-2 text-[#6B7280] hover:text-[#2C2C2C] hover:bg-[#F5F0E8] rounded-lg"
              >
                <Edit className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => onDelete(team.id)}
                className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-[#6B7280]">
              <Users className="h-4 w-4" />
              <span>{team._count.players} spelers</span>
            </div>

            {team.captain && (
              <p className="text-sm text-[#6B7280]">
                Kapitein: {team.captain.name}
              </p>
            )}

            <p className="text-sm text-[#6B7280]">
              {team._count.submissions} inzendingen
            </p>

            <div className="pt-2 border-t">
              <p className="text-xs text-[#9CA3AF]">
                Aangemaakt door: {team.createdBy.name}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
