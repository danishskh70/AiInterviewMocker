// DESIGN SYSTEM APPLIED
"use client";
import { UserButtonWrapper } from "./UserButtonWrapper";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

const Header = () => {
  const path = usePathname();

  const navLinks = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/dashboard/questions", label: "Questions" },
    { href: "/dashboard/analytics", label: "Analytics" },
    { href: "/dashboard/upgrade", label: "Upgrade" },
    { href: "/dashboard/how-it-works", label: "How it Works" },
  ];

  return (
    <header className="bg-white border-b border-zinc-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Image src="/logo.svg" width={120} height={40} alt="AI Interview Mocker" />

        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                path === href
                  ? "text-zinc-900 bg-zinc-100"
                  : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50"
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>

        <UserButtonWrapper />
      </div>
    </header>
  );
};

export default Header;
