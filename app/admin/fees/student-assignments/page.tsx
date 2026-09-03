// app/admin/fees/student-assignments/page.tsx
"use client";

import { useState, useEffect } from "react";

type StudentOption = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
};
type CategoryOption = { id: number; name: string };
type Assignment = {
  id: number;
  student: number;
  student_email: string;
  fee_category: number;
  category_name: string;
  amount: string;
  is_active: boolean;
};

export default function StudentFeeAssignmentsPage() {
  const [students, setStudents] = useState<StudentOption[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [allAssignments, setAllAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedStudent, setSelectedStudent] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ fee_category: "", amount: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadAssignments();
    fetch("/api/students")
      .then((res) => res.json())
      .then(setStudents);
    fetch("/api/fees/categories")
      .then((res) => res.json())
      .then(setCategories);
  }, []);

  function loadAssignments() {
    setLoading(true);
    fetch("/api/fees/student-assignments")
      .then((res) => res.json())
      .then((data) => {
        setAllAssignments(data);
        setLoading(false);
      });
  }

  const studentAssignments = allAssignments.filter(
    (a) => a.student === Number(selectedStudent),
  );

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    const res = await fetch("/api/fees/student-assignments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        student: Number(selectedStudent),
        fee_category: Number(form.fee_category),
        amount: form.amount,
      }),
    });

    setSubmitting(false);

    if (!res.ok) {
      const errData = await res.json();
      setError(JSON.stringify(errData));
      return;
    }

    setForm({ fee_category: "", amount: "" });
    setShowForm(false);
    loadAssignments();
  }

  async function toggleActive(assignment: Assignment) {
    await fetch(`/api/fees/student-assignments/${assignment.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: !assignment.is_active }),
    });
    loadAssignments();
  }

  async function handleDelete(id: number) {
    await fetch(`/api/fees/student-assignments/${id}`, { method: "DELETE" });
    loadAssignments();
  }
  if (loading) {
    return <p className="text-sm text-navy/60">Loading...</p>;
  }

  return (
    <div>
      <h2 className="mb-6 text-xl font-semibold text-navy">
        Student Fee Assignments
      </h2>
      <p className="mb-6 text-sm text-navy/60">
        Assign extra, per-student fees (bus, computer, etc.) separate from the
        standard class-wide rate.
      </p>

      <div className="mb-6 rounded-lg border border-line bg-white p-4">
        <label className="mb-1 block text-sm text-navy/70">
          Select Student
        </label>
        <select
          value={selectedStudent}
          onChange={(e) => setSelectedStudent(e.target.value)}
          className="w-full max-w-sm rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-cobalt sm:w-auto"
        >
          <option value="">Choose a student</option>
          {students.map((s) => (
            <option key={s.id} value={s.id}>
              {s.first_name} {s.last_name} ({s.email})
            </option>
          ))}
        </select>
      </div>

      {selectedStudent && (
        <div className="rounded-lg border border-line bg-white p-4">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm font-medium text-navy">Extra Fees</p>
            <button
              onClick={() => setShowForm(true)}
              className="rounded-md bg-cobalt px-3 py-1.5 text-sm font-medium text-white hover:bg-cobalt/90"
            >
              + Add Fee
            </button>
          </div>

          {studentAssignments.length === 0 ? (
            <p className="text-sm text-navy/50">
              No extra fees assigned to this student.
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {studentAssignments.map((a) => (
                <div
                  key={a.id}
                  className="flex flex-wrap items-center justify-between gap-2 border-b border-line pb-2 last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        a.is_active
                          ? "bg-cobalt/10 text-cobalt"
                          : "bg-line text-navy/40"
                      }`}
                    >
                      {a.category_name}
                    </span>
                    <span className="text-sm text-navy">Rs. {a.amount}</span>
                  </div>
                  <div className="flex gap-3 text-sm">
                    <button
                      onClick={() => toggleActive(a)}
                      className="text-cobalt hover:underline"
                    >
                      {a.is_active ? "Deactivate" : "Activate"}
                    </button>
                    <button
                      onClick={() => handleDelete(a.id)}
                      className="text-danger hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 flex items-center justify-center bg-navy/40 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-lg border border-line bg-white p-6">
            <h3 className="mb-4 text-base font-semibold text-navy">Add Fee</h3>

            <form onSubmit={handleAdd}>
              {error && (
                <p className="mb-4 rounded-md bg-coral/10 px-3 py-2 text-sm text-coral">
                  {error}
                </p>
              )}

              <label className="mb-1 block text-sm text-navy/70">
                Category
              </label>
              <select
                value={form.fee_category}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, fee_category: e.target.value }))
                }
                required
                className="mb-4 w-full rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-cobalt"
              >
                <option value="">Select category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>

              <label className="mb-1 block text-sm text-navy/70">
                Amount (Rs.)
              </label>
              <input
                type="number"
                step="0.01"
                value={form.amount}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, amount: e.target.value }))
                }
                required
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
                  {submitting ? "Adding..." : "Add"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
