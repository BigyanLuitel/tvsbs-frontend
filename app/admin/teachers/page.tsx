// app/admin/teachers/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import TableSkeleton from "@/app/components/TableSkeleton";

type Teacher = {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  qualification: string | null;
  contact: string | null;
  subject_names: string[];
};

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/teachers")
      .then((res) => res.json())
      .then((data) => {
        setTeachers(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load teachers");
        setLoading(false);
      });
  }, []);

  function askDelete(id: number) {
    setConfirmDeleteId(id);
  }

  async function confirmDelete() {
    const id = confirmDeleteId;
    if (id === null) return;

    setConfirmDeleteId(null);
    setDeletingId(id);

    const res = await fetch(`/api/teachers/${id}`, { method: "DELETE" });

    if (!res.ok) {
      alert("Failed to delete teacher");
      setDeletingId(null);
      return;
    }

    setTimeout(() => {
      setTeachers((prev) => prev.filter((t) => t.id !== id));
      setDeletingId(null);
    }, 250);
  }

  if (loading) {
    return (
      <div>
        <div className="mb-6">
          <div className="h-6 w-32 animate-pulse rounded bg-line" />
          <div className="mt-2 h-4 w-24 animate-pulse rounded bg-line" />
        </div>
        <TableSkeleton cols={6} />
      </div>
    );
  }

  if (error) {
    return <p className="text-sm text-coral">{error}</p>;
  }

  const filtered = teachers.filter((t) =>
    `${t.first_name} ${t.last_name} ${t.email} ${t.subject_names.join(", ")}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-navy">Teachers</h2>
          <p className="text-sm text-navy/60">{teachers.length} on staff</p>
        </div>
        <Link
          href="/admin/teachers/add"
          className="rounded-md bg-cobalt px-4 py-2 text-sm font-medium text-white transition hover:bg-cobalt/90"
        >
          + Add Teacher
        </Link>
      </div>

      <input
        type="text"
        placeholder="Search by name, email, or subject..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-4 w-full max-w-sm rounded-md border border-line px-3 py-2 text-sm text-navy outline-none transition focus:border-cobalt"
      />

      <div className="overflow-hidden rounded-lg border border-line bg-white">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-line bg-paper">
              <th className="px-4 py-3 font-medium text-navy/70">Name</th>
              <th className="px-4 py-3 font-medium text-navy/70">Email</th>
              <th className="px-4 py-3 font-medium text-navy/70">Subject</th>
              <th className="px-4 py-3 font-medium text-navy/70">
                Qualification
              </th>
              <th className="px-4 py-3 font-medium text-navy/70">Contact</th>
              <th className="px-4 py-3 font-medium text-navy/70">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((teacher) => (
              <tr
                key={teacher.id}
                className={`border-b border-line last:border-0 transition-opacity duration-300 hover:bg-paper ${
                  deletingId === teacher.id ? "opacity-0" : "opacity-100"
                }`}
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-cobalt/10 text-xs font-medium text-cobalt">
                      {teacher.first_name[0]}
                      {teacher.last_name[0]}
                    </div>
                    <span className="font-medium text-navy">
                      {teacher.first_name} {teacher.last_name}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-navy/70">{teacher.email}</td>
                <td className="px-4 py-3">
                  {teacher.subject_names.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {teacher.subject_names.map((name) => (
                        <span
                          key={name}
                          className="rounded-full bg-amber/10 px-2 py-0.5 text-xs font-medium text-amber"
                        >
                          {name}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-navy/40">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-navy/70">
                  {teacher.qualification || "—"}
                </td>
                <td className="px-4 py-3 text-navy/70">
                  {teacher.contact || "—"}
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-3">
                    <Link
                      href={`/admin/teachers/${teacher.id}/edit`}
                      className="text-sm text-cobalt hover:underline"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => askDelete(teacher.id)}
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

      {confirmDeleteId !== null && (
        <div className="fixed inset-0 flex items-center justify-center bg-navy/40 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-lg border border-line bg-white p-6">
            <h3 className="mb-2 text-base font-semibold text-navy">
              Delete teacher?
            </h3>
            <p className="mb-6 text-sm text-navy/60">
              This will permanently remove the teacher's record and login
              access. This cannot be undone.
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
