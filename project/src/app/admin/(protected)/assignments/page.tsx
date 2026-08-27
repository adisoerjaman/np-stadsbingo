"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import ActionButtons from "@/components/admin/ui/ActionButtons";
import AdminLayout from "@/components/admin/AdminLayout";
import PageHeader from "@/components/admin/ui/PageHeader";
import AssignmentListColumn from "@/components/admin/assignments/AssignmentListColumn";
import AssignmentFormModal from "@/components/admin/assignments/AssignmentFormModal";
import ConfirmModal from "@/components/shared/ConfirmModal";

interface Assignment {
  id: string;
  title: string;
  description: string;
  location: string;
  latitude?: number | null;
  longitude?: number | null;
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

export default function AssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(
    null,
  );
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [assignmentToDelete, setAssignmentToDelete] = useState<string | null>(
    null,
  );
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    latitude: "",
    longitude: "",
    order: "",
    exampleImage: "",
    selectedTeams: [] as string[],
  });

  useEffect(() => {
    fetchAssignments();
    fetchTeams();
  }, []);

  const fetchAssignments = async () => {
    try {
      const response = await fetch("/api/admin/assignments", {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        setAssignments(data);
      }
    } catch (error) {
      console.error("Error fetching assignments:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeams = async () => {
    try {
      const response = await fetch("/api/admin/teams", {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        setTeams(data);
      }
    } catch (error) {
      console.error("Error fetching teams:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.title.trim() ||
      !formData.description.trim() ||
      !formData.location.trim() ||
      !formData.order.trim()
    ) {
      toast.error("Alle velden zijn verplicht");
      return;
    }

    try {
      const url = editingAssignment
        ? `/api/admin/assignments/${editingAssignment.id}`
        : "/api/admin/assignments";
      const method = editingAssignment ? "PUT" : "POST";

      const requestBody: any = {
        title: formData.title,
        description: formData.description,
        location: formData.location,
        latitude: formData.latitude || null,
        longitude: formData.longitude || null,
        order: parseInt(formData.order),
        exampleImage: formData.exampleImage || null,
      };

      if (!editingAssignment && formData.selectedTeams.length > 0) {
        requestBody.teamIds = formData.selectedTeams;
      }

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        await fetchAssignments();
        resetForm();
      } else {
        const error = await response.json();
        toast.error(error.error || "Er is iets misgegaan");
      }
    } catch (error) {
      console.error("Error saving assignment:", error);
      toast.error("Er is iets misgegaan");
    }
  };

  const handleDelete = async (assignmentId: string) => {
    setAssignmentToDelete(assignmentId);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!assignmentToDelete) return;

    try {
      const response = await fetch(
        `/api/admin/assignments/${assignmentToDelete}`,
        {
          method: "DELETE",
          credentials: "include",
        },
      );

      if (response.ok) {
        await fetchAssignments();
      } else {
        toast.error("Kon opdracht niet verwijderen");
      }
    } catch (error) {
      console.error("Error deleting assignment:", error);
      toast.error("Er is iets misgegaan");
    } finally {
      setAssignmentToDelete(null);
    }
  };

  const startEdit = (assignment: Assignment) => {
    setEditingAssignment(assignment);
    setFormData({
      title: assignment.title,
      description: assignment.description,
      location: assignment.location,
      latitude: assignment.latitude?.toString() ?? "",
      longitude: assignment.longitude?.toString() ?? "",
      order: assignment.order.toString(),
      exampleImage: assignment.exampleImage || "",
      selectedTeams: [],
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingAssignment(null);
    setFormData({
      title: "",
      description: "",
      location: "",
      latitude: "",
      longitude: "",
      order: "",
      exampleImage: "",
      selectedTeams: [],
    });
  };

  const handleTeamToggle = (teamId: string) => {
    setFormData((prev) => ({
      ...prev,
      selectedTeams: prev.selectedTeams.includes(teamId)
        ? prev.selectedTeams.filter((id) => id !== teamId)
        : [...prev.selectedTeams, teamId],
    }));
  };

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto">
        <PageHeader
          title="Opdrachten Beheren"
          subtitle="Maak en beheer opdrachten voor StadsBingo"
        />

        <ActionButtons
          onAdd={() => {
            setShowForm(true);
            setEditingAssignment(null);
            setFormData({
              title: "",
              description: "",
              location: "",
              latitude: "",
              longitude: "",
              order: "",
              exampleImage: "",
              selectedTeams: [],
            });
          }}
          onCancel={resetForm}
          showCancel={false}
          addLabel="Nieuwe Opdracht"
        />

        <AssignmentListColumn
          assignments={assignments}
          loading={loading}
          onEdit={startEdit}
          onDelete={handleDelete}
        />

        <AssignmentFormModal
          showForm={showForm}
          editingAssignment={editingAssignment}
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleSubmit}
          onClose={resetForm}
          teams={teams}
          onTeamToggle={handleTeamToggle}
        />

        <ConfirmModal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setAssignmentToDelete(null);
          }}
          onConfirm={confirmDelete}
          title="Opdracht Verwijderen"
          message="Weet je zeker dat je deze opdracht wilt verwijderen? Deze actie kan niet ongedaan worden gemaakt. Alle gerelateerde inzendingen en team-toewijzingen worden ook verwijderd."
          confirmText="Verwijderen"
          cancelText="Annuleren"
          variant="danger"
        />
      </div>
    </AdminLayout>
  );
}
