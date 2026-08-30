// app/admin/fees/structures/page.tsx
"use client";

import { useEffect, useState } from "react";
import TableSkeleton from "@/app/components/TableSkeleton";

type Structure = {
  id: number;
  class_obj: number;
  class_name: string;
  fee_category: number;
  category_name: string;
  amount: string;
  academic_year: string;
};
type ClassOption = { id: number; class_name: string; section: string };
type CategoryOption = { id: number; name: string };

export default function FeeStructuresPage() {
  const [structures, setStructures] = useState<Structure[]>([]);
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({
    class_obj: "",
    fee_category: "",
    amount: "",
    academic_year: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    loadStructures();
    fetch("/api/classes")
      .then((res) => res.json())
      .then(setClasses);
    fetch("/api/fees/categories")
      .then((res) => res.json())
      .then(setCategories);
  }, []);

  function loadStructures() {
    setLoading(true);
    fetch("/api/fees/structures")
      .then((res) => res.json())
      .then((data) => {
        setStructures(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load fee structures");
        setLoading(false);
      });
  }

  function openAdd() {
    setEditingId(null);
    setForm({ class_obj: "", fee_category: "", amount: "", academic_year: "" });
    setFormError("");
    setShowForm(true);
  }

  function openEdit(s: Structure) {
    setEditingId(s.id);
    setForm({
      class_obj: String(s.class_obj),
      fee_category: String(s.fee_category),
      amount: s.amount,
      academic_year: s.academic_year,
    });
    setFormError("");
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");
    setSubmitting(true);

    const payload = {
      class_obj: Number(form.class_obj),
      fee_category: Number(form.fee_category),
      amount: form.amount,
      academic_year: form.academic_year,
    };

    const url = editingId
      ? `/api/fees/structures/${editingId}`
      : "/api/fees/structures";
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
    loadStructures();
  }

  async function confirmDelete() {
    const id = confirmDeleteId;
    if (id === null) return;

    setConfirmDeleteId(null);
    setDeletingId(id);

    const res = await fetch(`/api/fees/structures/${id}`, { method: "DELETE" });

    if (!res.ok) {
      alert("Failed to delete structure");
      setDeletingId(null);
      return;
    }

    setTimeout(() => {
      setStructures((prev) => prev.filter((s) => s.id !== id));
      setDeletingId(null);
    }, 250);
  }
  if (loading) {
    return (
      <div>
        <div className="mb-6 h-6 w-32 animate-pulse rounded bg-line" />
        <TableSkeleton cols={5} />
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
          <h2 className="text-xl font-semibold text-navy">Fee Structures</h2>
          <p className="text-sm text-navy/60">{structures.length} structures</p>
        </div>
        <button
          onClick={openAdd}
          className="rounded-md bg-cobalt px-4 py-2 text-sm font-medium text-white transition hover:bg-cobalt/90"
        >
          + Add Structure
        </button>
      </div>

      <div className="overflow-hidden rounded-lg border border-line bg-white">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-line bg-paper">
              <th className="px-4 py-3 font-medium text-navy/70">Class</th>
              <th className="px-4 py-3 font-medium text-navy/70">Category</th>
              <th className="px-4 py-3 font-medium text-navy/70">Amount</th>
              <th className="px-4 py-3 font-medium text-navy/70">
                Academic Year
              </th>
              <th className="px-4 py-3 font-medium text-navy/70">Actions</th>
            </tr>
          </thead>
          <tbody>
            {structures.map((s) => (
              <tr
                key={s.id}
                className={`border-b border-line last:border-0 transition-opacity duration-300 hover:bg-paper ${
                  deletingId === s.id ? "opacity-0" : "opacity-100"
                }`}
              >
                <td className="px-4 py-3 font-medium text-navy">
                  {s.class_name}
                </td>
                <td className="px-4 py-3 text-navy/70">{s.category_name}</td>
                <td className="px-4 py-3 font-medium text-navy">
                  Rs. {s.amount}
                </td>
                <td className="px-4 py-3 text-navy/70">{s.academic_year}</td>
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
              {editingId ? "Edit Structure" : "Add Structure"}
            </h3>

            <form onSubmit={handleSubmit}>
              {formError && (
                <p className="mb-4 rounded-md bg-coral/10 px-3 py-2 text-sm text-coral">
                  {formError}
                </p>
              )}

              <label className="mb-1 block text-sm text-navy/70">Class</label>
              <select
                value={form.class_obj}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, class_obj: e.target.value }))
                }
                required
                className="mb-4 w-full rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-cobalt"
              >
                <option value="">Select a class</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.class_name} {c.section}
                  </option>
                ))}
              </select>

              <label className="mb-1 block text-sm text-navy/70">
                Fee Category
              </label>
              <select
                value={form.fee_category}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, fee_category: e.target.value }))
                }
                required
                className="mb-4 w-full rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-cobalt"
              >
                <option value="">Select a category</option>
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
                className="mb-4 w-full rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-cobalt"
              />

              <label className="mb-1 block text-sm text-navy/70">
                Academic Year
              </label>
              <input
                value={form.academic_year}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    academic_year: e.target.value,
                  }))
                }
                required
                placeholder="e.g. 2025-2026"
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
              Delete structure?
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
