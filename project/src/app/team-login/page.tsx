"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Lock } from "lucide-react";
import Image from "next/image";

export default function LoginPage() {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError("");

      if (!code.trim()) {
        setError("Vul een teamcode in");
        return;
      }

      setLoading(true);

      let data;
      const res = await fetch("/api/auth/team-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });

      try {
        data = await res.json();
      } catch {
        setLoading(false);
        setError("Er ging iets mis");
        return;
      }

      if (!res.ok) {
        setLoading(false);
        setError(data?.error || "Er ging iets mis");
        return;
      }

      // Cookie is set by the API, just redirect
      router.push("/dashboard");
    },
    [code, router],
  );

  return (
    <main className="min-h-screen w-full bg-[#EDE6DC] flex flex-col items-center justify-center px-6 py-10 relative">
      <div className="absolute top-6 left-6">
        <Image src="/logo.png" alt="NexEd" width={128} height={128} />
      </div>

      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-[#2C2C2C]">Bit Bingo</h1>
        <p className="text-lg text-[#2C2C2C] mt-1">Ontgrendel Groningen</p>
      </div>

      <form onSubmit={handleSubmit} className="w-full max-w-xs space-y-4">
        <div className="space-y-1">
          <Label htmlFor="teamcode" className="sr-only">
            Teamcode
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#2C2C2C]" />
            <Input
              id="teamcode"
              type="text"
              autoComplete="off"
              placeholder="Voer teamcode in"
              value={code}
              onChange={(e) => setCode(e.target.value)}
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
          {loading ? "Even wachten..." : "Log in →"}
        </Button>
      </form>
    </main>
  );
}
