"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Lock, User } from "lucide-react";
import Image from "next/image";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError("");

      if (!email.trim() || !password.trim()) {
        setError("Vul email en wachtwoord in");
        return;
      }

      setLoading(true);

      try {
        const res = await fetch("/api/auth/admin-login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
          credentials: "include",
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data?.error || "Er ging iets mis");
          return;
        }

        router.push("/admin");
      } catch (error) {
        setError("Er ging iets mis");
      } finally {
        setLoading(false);
      }
    },
    [email, password, router],
  );

  return (
    <main className="min-h-screen w-full bg-[#EDE6DC] flex flex-col items-center justify-center px-6 py-10">
      <div className="w-full max-w-xs mb-20 mt-8 md:absolute md:top-6 md:left-6">
        <Image src="/logo.png" alt="NexEd" width={128} height={128} />
      </div>

      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-[#2C2C2C]">Admin Login</h1>
        <p className="text-lg text-[#2C2C2C] mt-1">StadsBingo Beheer</p>
      </div>

      <form onSubmit={handleSubmit} className="w-full max-w-xs space-y-4">
        <div className="space-y-1">
          <Label htmlFor="email" className="sr-only">
            Email
          </Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#2C2C2C]" />
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="Email adres"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10 bg-white/60 border-none text-[#2C2C2C] placeholder-[#2C2C2C]"
            />
          </div>
        </div>

        <div className="space-y-1">
          <Label htmlFor="password" className="sr-only">
            Wachtwoord
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#2C2C2C]" />
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="Wachtwoord"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10 bg-white/60 border-none text-[#2C2C2C] placeholder-[#2C2C2C]"
            />
          </div>
        </div>

        {error && <p className="text-red-600 text-sm font-semibold">{error}</p>}

        <Button
          type="submit"
          className="w-full bg-[#FFE600] text-[#2C2C2C] font-semibold hover:bg-[#2C2C2C] hover:text-[#FFE600]"
          disabled={loading}
        >
          {loading ? "Even wachten..." : "Inloggen →"}
        </Button>
      </form>

      <div className="mt-8 text-center">
        <p className="text-sm text-[#2C2C2C]/70">
          Test inlog: admin@example.com / admin123
        </p>
      </div>
    </main>
  );
}
