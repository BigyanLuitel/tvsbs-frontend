// app/admin/academics/classes/page.tsx
"use client";

import { useEffect, useState } from "react";
import TableSkeleton from "@/app/components/TableSkeleton";

type ClassRow = {
  id: number;
  class_name: string;
  section: string;
  teacher: number | null;
  teacher_email: string | null;
  teacher_name: string | null;
};

type TeacherOption = {
  id: number;
  user_id: number;
  first_name: string;
  last_name: string;
  email: string;
};

export default function ClassesPage() {
  const [classes, setClasses] = useState<ClassRow[]>([]);
  const [teachers, setTeachers] = useState<TeacherOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({
    class_name: "",
    section: "",
    teacher: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    loadClasses();
    fetch("/api/teachers")
      .then((res) => res.json())
      .then(setTeachers)
      .catch(() => {});
  }, []);

  function loadClasses() {
    setLoading(true);
    fetch("/api/classes")
      .then((res) => res.json())
      .then((data) => {
        setClasses(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load classes");
        setLoading(false);
      });
  }

  function openAdd() {
    setEditingId(null);
    setForm({ class_name: "", section: "", teacher: "" });
    setFormError("");
    setShowForm(true);
  }

  function openEdit(c: ClassRow) {
    setEditingId(c.id);
    setForm({
      class_name: c.class_name,
      section: c.section,
      teacher: c.teacher ? String(c.teacher) : "",
    });
    setFormError("");
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");
    setSubmitting(true);

    const payload = {
      class_name: form.class_name,
      section: form.section,
      teacher: form.teacher ? Number(form.teacher) : null,
    };

    const url = editingId ? `/api/classes/${editingId}` : "/api/classes";
    const method = editingId ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setSubmitting(false);

    if (!res.ok) {
      const errData = await res.json();
      setFormError(JSON.stringify(errData));
      return;
    }

    setShowForm(false);
    loadClasses();
  }

  async function confirmDelete() {
    const id = confirmDeleteId;
    if (id === null) return;

    setConfirmDeleteId(null);
    setDeletingId(id);

    const res = await fetch(`/api/classes/${id}`, { method: "DELETE" });

    if (!res.ok) {
      alert("Failed to delete class");
      setDeletingId(null);
      return;
    }

    setTimeout(() => {
      setClasses((prev) => prev.filter((c) => c.id !== id));
      setDeletingId(null);
    }, 250);
  }
  if (loading) {
    return (
      <div>
        <div className="mb-6 h-6 w-32 animate-pulse rounded bg-line" />
        <TableSkeleton cols={4} />
      </div>
    );
  }

  if (error) {
    return <p className="text-sm text-coral">{error}</p>;
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-navy">Classes</h2>
          <p className="text-sm text-navy/60">{classes.length} classes</p>
        </div>
        <button
          onClick={openAdd}
          className="rounded-md bg-cobalt px-4 py-2 text-sm font-medium text-white transition hover:bg-cobalt/90"
        >
          + Add Class
        </button>
      </div>

      <div className="overflow-hidden rounded-lg border border-line bg-white">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-line bg-paper">
              <th className="px-4 py-3 font-medium text-navy/70">Class</th>
              <th className="px-4 py-3 font-medium text-navy/70">Section</th>
              <th className="px-4 py-3 font-medium text-navy/70">
                Homeroom Teacher
              </th>
              <th className="px-4 py-3 font-medium text-navy/70">Actions</th>
            </tr>
          </thead>
          <tbody>
            {classes.map((c) => (
              <tr
                key={c.id}
                className={`border-b border-line last:border-0 transition-opacity duration-300 hover:bg-paper ${
                  deletingId === c.id ? "opacity-0" : "opacity-100"
                }`}
              >
                <td className="px-4 py-3 font-medium text-navy">
                  {c.class_name}
                </td>
                <td className="px-4 py-3 text-navy/70">{c.section || "—"}</td>
                <td className="px-4 py-3 text-navy/70">
                  {c.teacher_name || (
                    <span className="text-navy/40">Unassigned</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-3">
                    <button
                      onClick={() => openEdit(c)}
                      className="text-sm text-cobalt hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setConfirmDeleteId(c.id)}
                      className="text-sm text-danger hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="fixed inset-0 flex items-center justify-center bg-navy/40 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-lg border border-line bg-white p-6">
            <h3 className="mb-4 text-base font-semibold text-navy">
              {editingId ? "Edit Class" : "Add Class"}
            </h3>

            <form onSubmit={handleSubmit}>
              {formError && (
                <p className="mb-4 rounded-md bg-coral/10 px-3 py-2 text-sm text-coral">
                  {formError}
                </p>
              )}

              <label className="mb-1 block text-sm text-navy/70">
                Class Name
              </label>
              <input
                value={form.class_name}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, class_name: e.target.value }))
                }
                required
                placeholder="e.g. Grade 5"
                className="mb-4 w-full rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-cobalt"
              />

              <label className="mb-1 block text-sm text-navy/70">Section</label>
              <input
                value={form.section}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, section: e.target.value }))
                }
                placeholder="e.g. A"
                className="mb-4 w-full rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-cobalt"
              />

              <label className="mb-1 block text-sm text-navy/70">
                Homeroom Teacher
              </label>
              <select
                value={form.teacher}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, teacher: e.target.value }))
                }
                className="mb-6 w-full rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-cobalt"
              >
                <option value="">Unassigned</option>
                {teachers.map((t) => (
                  <option key={t.id} value={t.user_id}>
                    {t.first_name} {t.last_name}
                  </option>
                ))}
              </select>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="rounded-md px-4 py-2 text-sm font-medium text-navy/70 hover:bg-paper"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-md bg-cobalt px-4 py-2 text-sm font-medium text-white hover:bg-cobalt/90 disabled:opacity-50"
                >
                  {submitting ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {confirmDeleteId !== null && (
        <div className="fixed inset-0 flex items-center justify-center bg-navy/40 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-lg border border-line bg-white p-6">
            <h3 className="mb-2 text-base font-semibold text-navy">
              Delete class?
            </h3>
            <p className="mb-6 text-sm text-navy/60">
              This cannot be undone. Students assigned to this class will be
              affected.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="rounded-md px-4 py-2 text-sm font-medium text-navy/70 hover:bg-paper"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="rounded-md bg-danger px-4 py-2 text-sm font-medium text-white hover:bg-danger/90"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
