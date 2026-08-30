// app/admin/academics/subjects/page.tsx
"use client";

import { useEffect, useState } from "react";
import TableSkeleton from "@/app/components/TableSkeleton";

type Subject = { id: number; subject_name: string; subject_code: string };

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({ subject_name: "", subject_code: "" });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    loadSubjects();
  }, []);

  function loadSubjects() {
    setLoading(true);
    fetch("/api/subjects")
      .then((res) => res.json())
      .then((data) => {
        setSubjects(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load subjects");
        setLoading(false);
      });
  }

  function openAdd() {
    setEditingId(null);
    setForm({ subject_name: "", subject_code: "" });
    setFormError("");
    setShowForm(true);
  }

  function openEdit(s: Subject) {
    setEditingId(s.id);
    setForm({ subject_name: s.subject_name, subject_code: s.subject_code });
    setFormError("");
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");
    setSubmitting(true);

    const url = editingId ? `/api/subjects/${editingId}` : "/api/subjects";
    const method = editingId ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    setSubmitting(false);

    if (!res.ok) {
      const errData = await res.json();
      setFormError(JSON.stringify(errData));
      return;
    }

    setShowForm(false);
    loadSubjects();
  }

  async function confirmDelete() {
    const id = confirmDeleteId;
    if (id === null) return;

    setConfirmDeleteId(null);
    setDeletingId(id);

    const res = await fetch(`/api/subjects/${id}`, { method: "DELETE" });

    if (!res.ok) {
      alert("Failed to delete subject");
      setDeletingId(null);
      return;
    }

    setTimeout(() => {
      setSubjects((prev) => prev.filter((s) => s.id !== id));
      setDeletingId(null);
    }, 250);
  }
  if (loading) {
    return (
      <div>
        <div className="mb-6 h-6 w-32 animate-pulse rounded bg-line" />
        <TableSkeleton cols={3} />
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
          <h2 className="text-xl font-semibold text-navy">Subjects</h2>
          <p className="text-sm text-navy/60">{subjects.length} subjects</p>
        </div>
        <button
          onClick={openAdd}
          className="rounded-md bg-cobalt px-4 py-2 text-sm font-medium text-white transition hover:bg-cobalt/90"
        >
          + Add Subject
        </button>
      </div>

      <div className="overflow-hidden rounded-lg border border-line bg-white">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-line bg-paper">
              <th className="px-4 py-3 font-medium text-navy/70">Name</th>
              <th className="px-4 py-3 font-medium text-navy/70">Code</th>
              <th className="px-4 py-3 font-medium text-navy/70">Actions</th>
            </tr>
          </thead>
          <tbody>
            {subjects.map((s) => (
              <tr
                key={s.id}
                className={`border-b border-line last:border-0 transition-opacity duration-300 hover:bg-paper ${
                  deletingId === s.id ? "opacity-0" : "opacity-100"
                }`}
              >
                <td className="px-4 py-3 font-medium text-navy">
                  {s.subject_name}
                </td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-amber/10 px-2 py-0.5 text-xs font-medium text-amber">
                    {s.subject_code}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-3">
                    <button
                      onClick={() => openEdit(s)}
                      className="text-sm text-cobalt hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setConfirmDeleteId(s.id)}
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
              {editingId ? "Edit Subject" : "Add Subject"}
            </h3>

            <form onSubmit={handleSubmit}>
              {formError && (
                <p className="mb-4 rounded-md bg-coral/10 px-3 py-2 text-sm text-coral">
                  {formError}
                </p>
              )}

              <label className="mb-1 block text-sm text-navy/70">
                Subject Name
              </label>
              <input
                value={form.subject_name}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, subject_name: e.target.value }))
                }
                required
                className="mb-4 w-full rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-cobalt"
              />

              <label className="mb-1 block text-sm text-navy/70">
                Subject Code
              </label>
              <input
                value={form.subject_code}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, subject_code: e.target.value }))
                }
                required
                placeholder="e.g. MATH"
                className="mb-6 w-full rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-cobalt"
              />

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
              Delete subject?
            </h3>
            <p className="mb-6 text-sm text-navy/60">
              This cannot be undone. Any class-subject mappings using this
              subject will be affected.
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
