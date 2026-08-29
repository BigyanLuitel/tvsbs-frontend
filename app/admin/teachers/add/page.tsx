// app/admin/teachers/add/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type SubjectOption = { id: number; subject_name: string; subject_code: string };

export default function AddTeacherPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [subjects, setSubjects] = useState<SubjectOption[]>([]);
  const [selectedSubjects, setSelectedSubjects] = useState<number[]>([]);

  const [form, setForm] = useState({
    email: "",
    password: "",
    first_name: "",
    last_name: "",
    qualification: "",
    contact: "",
  });

  useEffect(() => {
    fetch("/api/subjects")
      .then((res) => res.json())
      .then(setSubjects)
      .catch(() => {});
  }, []);

  function updateField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function toggleSubject(id: number) {
    setSelectedSubjects((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    const res = await fetch("/api/teachers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, subjects: selectedSubjects }),
    });

    setSubmitting(false);

    if (!res.ok) {
      const errData = await res.json();
      setError(JSON.stringify(errData));
      return;
    }

    router.push("/admin/teachers");
  }

  const selectedNames = subjects
    .filter((s) => selectedSubjects.includes(s.id))
    .map((s) => s.subject_name);

  return (
    <div>
      <h2 className="mb-6 text-xl font-semibold text-navy">Add Teacher</h2>

      <div className="flex gap-6">
        <form
          onSubmit={handleSubmit}
          className="flex-1 rounded-lg border border-line bg-white p-6"
        >
          {error && (
            <p className="mb-4 rounded-md bg-coral/10 px-3 py-2 text-sm text-coral">
              {error}
            </p>
          )}

          <div className="mb-4 grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm text-navy/70">
                First Name
              </label>
              <input
                value={form.first_name}
                onChange={(e) => updateField("first_name", e.target.value)}
                required
                className="w-full rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-cobalt"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-navy/70">
                Last Name
              </label>
              <input
                value={form.last_name}
                onChange={(e) => updateField("last_name", e.target.value)}
                required
                className="w-full rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-cobalt"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="mb-1 block text-sm text-navy/70">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => updateField("email", e.target.value)}
              required
              className="w-full rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-cobalt"
            />
          </div>

          <div className="mb-4">
            <label className="mb-1 block text-sm text-navy/70">Password</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => updateField("password", e.target.value)}
              required
              className="w-full rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-cobalt"
            />
          </div>

          <div className="mb-4">
            <label className="mb-1 block text-sm text-navy/70">Subjects</label>
            <select
              value=""
              onChange={(e) => {
                const id = Number(e.target.value);
                if (id && !selectedSubjects.includes(id)) {
                  setSelectedSubjects((prev) => [...prev, id]);
                }
              }}
              className="w-full rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-cobalt"
            >
              <option value="">Add a subject...</option>
              {subjects
                .filter((s) => !selectedSubjects.includes(s.id))
                .map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.subject_name}
                  </option>
                ))}
            </select>

            {selectedSubjects.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {subjects
                  .filter((s) => selectedSubjects.includes(s.id))
                  .map((s) => (
                    <span
                      key={s.id}
                      className="flex items-center gap-1 rounded-full bg-cobalt/10 px-3 py-1 text-sm text-cobalt"
                    >
                      {s.subject_name}
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedSubjects((prev) =>
                            prev.filter((id) => id !== s.id),
                          )
                        }
                        className="text-cobalt/60 hover:text-cobalt"
                      >
                        ×
                      </button>
                    </span>
                  ))}
              </div>
            )}
          </div>

          <div className="mb-6 grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm text-navy/70">
                Qualification
              </label>
              <input
                value={form.qualification}
                onChange={(e) => updateField("qualification", e.target.value)}
                placeholder="e.g. M.Ed"
                className="w-full rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-cobalt"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-navy/70">Contact</label>
              <input
                value={form.contact}
                onChange={(e) => updateField("contact", e.target.value)}
                className="w-full rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-cobalt"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="rounded-md bg-cobalt px-4 py-2 text-sm font-medium text-white transition hover:bg-cobalt/90 disabled:opacity-50"
          >
            {submitting ? "Creating..." : "Create Teacher"}
          </button>
        </form>

        <div className="w-72 shrink-0 self-start rounded-lg border border-line bg-white p-6 text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-cobalt/10">
            <span className="text-xl font-medium text-cobalt">
              {form.first_name[0] || "?"}
              {form.last_name[0] || ""}
            </span>
          </div>
          <p className="font-medium text-navy">
            {form.first_name || form.last_name
              ? `${form.first_name} ${form.last_name}`.trim()
              : "New Teacher"}
          </p>
          <p className="mb-4 text-sm text-navy/60">
            {form.email || "email@example.com"}
          </p>

          {selectedNames.length > 0 && (
            <div className="mb-2 flex flex-wrap justify-center gap-1">
              {selectedNames.map((name) => (
                <span
                  key={name}
                  className="inline-block rounded-full bg-amber/10 px-2 py-0.5 text-xs font-medium text-amber"
                >
                  {name}
                </span>
              ))}
            </div>
          )}

          <div className="mt-4 space-y-1 text-left text-xs text-navy/60">
            {form.qualification && <p>Qualification: {form.qualification}</p>}
            {form.contact && <p>Contact: {form.contact}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
