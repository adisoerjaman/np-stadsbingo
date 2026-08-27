import { redirect } from "next/navigation";
import DashboardContent from "@/components/user/dashboard/DashboardContent";
import { getTeamFromSession } from "@/lib/auth";

export default async function Dashboard() {
  const team = await getTeamFromSession();
  if (!team) redirect("/team-login");

  return <DashboardContent team={team} />;
}
