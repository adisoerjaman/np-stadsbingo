"use client";

import { ArrowDown, ArrowUp, Save } from "lucide-react";
import Link from "next/link";
import { use, useEffect, useState } from "react";
import toast from "react-hot-toast";
import AdminLayout from "@/components/admin/AdminLayout";
import PageHeader from "@/components/admin/ui/PageHeader";

interface OrderItem {
  assignmentId: string;
  title: string;
  order: number;
}

export default function TeamOrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`/api/admin/teams/${id}/order`, { credentials: "include" })
      .then((r) => (r.ok ? r.json() : []))
      .then((data: OrderItem[]) => setItems(data))
      .finally(() => setLoading(false));
  }, [id]);

  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    [next[index], next[target]] = [next[target], next[index]];
    setItems(next);
  };

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/teams/${id}/order`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          assignmentIds: items.map((i) => i.assignmentId),
        }),
      });
      if (!res.ok) throw new Error("Opslaan mislukt");
      toast.success("Volgorde opgeslagen");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Opslaan mislukt");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-2xl mx-auto">
        <Link
          href="/admin/teams"
          className="text-sm text-[#6B7280] hover:underline"
        >
          ← Terug naar teams
        </Link>
        <div className="mt-2">
          <PageHeader
            title="Opdrachtvolgorde"
            subtitle="Bepaal de volgorde van opdrachten voor dit team"
          />
        </div>

        {loading ? (
          <p className="text-[#4B5563]">Laden...</p>
        ) : (
          <>
            <ol className="bg-white rounded-2xl shadow-sm divide-y mb-6">
              {items.map((item, index) => (
                <li
                  key={item.assignmentId}
                  className="flex items-center justify-between px-5 py-4"
                >
                  <span className="text-[#2C2C2C]">
                    <span className="font-bold mr-2">{index + 1}.</span>
                    {item.title}
                  </span>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => move(index, -1)}
                      disabled={index === 0}
                      className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30"
                      aria-label="Omhoog"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => move(index, 1)}
                      disabled={index === items.length - 1}
                      className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30"
                      aria-label="Omlaag"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>
                  </div>
                </li>
              ))}
            </ol>

            <button
              type="button"
              onClick={save}
              disabled={saving}
              className="inline-flex items-center gap-2 bg-[#FFE600] text-[#2C2C2C] font-semibold px-5 py-2.5 rounded-xl hover:bg-[#2C2C2C] hover:text-[#FFE600] transition-colors disabled:opacity-60"
            >
              <Save className="w-5 h-5" />
              Volgorde opslaan
            </button>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
