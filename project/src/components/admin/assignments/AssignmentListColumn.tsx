"use client";

import { Trash2, Edit, BookOpen, Image as ImageIcon } from "lucide-react";
import Image from "next/image";
import { SkeletonCardGrid } from "@/components/ui/skeleton";

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

interface AssignmentListColumnProps {
  assignments: Assignment[];
  loading: boolean;
  onEdit: (assignment: Assignment) => void;
  onDelete: (assignmentId: string) => void;
}

export default function AssignmentListColumn({
  assignments,
  loading,
  onEdit,
  onDelete,
}: AssignmentListColumnProps) {
  if (loading) {
    return <SkeletonCardGrid />;
  }

  if (assignments.length === 0) {
    return (
      <div className="bg-[#F5F0E8] rounded-2xl p-6 text-center">
        <BookOpen className="h-12 w-12 text-[#2C2C2C] mx-auto mb-4" />
        <p className="text-[#2C2C2C]">Geen opdrachten gevonden</p>
        <p className="text-[#6B7280] text-sm mt-2">
          Klik op "Nieuwe Opdracht" om je eerste opdracht aan te maken
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {assignments.map((assignment) => (
        <div key={assignment.id} className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-start justify-between mb-3">
            <div className="flex gap-4 flex-1">
              {/* Example Image Thumbnail */}
              {assignment.exampleImage && (
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
                    <Image
                      src={assignment.exampleImage}
                      alt="Example"
                      width={64}
                      height={64}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}

              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-bold text-[#2C2C2C]">
                    {assignment.title}
                  </h3>
                  <span className="px-2 py-1 bg-[#FFE600] text-[#2C2C2C] text-xs font-medium rounded-full">
                    #{assignment.order}
                  </span>
                  {assignment.exampleImage && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full flex items-center gap-1">
                      <ImageIcon className="h-3 w-3" />
                      Voorbeeld
                    </span>
                  )}
                </div>
                <p className="text-sm text-[#6B7280] mb-2">
                  {assignment.description}
                </p>
                <p className="text-sm text-[#6B7280]">
                  <strong>Locatie:</strong> {assignment.location}
                </p>
              </div>
            </div>
            <div className="flex gap-1 ml-4">
              <button
                type="button"
                onClick={() => onEdit(assignment)}
                className="p-2 text-[#6B7280] hover:text-[#2C2C2C] hover:bg-[#F5F0E8] rounded-lg"
              >
                <Edit className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => onDelete(assignment.id)}
                className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm text-[#6B7280] pt-2 border-t">
            <span>{assignment._count.teams} teams toegewezen</span>
            <span>{assignment._count.submissions} inzendingen</span>
            <span className="text-xs">
              Aangemaakt:{" "}
              {new Date(assignment.createdAt).toLocaleDateString("nl-NL")}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
