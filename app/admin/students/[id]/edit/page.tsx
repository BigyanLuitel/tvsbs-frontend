// app/admin/students/[id]/edit/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

type ClassOption = { id: number; class_name: string; section: string };

export default function EditStudentPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    student_class: "",
    date_of_birth: "",
    gender: "M",
    parent_name: "",
    parent_contact: "",
  });
  const [photo, setPhoto] = useState<File | null>(null);
  const [existingPhotoUrl, setExistingPhotoUrl] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/classes")
      .then((res) => res.json())
      .then(setClasses);

    fetch(`/api/students/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setForm({
          first_name: data.first_name,
          last_name: data.last_name,
          student_class: String(data.student_class),
          date_of_birth: data.date_of_birth,
          gender: data.gender,
          parent_name: data.parent_name,
          parent_contact: data.parent_contact,
        });
        setExistingPhotoUrl(data.photo);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load student");
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

    const data = new FormData();
    Object.entries(form).forEach(([key, value]) => data.append(key, value));
    if (photo) data.append("photo", photo);

    const res = await fetch(`/api/students/${id}`, {
      method: "PATCH",
      body: data,
    });

    setSubmitting(false);

    if (!res.ok) {
      const errData = await res.json();
      setError(JSON.stringify(errData));
      return;
    }

    router.push("/admin/students");
  }

  if (loading) {
    return <p className="text-sm text-navy/60">Loading student...</p>;
  }

  return (
    <div>
      <h2 className="mb-6 text-xl font-semibold text-navy">Edit Student</h2>

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

        <div className="mb-4 grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm text-navy/70">Class</label>
            <select
              value={form.student_class}
              onChange={(e) => updateField("student_class", e.target.value)}
              required
              className="w-full rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-cobalt"
            >
              <option value="">Select a class</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.class_name} {c.section}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm text-navy/70">Gender</label>
            <select
              value={form.gender}
              onChange={(e) => updateField("gender", e.target.value)}
              className="w-full rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-cobalt"
            >
              <option value="M">Male</option>
              <option value="F">Female</option>
            </select>
          </div>
        </div>

        <div className="mb-4">
          <label className="mb-1 block text-sm text-navy/70">
            Date of Birth
          </label>
          <input
            type="date"
            value={form.date_of_birth}
            onChange={(e) => updateField("date_of_birth", e.target.value)}
            required
            className="w-full rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-cobalt"
          />
        </div>

        <div className="mb-4 grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm text-navy/70">
              Parent Name
            </label>
            <input
              value={form.parent_name}
              onChange={(e) => updateField("parent_name", e.target.value)}
              required
              className="w-full rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-cobalt"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-navy/70">
              Parent Contact
            </label>
            <input
              value={form.parent_contact}
              onChange={(e) => updateField("parent_contact", e.target.value)}
              required
              className="w-full rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-cobalt"
            />
          </div>
        </div>

        <div className="mb-6">
          <label className="mb-1 block text-sm text-navy/70">Photo</label>
          {existingPhotoUrl && !photo && (
            <img
              src={existingPhotoUrl}
              alt="Current"
              className="mb-2 h-16 w-16 rounded-full object-cover"
            />
          )}
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setPhoto(e.target.files?.[0] ?? null)}
            className="text-sm text-navy/70"
          />
          <p className="mt-1 text-xs text-navy/50">
            Leave empty to keep the current photo
          </p>
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
            onClick={() => router.push("/admin/students")}
            className="rounded-md border border-line px-4 py-2 text-sm font-medium text-navy/70 hover:bg-paper"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
