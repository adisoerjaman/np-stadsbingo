"use client";

import Image from "next/image";
import Link from "next/link";
import { User, Phone, Mail } from "lucide-react";
import {
  HamburgerMenu,
  HamburgerTrigger,
  useHamburgerMenu,
} from "@/components/ui/hamburger-menu";

interface Mentor {
  name: string;
  role: string;
  email: string;
  phone: string;
}

const mentors: Mentor[] = [
  {
    name: "Reygan Leito",
    role: "Mentor 24SDB",
    email: "ra.leito@noorderpoort.nl",
    phone: "+31882308178",
  },
  {
    name: "Adi Soerjaman",
    role: "Mentor 23SDB",
    email: "adi.soerjaman@noorderpoort.nl",
    phone: "+31882308179",
  },
  {
    name: "Jesper Bekking",
    role: "Mentor 24SDG",
    email: "jesper.bekking@noorderpoort.nl",
    phone: "+31882308180",
  },
];

export default function ContactContent() {
  const { isOpen, openMenu, closeMenu } = useHamburgerMenu();

  return (
    <main className="min-h-screen bg-[#EDE6DC] pb-8">
      {/* Hamburger Menu */}
      <HamburgerMenu isOpen={isOpen} onClose={closeMenu} />

      {/* Header */}
      <header className="flex items-center justify-between px-4 py-4 md:px-6">
        <div className="w-full max-w-xs mb-6 mt-8 md:absolute">
          <Link href={"/dashboard"}>
            <Image src="/logo.png" alt="NexEd" width={128} height={128} />
          </Link>
        </div>
        <HamburgerTrigger onClick={openMenu} className="md:hidden" />
      </header>

      <div className="px-4 md:px-6 md:max-w-2xl md:mx-auto">
        {/* Contact Information Box */}
        <div className="bg-[#FFE600] rounded-2xl p-6 mb-6">
          <h1 className="text-2xl font-bold text-[#2C2C2C] mb-3">Contact</h1>
          <p className="text-base text-[#2C2C2C] leading-relaxed">
            Mocht je er niet uit komen en er is geen docent in de buurt, neem
            contact op met jou mentor.
          </p>
        </div>

        {/* Docenten Section */}
        <h2 className="text-2xl font-bold text-[#2C2C2C] mb-4">Docenten</h2>

        {/* Mentor Cards */}
        <div className="space-y-4">
          {mentors.map((mentor, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-5 shadow-sm flex items-start gap-4"
            >
              {/* Icon */}
              <div className="bg-[#FFE600] rounded-lg p-3 flex-shrink-0">
                <User className="h-6 w-6 text-[#2C2C2C]" />
              </div>

              {/* Contact Details */}
              <div className="flex-1">
                <h3 className="text-lg font-bold text-[#2C2C2C] mb-1">
                  {mentor.name}
                </h3>
                <p className="text-sm text-[#2C2C2C]/70 mb-3">{mentor.role}</p>

                {/* Contact Information */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-[#2C2C2C]" />
                    <a
                      href={`mailto:${mentor.email}`}
                      className="text-sm text-[#2C2C2C] underline"
                    >
                      {mentor.email}
                    </a>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-[#2C2C2C]" />
                    <a
                      href={`tel:${mentor.phone}`}
                      className="text-sm text-[#2C2C2C] underline"
                    >
                      {mentor.phone}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
