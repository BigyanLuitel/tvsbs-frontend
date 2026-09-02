// app/teacher/assignments/page.tsx
"use client";

import { useState, useEffect } from "react";

type ClassOption = { id: number; class_name: string; section: string };
type SubjectOption = { id: number; subject_name: string };
type Assignment = {
  id: number;
  title: string;
  description: string;
  class_name: string;
  subject_name: string;
  due_date: string;
  attachment: string | null;
  created_at: string;
};

export default function TeacherAssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [subjects, setSubjects] = useState<SubjectOption[]>([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    class_obj: "",
    subject: "",
    due_date: "",
  });
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  useEffect(() => {
    loadAssignments();
    fetch("/api/classes")
      .then((res) => res.json())
      .then(setClasses);
    fetch("/api/subjects")
      .then((res) => res.json())
      .then(setSubjects);
  }, []);

  function loadAssignments() {
    setLoading(true);
    fetch("/api/assignments")
      .then((res) => res.json())
      .then((data) => {
        setAssignments(data);
        setLoading(false);
      });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    const data = new FormData();
    Object.entries(form).forEach(([key, value]) => data.append(key, value));
    if (file) data.append("attachment", file);

    const res = await fetch("/api/assignments", { method: "POST", body: data });
    setSubmitting(false);

    if (!res.ok) {
      const errData = await res.json();
      setError(JSON.stringify(errData));
      return;
    }

    setForm({
      title: "",
      description: "",
      class_obj: "",
      subject: "",
      due_date: "",
    });
    setFile(null);
    setShowForm(false);
    loadAssignments();
  }

  async function confirmDelete() {
    if (confirmDeleteId === null) return;
    const id = confirmDeleteId;
    setConfirmDeleteId(null);

    const res = await fetch(`/api/assignments/${id}`, { method: "DELETE" });
    if (res.ok) {
      setAssignments((prev) => prev.filter((a) => a.id !== id));
    }
  }
  if (loading) {
    return <p className="text-sm text-navy/60">Loading assignments...</p>;
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-navy">Assignments</h2>
          <p className="text-sm text-navy/60">{assignments.length} posted</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="rounded-md bg-cobalt px-4 py-2 text-sm font-medium text-white transition hover:bg-cobalt/90"
        >
          + Post Assignment
        </button>
      </div>

      {assignments.length === 0 ? (
        <p className="text-sm text-navy/60">
          You haven't posted any assignments yet.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {assignments.map((a) => (
            <div
              key={a.id}
              className="rounded-lg border border-line bg-white p-4"
            >
              <div className="mb-2 flex items-start justify-between">
                <h3 className="font-medium text-navy">{a.title}</h3>
                <button
                  onClick={() => setConfirmDeleteId(a.id)}
                  className="text-xs text-danger hover:underline"
                >
                  Delete
                </button>
              </div>
              <div className="mb-2 flex gap-2">
                <span className="rounded-full bg-amber/10 px-2 py-0.5 text-xs font-medium text-amber">
                  {a.class_name}
                </span>
                <span className="rounded-full bg-cobalt/10 px-2 py-0.5 text-xs font-medium text-cobalt">
                  {a.subject_name}
                </span>
              </div>
              <p className="mb-3 text-sm text-navy/70">{a.description}</p>
              <div className="flex items-center justify-between text-xs text-navy/50">
                <span>Due: {a.due_date}</span>
                {a.attachment && (
                  <a
                    href={a.attachment}
                    target="_blank"
                    className="text-cobalt hover:underline"
                  >
                    View Attachment
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 flex items-center justify-center bg-navy/40 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-lg border border-line bg-white p-6">
            <h3 className="mb-4 text-base font-semibold text-navy">
              Post Assignment
            </h3>

            <form onSubmit={handleSubmit}>
              {error && (
                <p className="mb-4 rounded-md bg-coral/10 px-3 py-2 text-sm text-coral">
                  {error}
                </p>
              )}

              <label className="mb-1 block text-sm text-navy/70">Title</label>
              <input
                value={form.title}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, title: e.target.value }))
                }
                required
                className="mb-3 w-full rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-cobalt"
              />

              <label className="mb-1 block text-sm text-navy/70">
                Description
              </label>
              <textarea
                value={form.description}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, description: e.target.value }))
                }
                rows={3}
                className="mb-3 w-full rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-cobalt"
              />

              <div className="mb-3 grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-sm text-navy/70">
                    Class
                  </label>
                  <select
                    value={form.class_obj}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        class_obj: e.target.value,
                      }))
                    }
                    required
                    className="w-full rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-cobalt"
                  >
                    <option value="">Select class</option>
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.class_name} {c.section}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm text-navy/70">
                    Subject
                  </label>
                  <select
                    value={form.subject}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, subject: e.target.value }))
                    }
                    required
                    className="w-full rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-cobalt"
                  >
                    <option value="">Select subject</option>
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.subject_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <label className="mb-1 block text-sm text-navy/70">
                Due Date
              </label>
              <input
                type="date"
                value={form.due_date}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, due_date: e.target.value }))
                }
                required
                className="mb-3 w-full rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-cobalt"
              />

              <label className="mb-1 block text-sm text-navy/70">
                Attachment (optional)
              </label>
              <input
                type="file"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                className="mb-6 text-sm text-navy/70"
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
                  {submitting ? "Posting..." : "Post"}
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
              Delete assignment?
            </h3>
            <p className="mb-6 text-sm text-navy/60">This cannot be undone.</p>
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
