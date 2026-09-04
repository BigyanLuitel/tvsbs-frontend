// app/admin/library/books/page.tsx
"use client";

import { useEffect, useState } from "react";
import TableSkeleton from "@/app/components/TableSkeleton";

type Book = {
  id: number;
  title: string;
  author: string;
  isbn: string;
  total_copies: number;
  available_copies: number;
};

export default function BooksPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({
    title: "",
    author: "",
    isbn: "",
    total_copies: "1",
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  useEffect(() => {
    loadBooks();
  }, []);

  function loadBooks() {
    setLoading(true);
    fetch("/api/library/books")
      .then((res) => res.json())
      .then((data) => {
        setBooks(data);
        setLoading(false);
      });
  }

  function openAdd() {
    setEditingId(null);
    setForm({ title: "", author: "", isbn: "", total_copies: "1" });
    setFormError("");
    setShowForm(true);
  }

  function openEdit(b: Book) {
    setEditingId(b.id);
    setForm({
      title: b.title,
      author: b.author,
      isbn: b.isbn,
      total_copies: String(b.total_copies),
    });
    setFormError("");
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");
    setSubmitting(true);

    const payload = { ...form, total_copies: Number(form.total_copies) };
    const url = editingId
      ? `/api/library/books/${editingId}`
      : "/api/library/books";
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
    loadBooks();
  }

  async function confirmDelete() {
    if (confirmDeleteId === null) return;
    const id = confirmDeleteId;
    setConfirmDeleteId(null);

    const res = await fetch(`/api/library/books/${id}`, { method: "DELETE" });
    if (res.ok) {
      setBooks((prev) => prev.filter((b) => b.id !== id));
    }
  }
  const filtered = books.filter((b) =>
    `${b.title} ${b.author} ${b.isbn}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );

  if (loading) {
    return (
      <div>
        <div className="mb-6 h-6 w-32 animate-pulse rounded bg-line" />
        <TableSkeleton cols={5} />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-navy">Library Books</h2>
          <p className="text-sm text-navy/60">{books.length} titles</p>
        </div>
        <button
          onClick={openAdd}
          className="rounded-md bg-cobalt px-4 py-2 text-sm font-medium text-white transition hover:bg-cobalt/90"
        >
          + Add Book
        </button>
      </div>

      <input
        type="text"
        placeholder="Search by title, author, or ISBN..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-4 w-full max-w-sm rounded-md border border-line px-3 py-2 text-sm text-navy outline-none transition focus:border-cobalt"
      />

      <div className="overflow-x-auto rounded-lg border border-line bg-white">
        <table className="w-full min-w-[700px] text-left text-sm">
          <thead>
            <tr className="border-b border-line bg-paper">
              <th className="px-4 py-3 font-medium text-navy/70">Title</th>
              <th className="px-4 py-3 font-medium text-navy/70">Author</th>
              <th className="px-4 py-3 font-medium text-navy/70">ISBN</th>
              <th className="px-4 py-3 font-medium text-navy/70">
                Availability
              </th>
              <th className="px-4 py-3 font-medium text-navy/70">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((b) => (
              <tr
                key={b.id}
                className="border-b border-line last:border-0 hover:bg-paper"
              >
                <td className="px-4 py-3 font-medium text-navy">{b.title}</td>
                <td className="px-4 py-3 text-navy/70">{b.author}</td>
                <td className="px-4 py-3 text-navy/70">{b.isbn || "—"}</td>
                <td className="px-4 py-3">
                  <span
                    className={`whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium ${
                      b.available_copies > 0
                        ? "bg-cobalt/10 text-cobalt"
                        : "bg-danger/10 text-danger"
                    }`}
                  >
                    {b.available_copies} / {b.total_copies} available
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-3">
                    <button
                      onClick={() => openEdit(b)}
                      className="text-sm text-cobalt hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setConfirmDeleteId(b.id)}
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
              {editingId ? "Edit Book" : "Add Book"}
            </h3>

            <form onSubmit={handleSubmit}>
              {formError && (
                <p className="mb-4 rounded-md bg-coral/10 px-3 py-2 text-sm text-coral">
                  {formError}
                </p>
              )}

              <label className="mb-1 block text-sm text-navy/70">Title</label>
              <input
                value={form.title}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, title: e.target.value }))
                }
                required
                className="mb-4 w-full rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-cobalt"
              />

              <label className="mb-1 block text-sm text-navy/70">Author</label>
              <input
                value={form.author}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, author: e.target.value }))
                }
                required
                className="mb-4 w-full rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-cobalt"
              />

              <label className="mb-1 block text-sm text-navy/70">ISBN</label>
              <input
                value={form.isbn}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, isbn: e.target.value }))
                }
                className="mb-4 w-full rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-cobalt"
              />

              <label className="mb-1 block text-sm text-navy/70">
                Total Copies
              </label>
              <input
                type="number"
                min={1}
                value={form.total_copies}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, total_copies: e.target.value }))
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
              Delete book?
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
