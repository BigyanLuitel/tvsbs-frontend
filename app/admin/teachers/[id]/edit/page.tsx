// app/admin/teachers/[id]/edit/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

type SubjectOption = { id: number; subject_name: string; subject_code: string };

export default function EditTeacherPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [subjects, setSubjects] = useState<SubjectOption[]>([]);
  const [selectedSubjects, setSelectedSubjects] = useState<number[]>([]);

  const [form, setForm] = useState({
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

    fetch(`/api/teachers/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setForm({
          first_name: data.first_name,
          last_name: data.last_name,
          qualification: data.qualification || "",
          contact: data.contact || "",
        });
        setSelectedSubjects(data.subjects || []);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load teacher");
        setLoading(false);
      });
  }, [id]);

  function updateField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    const res = await fetch(`/api/teachers/${id}`, {
      method: "PATCH",
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

  if (loading) {
    return (
      <div>
        <div className="mb-6 h-6 w-40 animate-pulse rounded bg-line" />
        <div className="max-w-2xl space-y-4 rounded-lg border border-line bg-white p-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="h-9 animate-pulse rounded bg-line" />
            <div className="h-9 animate-pulse rounded bg-line" />
          </div>
          <div className="h-9 animate-pulse rounded bg-line" />
          <div className="grid grid-cols-2 gap-4">
            <div className="h-9 animate-pulse rounded bg-line" />
            <div className="h-9 animate-pulse rounded bg-line" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="mb-6 text-xl font-semibold text-navy">Edit Teacher</h2>

      <form
        onSubmit={handleSubmit}
        className="max-w-2xl rounded-lg border border-line bg-white p-6"
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
            <label className="mb-1 block text-sm text-navy/70">Last Name</label>
            <input
              value={form.last_name}
              onChange={(e) => updateField("last_name", e.target.value)}
              required
              className="w-full rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-cobalt"
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="mb-1 block text-sm text-navy/70">Subjects</label>
          <select
            value=""
            onChange={(e) => {
              const sid = Number(e.target.value);
              if (sid && !selectedSubjects.includes(sid)) {
                setSelectedSubjects((prev) => [...prev, sid]);
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
                          prev.filter((sid) => sid !== s.id),
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

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="rounded-md bg-cobalt px-4 py-2 text-sm font-medium text-white transition hover:bg-cobalt/90 disabled:opacity-50"
          >
            {submitting ? "Saving..." : "Save Changes"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/admin/teachers")}
            className="rounded-md border border-line px-4 py-2 text-sm font-medium text-navy/70 hover:bg-paper"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
