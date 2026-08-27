"use client";

import { KeyRound, Trash2, UserPlus } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import AdminLayout from "@/components/admin/AdminLayout";
import PageHeader from "@/components/admin/ui/PageHeader";
import ConfirmModal from "@/components/shared/ConfirmModal";
import PromptModal from "@/components/shared/PromptModal";
import { Skeleton } from "@/components/ui/skeleton";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  isSuperAdmin: boolean;
  createdAt: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [noAccess, setNoAccess] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    isSuperAdmin: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [passwordUser, setPasswordUser] = useState<AdminUser | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null);

  const load = async () => {
    try {
      const res = await fetch("/api/admin/users", { credentials: "include" });
      if (res.status === 403) {
        setNoAccess(true);
        return;
      }
      if (res.ok) setUsers(await res.json());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const createUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Aanmaken mislukt");
      toast.success("Account aangemaakt");
      setForm({ name: "", email: "", password: "", isSuperAdmin: false });
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Aanmaken mislukt");
    } finally {
      setSubmitting(false);
    }
  };

  const submitPassword = async (password: string) => {
    if (!passwordUser) return;
    const res = await fetch(`/api/admin/users/${passwordUser.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ password }),
    });
    const data = await res.json();
    if (res.ok) toast.success("Wachtwoord gewijzigd");
    else toast.error(data.error || "Wijzigen mislukt");
    setPasswordUser(null);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const res = await fetch(`/api/admin/users/${deleteTarget.id}`, {
      method: "DELETE",
      credentials: "include",
    });
    const data = await res.json();
    if (res.ok) {
      toast.success("Account verwijderd");
      load();
    } else {
      toast.error(data.error || "Verwijderen mislukt");
    }
    setDeleteTarget(null);
  };

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto">
        <PageHeader title="Gebruikersbeheer" subtitle="Beheer docentaccounts" />

        {noAccess ? (
          <div className="bg-white rounded-2xl shadow-sm p-6 text-[#4B5563]">
            Je hebt geen toegang tot gebruikersbeheer. Alleen een{" "}
            <strong>superadmin</strong> kan accounts beheren.
          </div>
        ) : (
          <>
        <form
          onSubmit={createUser}
          className="bg-white rounded-2xl shadow-sm p-6 mb-8 grid gap-4 sm:grid-cols-3"
        >
          <input
            required
            placeholder="Naam"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="border rounded-lg px-3 py-2"
          />
          <input
            required
            type="email"
            placeholder="E-mail"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="border rounded-lg px-3 py-2"
          />
          <input
            required
            type="password"
            placeholder="Wachtwoord (min. 8)"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="border rounded-lg px-3 py-2"
          />
          <label className="sm:col-span-3 flex items-center gap-2 text-sm text-[#4B5563]">
            <input
              type="checkbox"
              checked={form.isSuperAdmin}
              onChange={(e) =>
                setForm({ ...form, isSuperAdmin: e.target.checked })
              }
              className="rounded"
            />
            Superadmin (mag ook gebruikers beheren)
          </label>
          <button
            type="submit"
            disabled={submitting}
            className="sm:col-span-3 inline-flex items-center justify-center gap-2 bg-[#FFE600] text-[#2C2C2C] font-semibold px-5 py-2.5 rounded-xl hover:bg-[#2C2C2C] hover:text-[#FFE600] transition-colors disabled:opacity-60"
          >
            <UserPlus className="w-5 h-5" />
            Docentaccount toevoegen
          </button>
        </form>

        {loading ? (
          <div className="bg-white rounded-2xl shadow-sm divide-y">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                // biome-ignore lint/suspicious/noArrayIndexKey: statische placeholders
                key={i}
                className="flex items-center justify-between px-5 py-4"
              >
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-44" />
                </div>
                <Skeleton className="h-8 w-40" />
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm divide-y">
            {users.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between px-5 py-4"
              >
                <div>
                  <p className="font-semibold text-[#2C2C2C] flex items-center gap-2">
                    {user.name}
                    {user.isSuperAdmin && (
                      <span className="text-xs font-semibold bg-[#FFE600] text-[#2C2C2C] px-2 py-0.5 rounded-full">
                        Superadmin
                      </span>
                    )}
                  </p>
                  <p className="text-sm text-[#6B7280]">{user.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPasswordUser(user)}
                    className="inline-flex items-center gap-1 text-sm px-3 py-2 rounded-lg hover:bg-gray-100"
                  >
                    <KeyRound className="w-4 h-4" /> Wachtwoord
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(user)}
                    className="inline-flex items-center gap-1 text-sm px-3 py-2 rounded-lg text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" /> Verwijderen
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
          </>
        )}

        <PromptModal
          isOpen={passwordUser !== null}
          title={`Nieuw wachtwoord voor ${passwordUser?.name ?? ""}`}
          label="Nieuw wachtwoord (min. 8 tekens)"
          inputType="password"
          placeholder="••••••••"
          confirmText="Wachtwoord wijzigen"
          onClose={() => setPasswordUser(null)}
          onSubmit={submitPassword}
        />

        <ConfirmModal
          isOpen={deleteTarget !== null}
          onClose={() => setDeleteTarget(null)}
          onConfirm={confirmDelete}
          title="Account verwijderen"
          message={`Weet je zeker dat je het account van ${deleteTarget?.name ?? ""} wilt verwijderen?`}
          confirmText="Verwijderen"
        />
      </div>
    </AdminLayout>
  );
}
