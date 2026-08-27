"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface Assignment {
  id: string;
  title: string;
  description: string;
  location: string;
  order: number;
  createdAt: string;
  _count: {
    submissions: number;
    teams: number;
  };
}

interface Team {
  id: string;
  name: string;
  code: string;
}

interface AssignmentsFormColumnProps {
  showForm: boolean;
  editingAssignment: Assignment | null;
  formData: {
    title: string;
    description: string;
    location: string;
    order: string;
    selectedTeams: string[];
  };
  setFormData: (data: {
    title: string;
    description: string;
    location: string;
    order: string;
    selectedTeams: string[];
  }) => void;
  onSubmit: (e: React.FormEvent) => void;
  teams: Team[];
  onTeamToggle: (teamId: string) => void;
}

export default function AssignmentsFormColumn({
  showForm,
  editingAssignment,
  formData,
  setFormData,
  onSubmit,
  teams,
  onTeamToggle,
}: AssignmentsFormColumnProps) {
  if (!showForm) return null;

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm sticky top-4">
      <h2 className="text-xl font-bold text-[#2C2C2C] mb-4">
        {editingAssignment ? "Opdracht Bewerken" : "Nieuwe Opdracht"}
      </h2>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <Label htmlFor="title">Titel</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            placeholder="Voer opdracht titel in"
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="description">Beschrijving</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
              setFormData({ ...formData, description: e.target.value })
            }
            placeholder="Voer opdracht beschrijving in"
            className="mt-1"
            rows={4}
          />
        </div>

        <div>
          <Label htmlFor="location">Locatie</Label>
          <Input
            id="location"
            value={formData.location}
            onChange={(e) =>
              setFormData({ ...formData, location: e.target.value })
            }
            placeholder="Voer locatie in"
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="order">Volgorde</Label>
          <Input
            id="order"
            type="number"
            value={formData.order}
            onChange={(e) =>
              setFormData({ ...formData, order: e.target.value })
            }
            placeholder="Voer volgorde nummer in"
            className="mt-1"
            min="1"
          />
        </div>

        {!editingAssignment && (
          <div>
            <Label>Teams Toewijzen</Label>
            <div className="mt-2 space-y-2 max-h-32 overflow-y-auto border rounded-md p-2">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="all-teams"
                  checked={formData.selectedTeams.length === 0}
                  onChange={() =>
                    setFormData({ ...formData, selectedTeams: [] })
                  }
                  className="rounded"
                />
                <label htmlFor="all-teams" className="text-sm font-medium">
                  Alle teams (standaard)
                </label>
              </div>
              {teams.map((team) => (
                <div key={team.id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={`team-${team.id}`}
                    checked={formData.selectedTeams.includes(team.id)}
                    onChange={() => onTeamToggle(team.id)}
                    className="rounded"
                  />
                  <label htmlFor={`team-${team.id}`} className="text-sm">
                    {team.name} ({team.code})
                  </label>
                </div>
              ))}
            </div>
            <p className="text-xs text-[#6B7280] mt-1">
              Laat leeg om aan alle teams toe te wijzen
            </p>
          </div>
        )}

        <Button
          type="submit"
          className="w-full bg-[#FFE600] text-[#2C2C2C] hover:bg-[#2C2C2C] hover:text-[#FFE600]"
        >
          {editingAssignment ? "Bijwerken" : "Aanmaken"}
        </Button>
      </form>
    </div>
  );
}
