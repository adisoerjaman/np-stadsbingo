"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export default function AdminLogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/admin-logout", {
        method: "POST",
        credentials: "include",
      });

      router.push("/admin/login");
    } catch (error) {
      console.error("Admin logout failed:", error);
      // Still redirect even if logout API fails
      router.push("/admin/login");
    }
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="flex items-center gap-2 text-[#2C2C2C] hover:opacity-70 transition-opacity"
      aria-label="Uitloggen"
    >
      <LogOut className="h-5 w-5" />
      <span className="text-sm">Uitloggen</span>
    </button>
  );
}
