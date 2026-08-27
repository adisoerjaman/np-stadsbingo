import Link from "next/link";
import Image from "next/image";
import { Toaster } from "react-hot-toast";
import AdminLogoutButton from "@/components/admin/AdminLogoutButton";
import AdminSidebar from "@/components/admin/AdminSidebar";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <main className="min-h-screen bg-[#EDE6DC] flex relative pb-10 items-stretch">
      <Toaster position="top-center" />
      {/* Logo */}
      <div className="w-full max-w-xs mb-6 mt-8 md:absolute md:top-6 md:left-6 z-10">
        <Link href="/admin">
          <Image src="/logo.png" alt="NexEd" width={128} height={128} />
        </Link>
      </div>

      {/* Logout Button */}
      <div className="absolute top-6 right-6 z-10">
        <AdminLogoutButton />
      </div>

      {/* Left Sidebar */}
      <AdminSidebar />

      {/* Main Content */}
      <section className="flex-1 px-6 pt-32 md:pt-26 md:px-16">
        {children}
      </section>
    </main>
  );
}
