"use client";

import { Image as ImageIcon, X } from "lucide-react";
import Image from "next/image";
import { useRef } from "react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { resizeImage, uploadImageWithProgress } from "@/lib/imageUpload";

interface Assignment {
  id: string;
  title: string;
  description: string;
  location: string;
  order: number;
  exampleImage?: string | null;
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

interface AssignmentFormModalProps {
  showForm: boolean;
  editingAssignment: Assignment | null;
  formData: {
    title: string;
    description: string;
    location: string;
    latitude: string;
    longitude: string;
    order: string;
    exampleImage: string;
    selectedTeams: string[];
  };
  setFormData: (data: {
    title: string;
    description: string;
    location: string;
    latitude: string;
    longitude: string;
    order: string;
    exampleImage: string;
    selectedTeams: string[];
  }) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
  teams: Team[];
  onTeamToggle: (teamId: string) => void;
}

export default function AssignmentFormModal({
  showForm,
  editingAssignment,
  formData,
  setFormData,
  onSubmit,
  onClose,
  teams,
  onTeamToggle,
}: AssignmentFormModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const resized = await resizeImage(file);
      const { url } = await uploadImageWithProgress(resized);
      setFormData({ ...formData, exampleImage: url });
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(error instanceof Error ? error.message : "Uploaden mislukt");
    }
  };

  const handleRemoveImage = () => {
    setFormData({ ...formData, exampleImage: "" });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  if (!showForm) return null;

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-[#2C2C2C]">
            {editingAssignment
              ? "Opdracht Bewerken"
              : "Nieuwe Opdracht Aanmaken"}
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Basic Info */}
            <div className="space-y-6">
              {/* Title */}
              <div>
                <Label htmlFor="title" className="text-base font-semibold">
                  Opdracht Titel *
                </Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="Voer een duidelijke titel in"
                  className="mt-2 h-12 text-base"
                  required
                />
              </div>

              {/* Location */}
              <div>
                <Label htmlFor="location" className="text-base font-semibold">
                  Locatie *
                </Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  placeholder="Waar moet deze opdracht uitgevoerd worden?"
                  className="mt-2 h-12 text-base"
                  required
                />
              </div>

              {/* Coördinaten (optioneel) */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="latitude" className="text-base font-semibold">
                    Breedtegraad
                  </Label>
                  <Input
                    id="latitude"
                    type="number"
                    step="any"
                    value={formData.latitude}
                    onChange={(e) =>
                      setFormData({ ...formData, latitude: e.target.value })
                    }
                    placeholder="bijv. 53.2194"
                    className="mt-2 h-12 text-base"
                  />
                </div>
                <div>
                  <Label
                    htmlFor="longitude"
                    className="text-base font-semibold"
                  >
                    Lengtegraad
                  </Label>
                  <Input
                    id="longitude"
                    type="number"
                    step="any"
                    value={formData.longitude}
                    onChange={(e) =>
                      setFormData({ ...formData, longitude: e.target.value })
                    }
                    placeholder="bijv. 6.5665"
                    className="mt-2 h-12 text-base"
                  />
                </div>
              </div>

              {/* Order */}
              <div>
                <Label htmlFor="order" className="text-base font-semibold">
                  Volgorde Nummer *
                </Label>
                <Input
                  id="order"
                  type="number"
                  value={formData.order}
                  onChange={(e) =>
                    setFormData({ ...formData, order: e.target.value })
                  }
                  placeholder="1, 2, 3..."
                  className="mt-2 h-12 text-base"
                  min="1"
                  required
                />
                <p className="text-sm text-gray-600 mt-1">
                  Bepaalt in welke volgorde opdrachten worden getoond
                </p>
              </div>

              {/* Example Image */}
              <div>
                <Label className="text-base font-semibold">
                  Voorbeeld Afbeelding
                </Label>
                <div className="mt-2">
                  {formData.exampleImage ? (
                    <div className="relative">
                      <div className="w-full h-32 rounded-lg overflow-hidden bg-gray-100">
                        <Image
                          src={formData.exampleImage}
                          alt="Example"
                          width={200}
                          height={128}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        aria-label="Voorbeeldfoto verwijderen"
                        className="absolute top-2 right-2 bg-[#2C2C2C] text-white rounded-full p-1.5 hover:bg-red-600 transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-gray-400 transition-colors"
                    >
                      <div className="text-center">
                        <ImageIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">
                          Klik om afbeelding te uploaden
                        </p>
                      </div>
                    </button>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  Optioneel: Upload een voorbeeld afbeelding ter inspiratie
                </p>
              </div>
            </div>

            {/* Right Column - Description & Teams */}
            <div className="space-y-6">
              {/* Description */}
              <div>
                <Label
                  htmlFor="description"
                  className="text-base font-semibold"
                >
                  Beschrijving *
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Beschrijf wat teams moeten doen voor deze opdracht..."
                  className="mt-2 text-base min-h-[120px]"
                  rows={5}
                  required
                />
              </div>

              {/* Team Assignment - Only for new assignments */}
              {!editingAssignment && (
                <div>
                  <Label className="text-base font-semibold">
                    Teams Toewijzen
                  </Label>
                  <div className="mt-3 p-4 border rounded-lg bg-gray-50 max-h-48 overflow-y-auto">
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          id="all-teams"
                          checked={formData.selectedTeams.length === 0}
                          onChange={() =>
                            setFormData({ ...formData, selectedTeams: [] })
                          }
                          className="w-4 h-4 text-[#FFE600] bg-gray-100 border-gray-300 rounded focus:ring-[#FFE600] focus:ring-2"
                        />
                        <label
                          htmlFor="all-teams"
                          className="text-sm font-medium text-gray-900"
                        >
                          Alle teams (aanbevolen)
                        </label>
                      </div>

                      <div className="border-t pt-3">
                        <p className="text-xs text-gray-600 mb-2">
                          Of selecteer specifieke teams:
                        </p>
                        {teams.map((team) => (
                          <div
                            key={team.id}
                            className="flex items-center space-x-3 py-1"
                          >
                            <input
                              type="checkbox"
                              id={`team-${team.id}`}
                              checked={formData.selectedTeams.includes(team.id)}
                              onChange={() => onTeamToggle(team.id)}
                              className="w-4 h-4 text-[#FFE600] bg-gray-100 border-gray-300 rounded focus:ring-[#FFE600] focus:ring-2"
                            />
                            <label
                              htmlFor={`team-${team.id}`}
                              className="text-sm text-gray-700"
                            >
                              {team.name}{" "}
                              <span className="text-gray-500">
                                ({team.code})
                              </span>
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 mt-2">
                    💡 Tip: Laat leeg om automatisch aan alle teams toe te
                    wijzen
                  </p>
                </div>
              )}
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
              {editingAssignment ? "Opdracht Bijwerken" : "Opdracht Aanmaken"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
