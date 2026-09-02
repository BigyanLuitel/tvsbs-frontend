// app/components/DashboardLayout.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import LogoutButton from "../components/LogOutButton";

type NavLink = {
  label: string;
  href: string;
  children?: { label: string; href: string }[];
};

function NavItem({
  link,
  onNavigate,
}: {
  link: NavLink;
  onNavigate: () => void;
}) {
  const pathname = usePathname();
  const isActiveParent =
    link.children?.some((c) => pathname.startsWith(c.href)) ??
    pathname.startsWith(link.href);
  const [open, setOpen] = useState(isActiveParent);

  if (!link.children) {
    return (
      <Link
        href={link.href}
        onClick={onNavigate}
        className="rounded-md px-3 py-2 text-sm text-white/80 transition hover:bg-white/10 hover:text-white"
      >
        {link.label}
      </Link>
    );
  }

  return (
    <div>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center justify-between rounded-md px-3 py-2 text-sm text-white/80 transition hover:bg-white/10 hover:text-white"
      >
        {link.label}
        <span
          className={`text-xs transition-transform ${open ? "rotate-180" : ""}`}
        >
          ▾
        </span>
      </button>
      {open && (
        <div className="ml-3 mt-1 flex flex-col gap-1 border-l border-white/10 pl-3">
          {link.children.map((child) => (
            <Link
              key={child.href}
              href={child.href}
              onClick={onNavigate}
              className="rounded-md px-3 py-1.5 text-sm text-white/70 transition hover:bg-white/10 hover:text-white"
            >
              {child.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default function DashboardLayout({
  title,
  links,
  children,
}: {
  title: string;
  links: NavLink[];
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-paper">
      {/* Mobile top bar */}
      <div className="fixed inset-x-0 top-0 z-30 flex h-14 items-center justify-between bg-cobalt px-4 md:hidden">
        <div className="flex items-center gap-2">
          <Image
            src="/logo3.png"
            alt="TVSBS crest"
            width={28}
            height={28}
            className="rounded-full bg-white p-0.5"
          />
          <span className="text-sm font-semibold text-white">{title}</span>
        </div>
        <button
          onClick={() => setMobileOpen(true)}
          className="flex h-9 w-9 items-center justify-center rounded-md text-white hover:bg-white/10"
          aria-label="Open menu"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path
              d="M3 5h14M3 10h14M3 15h14"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-navy/40 backdrop-blur-sm md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-cobalt transition-transform md:sticky md:top-0 md:h-screen md:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col items-center gap-3 px-6 py-8">
          <div className="rounded-full bg-white p-1.5">
            <Image src="/logo3.png" alt="TVSBS crest" width={56} height={56} />
          </div>
          <span className="text-center text-sm font-semibold text-white">
            {title}
          </span>
        </div>

        <div className="mx-6 border-t border-white/10" />

        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-4 py-6">
          {links.map((link) => (
            <NavItem
              key={link.href}
              link={link}
              onNavigate={() => setMobileOpen(false)}
            />
          ))}
        </nav>

        <div className="border-t border-white/10 p-4">
          <LogoutButton />
        </div>
      </aside>

      <main className="min-w-0 flex-1 p-4 pt-20 md:p-8 md:pt-8">
        {children}
      </main>
    </div>
  );
}
