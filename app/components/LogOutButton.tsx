// app/components/LogoutButton.tsx
"use client";

import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <button
      onClick={handleLogout}
      className="w-full rounded-md bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/20"
    >
      Log Out
    </button>
  );
}
