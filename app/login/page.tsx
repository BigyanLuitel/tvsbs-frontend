"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function LoginPage() {
  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      setError("Invalid email or password");
      return;
    }

    const { role } = await res.json();

    if (role === "ADMIN") {
      router.push("/admin");
    } else if (role === "TEACHER") {
      router.push("/teacher");
    } else if (role === "STUDENT") {
      router.push("/student");
    } else {
      setError("Unknown role — contact an administrator");
    }
  }

  return (
    <div className="flex min-h-screen">
      <div className="hidden w-1/2 flex-col bg-cobalt px-10 py-12 md:flex">
        <div className="flex flex-col items-center gap-3">
          <div className="rounded-full bg-white p-2">
            <Image src="/logo3.png" alt="TVSBS crest" width={72} height={72} />
          </div>
          <h1 className="text-center text-lg font-semibold text-white">
            Tamor Valley Secondary
            <br />
            Boarding School
          </h1>
          <p className="text-sm text-white/70">Dhankuta, Nepal</p>
        </div>

        <div className="relative my-8 flex-1 overflow-hidden rounded-lg">
          <Image
            src="/cover.jpg"
            alt="TVSBS campus"
            fill
            className="object-cover"
          />
        </div>
      </div>

      <div className="fixed bottom-0 left-0 flex h-2 w-1/2">
        <div className="flex-1 bg-coral" />
        <div className="flex-1 bg-cobalt" />
        <div className="flex-1 bg-amber" />
      </div>

      <div className="flex w-1/2 items-center justify-center bg-paper px-6">
        <div className="w-full max-w-sm rounded-lg border border-line bg-white p-8">
          <div className="mb-6 flex items-center gap-3">
            <Image src="/logo3.png" alt="TVSBS crest" width={40} height={40} />
            <div>
              <h2 className="text-lg font-semibold text-navy">Welcome back</h2>
              <p className="text-xs text-navy/60">
                Sign in to access your TVSBS account
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {error && (
              <p className="mb-4 rounded-md bg-coral/10 px-3 py-2 text-sm text-coral">
                {error}
              </p>
            )}

            <label className="mb-1 block text-sm text-navy/70">
              Email address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              className="mb-4 w-full rounded-md border border-line px-3 py-2 text-sm text-navy outline-none transition focus:border-cobalt"
            />

            <div className="mb-1 flex items-center justify-between">
              <label className="block text-sm text-navy/70">Password</label>
              <a href="#" className="text-xs text-cobalt hover:underline">
                Forgot password?
              </a>
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
              className="mb-6 w-full rounded-md border border-line px-3 py-2 text-sm text-navy outline-none transition focus:border-cobalt"
            />

            <button
              type="submit"
              className="w-full rounded-md bg-cobalt py-2.5 text-sm font-medium text-white transition hover:bg-cobalt/90"
            >
              Sign in
            </button>
          </form>

          <div className="mt-6 rounded-md bg-paper px-3 py-2 text-xs text-navy/70">
            <span className="font-medium text-navy">Need help signing in?</span>{" "}
            Contact the school administration if you cannot access your account.
          </div>

          <p className="mt-6 text-center text-xs text-navy/40">
            Tamor Valley Secondary Boarding School
            <br />
            Dhankuta, Nepal
          </p>
        </div>
      </div>
    </div>
  );
}
