"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";

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

interface TeamFormModalProps {
  showForm: boolean;
  editingTeam: Team | null;
  formData: {
    name: string;
    playerNames: string[];
  };
  setFormData: (data: { name: string; playerNames: string[] }) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
}

export default function TeamFormModal({
  showForm,
  editingTeam,
  formData,
  setFormData,
  onSubmit,
  onClose,
}: TeamFormModalProps) {
  if (!showForm) return null;

  const handleAddPlayer = () => {
    setFormData({
      ...formData,
      playerNames: [...formData.playerNames, ""],
    });
  };

  const handleRemovePlayer = (index: number) => {
    if (formData.playerNames.length > 1) {
      const newNames = formData.playerNames.filter((_, i) => i !== index);
      setFormData({ ...formData, playerNames: newNames });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-[#2C2C2C]">
            {editingTeam ? "Team Bewerken" : "Nieuw Team Aanmaken"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={onSubmit} className="p-6">
          <div className="space-y-6">
            {/* Team Name */}
            <div>
              <Label htmlFor="teamName" className="text-base font-semibold">
                Team Naam *
              </Label>
              <Input
                id="teamName"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Voer een unieke team naam in"
                className="mt-2 h-12 text-base"
                required
              />
            </div>

            {/* Players Section */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <Label className="text-base font-semibold">
                  Spelers (
                  {formData.playerNames.filter((name) => name.trim()).length})
                </Label>
                <Button
                  type="button"
                  onClick={handleAddPlayer}
                  variant="outline"
                  size="sm"
                  className="text-sm"
                >
                  + Speler Toevoegen
                </Button>
              </div>

              <div className="space-y-3">
                {formData.playerNames.map((name, index) => (
                  <div key={index} className="flex gap-3 items-center">
                    <div className="flex-1">
                      <Input
                        value={name}
                        onChange={(e) => {
                          const newNames = [...formData.playerNames];
                          newNames[index] = e.target.value;
                          setFormData({ ...formData, playerNames: newNames });
                        }}
                        placeholder={`Speler ${index + 1} naam`}
                        className="h-11"
                      />
                    </div>
                    {formData.playerNames.length > 1 && (
                      <Button
                        type="button"
                        onClick={() => handleRemovePlayer(index)}
                        variant="outline"
                        size="sm"
                        className="px-3 text-red-600 hover:bg-red-50 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              <p className="text-sm text-gray-600 mt-2">
                Voeg minimaal 1 speler toe. Je kunt later meer spelers
                toevoegen.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-8 pt-6 border-t border-gray-200">
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              className="flex-1 h-12"
            >
              Annuleren
            </Button>
            <Button
              type="submit"
              className="flex-1 h-12 bg-[#FFE600] text-[#2C2C2C] hover:bg-[#2C2C2C] hover:text-[#FFE600] font-semibold"
            >
              {editingTeam ? "Team Bijwerken" : "Team Aanmaken"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
