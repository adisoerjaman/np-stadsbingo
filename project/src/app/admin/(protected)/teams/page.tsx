"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import ActionButtons from "@/components/admin/ui/ActionButtons";
import AdminLayout from "@/components/admin/AdminLayout";
import PageHeader from "@/components/admin/ui/PageHeader";
import TeamListColumn from "@/components/admin/teams/TeamListColumn";
import TeamFormModal from "@/components/admin/teams/TeamFormModal";
import ConfirmModal from "@/components/shared/ConfirmModal";

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

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    playerNames: ["", "", "", "", ""],
  });
  const [deleteTeamId, setDeleteTeamId] = useState<string | null>(null);

  useEffect(() => {
    fetchTeams();
  }, []);

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
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const playerNames = formData.playerNames.filter(
      (name) => name.trim() !== "",
    );
    if (!formData.name.trim() || playerNames.length === 0) {
      toast.error("Teamnaam en minimaal één speler zijn verplicht");
      return;
    }

    try {
      const url = editingTeam
        ? `/api/admin/teams/${editingTeam.id}`
        : "/api/admin/teams";
      const method = editingTeam ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: formData.name,
          playerNames,
        }),
      });

      if (response.ok) {
        await fetchTeams();
        resetForm();
        toast.success(editingTeam ? "Team bijgewerkt" : "Team aangemaakt");
      } else {
        const error = await response.json();
        toast.error(error.error || "Er ging iets mis");
      }
    } catch (error) {
      console.error("Error saving team:", error);
      toast.error("Er ging iets mis");
    }
  };

  const confirmDelete = async () => {
    if (!deleteTeamId) return;
    try {
      const response = await fetch(`/api/admin/teams/${deleteTeamId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (response.ok) {
        await fetchTeams();
        toast.success("Team verwijderd");
      } else {
        const error = await response.json();
        toast.error(error.error || "Verwijderen mislukt");
      }
    } catch (error) {
      console.error("Error deleting team:", error);
      toast.error("Er ging iets mis");
    } finally {
      setDeleteTeamId(null);
    }
  };

  const startEdit = (team: Team) => {
    setEditingTeam(team);
    setFormData({
      name: team.name,
      playerNames: [
        ...team.players.map((p) => p.name),
        ...Array(Math.max(0, 5 - team.players.length)).fill(""),
      ],
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingTeam(null);
    setFormData({ name: "", playerNames: ["", "", "", "", ""] });
  };

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto">
        <PageHeader
          title="Teams Beheren"
          subtitle="Maak en beheer teams voor StadsBingo"
        />

        <ActionButtons
          onAdd={() => {
            setShowForm(true);
            setEditingTeam(null);
            setFormData({ name: "", playerNames: ["", "", "", "", ""] });
          }}
          onCancel={resetForm}
          showCancel={false}
          addLabel="Nieuw Team"
        />

        <TeamListColumn
          teams={teams}
          loading={loading}
          onEdit={startEdit}
          onDelete={(teamId) => setDeleteTeamId(teamId)}
        />

        <TeamFormModal
          showForm={showForm}
          editingTeam={editingTeam}
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleSubmit}
          onClose={resetForm}
        />

        <ConfirmModal
          isOpen={deleteTeamId !== null}
          onClose={() => setDeleteTeamId(null)}
          onConfirm={confirmDelete}
          title="Team verwijderen"
          message="Weet je zeker dat je dit team wilt verwijderen? Deze actie kan niet ongedaan worden gemaakt."
          confirmText="Verwijderen"
        />
      </div>
    </AdminLayout>
  );
}
