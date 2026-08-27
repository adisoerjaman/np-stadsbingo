import { Download } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import ManageSection from "@/components/admin/dashboard/ManageSection";
import RecentSubmissions from "@/components/admin/dashboard/RecentSubmissions";
import PageHeader from "@/components/admin/ui/PageHeader";
import { prisma } from "@/lib/prisma";

// Server Component: data direct uit de database, geen client-fetch/spinner.
export default async function TeacherDashboard() {
  const submissions = await prisma.submission.findMany({
    where: { status: "PENDING" },
    include: {
      team: { select: { name: true } },
      assignment: { select: { title: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const recentSubmissions = submissions.map((s) => ({
    id: s.id,
    assignment: { title: s.assignment.title },
    team: { name: s.team.name },
    createdAt: s.createdAt.toISOString(),
  }));

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto">
        <PageHeader
          title="Dashboard"
          subtitle="Beheersysteem voor de BitBingo"
        />

        <div className="mb-8">
          <a
            href="/api/admin/export/submissions"
            className="inline-flex items-center gap-2 bg-[#FFE600] text-[#2C2C2C] font-semibold px-5 py-2.5 rounded-xl hover:bg-[#2C2C2C] hover:text-[#FFE600] transition-colors"
          >
            <Download className="w-5 h-5" />
            Exporteer inzendingen (CSV)
          </a>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <RecentSubmissions submissions={recentSubmissions} loading={false} />
          <ManageSection />
        </div>
      </div>
    </AdminLayout>
  );
}
