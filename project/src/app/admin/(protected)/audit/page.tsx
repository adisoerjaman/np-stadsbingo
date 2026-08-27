import AdminLayout from "@/components/admin/AdminLayout";
import PageHeader from "@/components/admin/ui/PageHeader";
import { prisma } from "@/lib/prisma";

const ACTION_LABELS: Record<string, string> = {
  SUBMISSION_APPROVED: "Inzending goedgekeurd",
  SUBMISSION_FEEDBACK: "Feedback gegeven",
  SUBMISSION_PENDING: "Teruggezet naar in behandeling",
  TEAM_CREATED: "Team aangemaakt",
  ASSIGNMENT_CREATED: "Opdracht aangemaakt",
  ASSIGNMENT_DELETED: "Opdracht verwijderd",
};

export default async function AuditPage() {
  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto">
        <PageHeader
          title="Audit log"
          subtitle="Overzicht van uitgevoerde acties"
        />

        {logs.length === 0 ? (
          <p className="text-[#4B5563]">Nog geen acties geregistreerd.</p>
        ) : (
          <div className="overflow-x-auto bg-white rounded-2xl shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[#6B7280] border-b border-gray-200">
                  <th className="px-4 py-3 font-semibold">Tijdstip</th>
                  <th className="px-4 py-3 font-semibold">Actie</th>
                  <th className="px-4 py-3 font-semibold">Door</th>
                  <th className="px-4 py-3 font-semibold">Details</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="border-b border-gray-100">
                    <td className="px-4 py-3 whitespace-nowrap text-[#4B5563]">
                      {new Date(log.createdAt).toLocaleString("nl-NL")}
                    </td>
                    <td className="px-4 py-3 font-medium text-[#2C2C2C]">
                      {ACTION_LABELS[log.action] ?? log.action}
                    </td>
                    <td className="px-4 py-3 text-[#4B5563]">
                      {log.actorName ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-[#4B5563]">
                      {log.detail ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
