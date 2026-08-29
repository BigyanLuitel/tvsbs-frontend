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

function NavItem({ link }: { link: NavLink }) {
  const pathname = usePathname();
  const isActiveParent =
    link.children?.some((c) => pathname.startsWith(c.href)) ??
    pathname.startsWith(link.href);
  const [open, setOpen] = useState(isActiveParent);

  if (!link.children) {
    return (
      <Link
        href={link.href}
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
  return (
    <div className="flex min-h-screen bg-paper">
      <aside className="flex w-64 flex-col bg-cobalt">
        <div className="flex flex-col items-center gap-3 px-6 py-8">
          <div className="rounded-full bg-white p-1.5">
            <Image src="/logo.png" alt="TVSBS crest" width={56} height={56} />
          </div>
          <span className="text-center text-sm font-semibold text-white">
            {title}
          </span>
        </div>

        <div className="mx-6 border-t border-white/10" />

        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-4 py-6">
          {links.map((link) => (
            <NavItem key={link.href} link={link} />
          ))}
        </nav>

        <div className="border-t border-white/10 p-4">
          <LogoutButton />
        </div>
      </aside>
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
