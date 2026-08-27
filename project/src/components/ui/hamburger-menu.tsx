"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { X, Home, FileText, Phone } from "lucide-react";
import { cn } from "@/lib/utils";

interface MenuItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  action?: "navigate" | "close";
}

interface HamburgerMenuProps {
  isOpen: boolean;
  onClose: () => void;
  currentPath?: string;
}

const menuItems: MenuItem[] = [
  {
    id: "close",
    label: "Sluiten",
    icon: X,
    href: "#",
    action: "close",
  },
  {
    id: "dashboard",
    label: "Dashboard",
    icon: Home,
    href: "/dashboard",
  },
  {
    id: "exercises",
    label: "Opdrachten",
    icon: FileText,
    href: "/dashboard/exercises",
  },
  {
    id: "contact",
    label: "Contact",
    icon: Phone,
    href: "/dashboard/contact",
  },
];

export function HamburgerMenu({
  isOpen,
  onClose,
  currentPath,
}: HamburgerMenuProps) {
  const router = useRouter();
  const pathname = usePathname();

  // Close menu on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleItemClick = (item: MenuItem) => {
    if (item.action === "close") {
      onClose();
      return;
    }

    // Navigate and close menu
    router.push(item.href);
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Menu sluiten"
        className={cn(
          "fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none",
        )}
        onClick={onClose}
      />

      {/* Menu */}
      <div
        className={cn(
          "fixed top-0 right-0  w-20 bg-[#F5F0E8] z-50 transition-transform duration-300 ease-in-out shadow-lg",
          "flex flex-col items-center py-6 rounded-l-2xl",
          isOpen ? "translate-x-0" : "translate-x-full",
        )}
      >
        {menuItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = pathname === item.href && item.action !== "close";

          return (
            <button
              type="button"
              key={item.id}
              onClick={() => handleItemClick(item)}
              className={cn(
                "w-12 h-12 rounded-lg flex items-center justify-center transition-all duration-200",
                "hover:bg-[#FFE600]/20 active:scale-95",
                "focus:outline-none focus:ring-2 focus:ring-[#FFE600]/50",
                isActive && "bg-[#FFE600]/30",
                index > 0 && "mt-6", // Add spacing between icons except for the first one
              )}
              aria-label={item.label}
            >
              <Icon
                className={cn(
                  "h-6 w-6 text-[#4A5568] transition-colors",
                  "hover:text-[#2C2C2C]",
                  isActive && "text-[#2C2C2C]",
                )}
              />
            </button>
          );
        })}
      </div>
    </>
  );
}

interface HamburgerTriggerProps {
  onClick: () => void;
  className?: string;
}

export function HamburgerTrigger({
  onClick,
  className,
}: HamburgerTriggerProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={className}
      aria-label="Menu openen"
    >
      <svg
        className="h-6 w-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <title>Menu</title>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 6h16M4 12h16M4 18h16"
        />
      </svg>
    </button>
  );
}

// Hook for managing hamburger menu state
export function useHamburgerMenu() {
  const [isOpen, setIsOpen] = useState(false);

  const openMenu = () => setIsOpen(true);
  const closeMenu = () => setIsOpen(false);
  const toggleMenu = () => setIsOpen((prev) => !prev);

  return {
    isOpen,
    openMenu,
    closeMenu,
    toggleMenu,
  };
}
