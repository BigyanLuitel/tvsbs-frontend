import Link from "next/link";
import Image from "next/image";
import LogoutButton from "../components/LogOutButton";

type NavLink = { label: string; href: string };

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
            <Image src="/logo3.png" alt="TVSBS crest" width={56} height={56} />
          </div>
          <span className="text-center text-sm font-semibold text-white">
            {title}
          </span>
        </div>

        <div className="flex h-1.5 w-full">
          <div className="flex-1 bg-coral" />
          <div className="flex-1 bg-white/20" />
          <div className="flex-1 bg-amber" />
        </div>

        <nav className="flex flex-1 flex-col gap-1 px-4 py-6">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-md px-3 py-2 text-sm text-white/80 transition hover:bg-white/10 hover:text-white"
            >
              {link.label}
            </Link>
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
