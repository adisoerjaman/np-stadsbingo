"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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

interface TeamsFormColumnProps {
  showForm: boolean;
  editingTeam: Team | null;
  formData: {
    name: string;
    playerNames: string[];
  };
  setFormData: (data: { name: string; playerNames: string[] }) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export default function TeamsFormColumn({
  showForm,
  editingTeam,
  formData,
  setFormData,
  onSubmit,
}: TeamsFormColumnProps) {
  if (!showForm) return null;

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm sticky top-4">
      <h2 className="text-xl font-bold text-[#2C2C2C] mb-4">
        {editingTeam ? "Team Bewerken" : "Nieuw Team"}
      </h2>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <Label htmlFor="teamName">Team Naam</Label>
          <Input
            id="teamName"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Voer team naam in"
            className="mt-1"
          />
        </div>

        <div>
          <Label>Spelers</Label>
          <div className="space-y-2 mt-1">
            {formData.playerNames.map((name, index) => (
              <Input
                key={index}
                value={name}
                onChange={(e) => {
                  const newNames = [...formData.playerNames];
                  newNames[index] = e.target.value;
                  setFormData({ ...formData, playerNames: newNames });
                }}
                placeholder={`Speler ${index + 1} naam`}
              />
            ))}
          </div>
        </div>

        <Button
          type="submit"
          className="w-full bg-[#FFE600] text-[#2C2C2C] hover:bg-[#2C2C2C] hover:text-[#FFE600]"
        >
          {editingTeam ? "Bijwerken" : "Aanmaken"}
        </Button>
      </form>
    </div>
  );
}
