"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface Submission {
  id: string;
  assignment: { title: string };
  team: { name: string };
  createdAt: string;
}

interface RecentSubmissionsProps {
  submissions: Submission[];
  loading: boolean;
}

export default function RecentSubmissions({
  submissions: initialSubmissions,
  loading: initialLoading,
}: RecentSubmissionsProps) {
  const [submissions, setSubmissions] = useState<Submission[]>(initialSubmissions);
  const [loading, setLoading] = useState(initialLoading);

  useEffect(() => {
    const fetchRecentSubmissions = async () => {
      try {
        const response = await fetch("/api/admin/submissions?status=PENDING", {
          credentials: "include",
        });
        if (response.ok) {
          const data = await response.json();
          setSubmissions(data);
        }
      } catch (error) {
        console.error("Error polling recent submissions:", error);
      } finally {
        setLoading(false);
      }
    };

    // Poll every 10 seconds to keep the dashboard live
    const interval = setInterval(fetchRecentSubmissions, 10000);
    return () => clearInterval(interval);
  }, []);

  // Sync state if initial prop changes (e.g. on server-side revalidation)
  useEffect(() => {
    setSubmissions(initialSubmissions);
  }, [initialSubmissions]);
  return (
    <div>
      <h2 className="text-xl font-semibold text-[#111827] mb-6">
        Ingeleverde opdrachten
      </h2>
      <div className="space-y-4">
        {loading ? (
          <div className="bg-white rounded-2xl border border-[#E5E7EB] px-5 py-4 text-center">
            <p className="text-[#6B7280]">Inzendingen laden...</p>
          </div>
        ) : submissions.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#E5E7EB] px-5 py-4 text-center">
            <p className="text-[#6B7280]">Geen recente inzendingen</p>
          </div>
        ) : (
          submissions.slice(0, 4).map((submission) => (
            <div
              key={submission.id}
              className="bg-white rounded-2xl border border-[#E5E7EB] px-5 py-4 flex items-center justify-between shadow-sm hover:shadow-md hover:border-[#D1D5DB] transition group"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-semibold text-[#111827]">
                    {submission.assignment.title} - {submission.team.name}
                  </h3>
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-current">
                    Review
                  </span>
                </div>
                <p className="text-sm text-[#6B7280]">
                  Ingeleverd:{" "}
                  {new Date(submission.createdAt).toLocaleTimeString("nl-NL")}
                </p>
              </div>
              <Link href="/admin/review" className="ml-4">
                <div className="w-8 h-8 bg-[#111827] rounded-full flex items-center justify-center transition group-hover:bg-black group-hover:scale-105">
                  <ChevronRight className="w-4 h-4 text-white" />
                </div>
              </Link>
            </div>
          ))
        )}

        <div className="mt-6">
          <Link href={"/admin/review"}>
            <button
              type="button"
              className="text-sm text-[#4B5563] hover:text-[#111827]"
            >
              Alle ingeleverde opdrachten →
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
