import { getTeamFromSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const team = await getTeamFromSession();

  if (!team) {
    redirect("/team-login");
  }

  return <>{children}</>;
}
