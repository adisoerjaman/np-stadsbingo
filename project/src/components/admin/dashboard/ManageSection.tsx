import Link from "next/link";
import { ChevronRight } from "lucide-react";

export default function ManageSection() {
  return (
    <div>
      <h2 className="text-xl font-semibold text-[#111827] mb-6">Beheren</h2>
      <div className="space-y-4">
        <Link
          href="/admin/teams"
          className="w-full bg-white rounded-2xl border border-[#E5E7EB] px-5 py-4 flex items-center justify-between hover:shadow-md hover:border-[#D1D5DB] transition shadow-sm"
        >
          <span className="font-medium text-[#111827]">Teams Beheren</span>
          <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
            <ChevronRight className="w-4 h-4 text-white" />
          </div>
        </Link>

        <Link
          href="/admin/assignments"
          className="w-full bg-white rounded-2xl border border-[#E5E7EB] px-5 py-4 flex items-center justify-between hover:shadow-md hover:border-[#D1D5DB] transition shadow-sm"
        >
          <span className="font-medium text-[#111827]">Opdrachten Beheren</span>
          <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
            <ChevronRight className="w-4 h-4 text-white" />
          </div>
        </Link>

        <Link
          href="/admin/review"
          className="w-full bg-white rounded-2xl border border-[#E5E7EB] px-5 py-4 flex items-center justify-between hover:shadow-md hover:border-[#D1D5DB] transition shadow-sm"
        >
          <span className="font-medium text-[#111827]">
            Inzendingen Beoordelen
          </span>
          <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
            <ChevronRight className="w-4 h-4 text-white" />
          </div>
        </Link>
      </div>
    </div>
  );
}
