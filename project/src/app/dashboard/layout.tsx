import { getTeamFromSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Toaster } from "react-hot-toast";
import TeamNotificationListener from "@/components/user/TeamNotificationListener";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const team = await getTeamFromSession();

  if (!team) {
    redirect("/team-login");
  }

  return (
    <>
      <Toaster position="top-center" />
      <TeamNotificationListener />
      {children}
    </>
  );
}
