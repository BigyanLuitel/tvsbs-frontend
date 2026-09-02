// app/admin/students/add/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type ClassOption = { id: number; class_name: string; section: string };

export default function AddStudentPage() {
  const router = useRouter();
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    email: "",
    password: "",
    first_name: "",
    last_name: "",
    student_class: "",
    date_of_birth: "",
    gender: "M",
    parent_name: "",
    parent_contact: "",
  });
  const [photo, setPhoto] = useState<File | null>(null);

  useEffect(() => {
    fetch("/api/classes")
      .then((res) => res.json())
      .then((data) => setClasses(data))
      .catch(() => setError("Failed to load classes"));
  }, []);

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

    const res = await fetch("/api/students", {
      method: "POST",
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
  const selectedClass = classes.find(
    (c) => c.id === Number(form.student_class),
  );
  const photoPreviewUrl = photo ? URL.createObjectURL(photo) : null;

  return (
    <div>
      <h2 className="mb-6 text-xl font-semibold text-navy">Add Student</h2>

      <div className="flex flex-col gap-6 lg:flex-row">
        <form
          onSubmit={handleSubmit}
          className="flex-1 rounded-lg border border-line bg-white p-6"
        >
          {error && (
            <p className="mb-4 rounded-md bg-coral/10 px-3 py-2 text-sm text-coral">
              {error}
            </p>
          )}

          <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
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

          <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
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

          <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
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
            <label className="mb-1 block text-sm text-navy/70">
              Photo (optional)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setPhoto(e.target.files?.[0] ?? null)}
              className="text-sm text-navy/70"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="rounded-md bg-cobalt px-4 py-2 text-sm font-medium text-white transition hover:bg-cobalt/90 disabled:opacity-50"
          >
            {submitting ? "Creating..." : "Create Student"}
          </button>
        </form>

        <div className="w-72 shrink-0 self-start rounded-lg border border-line bg-white p-6 text-center">
          <div className="mb-4 h-1 w-full rounded-full bg-gradient-to-r from-coral via-cobalt to-amber opacity-0" />
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-cobalt/10">
            {photoPreviewUrl ? (
              <img
                src={photoPreviewUrl}
                alt="Preview"
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-xl font-medium text-cobalt">
                {form.first_name[0] || "?"}
                {form.last_name[0] || ""}
              </span>
            )}
          </div>
          <p className="font-medium text-navy">
            {form.first_name || form.last_name
              ? `${form.first_name} ${form.last_name}`.trim()
              : "New Student"}
          </p>
          <p className="mb-4 text-sm text-navy/60">
            {form.email || "email@example.com"}
          </p>

          {selectedClass && (
            <span className="mb-2 inline-block rounded-full bg-amber/10 px-3 py-1 text-xs font-medium text-amber">
              {selectedClass.class_name} {selectedClass.section}
            </span>
          )}

          <div className="mt-4 space-y-1 text-left text-xs text-navy/60">
            <p>Gender: {form.gender === "M" ? "Male" : "Female"}</p>
            {form.date_of_birth && <p>DOB: {form.date_of_birth}</p>}
            {form.parent_name && <p>Parent: {form.parent_name}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
