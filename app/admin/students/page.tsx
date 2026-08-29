// app/admin/students/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Student = {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  student_class: number;
  gender: string;
  parent_name: string;
  parent_contact: string;
  photo: string | null;
};

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/students")
      .then((res) => res.json())
      .then((data) => {
        setStudents(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load students");
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

    const res = await fetch(`/api/students/${id}`, { method: "DELETE" });

    if (!res.ok) {
      alert("Failed to delete student");
      setDeletingId(null);
      return;
    }

    setTimeout(() => {
      setStudents((prev) => prev.filter((s) => s.id !== id));
      setDeletingId(null);
    }, 250);
  }

  if (loading) {
    return <p className="text-sm text-navy/60">Loading students...</p>;
  }

  if (error) {
    return <p className="text-sm text-coral">{error}</p>;
  }

  const filtered = students.filter((s) =>
    `${s.first_name} ${s.last_name} ${s.email}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );

  const maleCount = students.filter((s) => s.gender === "M").length;
  const femaleCount = students.filter((s) => s.gender === "F").length;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-navy">Students</h2>
          <p className="text-sm text-navy/60">{students.length} enrolled</p>
        </div>
        <Link
          href="/admin/students/add"
          className="rounded-md bg-cobalt px-4 py-2 text-sm font-medium text-white transition hover:bg-cobalt/90"
        >
          + Add Student
        </Link>
      </div>

      <div className="mb-6 grid grid-cols-3 gap-4">
        <div className="rounded-lg border border-line bg-white p-4">
          <p className="text-xs text-navy/60">Total Students</p>
          <p className="mt-1 text-2xl font-semibold text-navy">
            {students.length}
          </p>
        </div>
        <div className="rounded-lg border border-line bg-white p-4">
          <p className="text-xs text-navy/60">Male</p>
          <p className="mt-1 text-2xl font-semibold text-cobalt">{maleCount}</p>
        </div>
        <div className="rounded-lg border border-line bg-white p-4">
          <p className="text-xs text-navy/60">Female</p>
          <p className="mt-1 text-2xl font-semibold text-coral">
            {femaleCount}
          </p>
        </div>
      </div>

      <input
        type="text"
        placeholder="Search by name or email..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-4 w-full max-w-sm rounded-md border border-line px-3 py-2 text-sm text-navy outline-none transition focus:border-cobalt"
      />

      <div className="overflow-hidden rounded-lg border border-line bg-white">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-line bg-paper">
              <th className="px-4 py-3 font-medium text-navy/70">Photo</th>
              <th className="px-4 py-3 font-medium text-navy/70">Name</th>
              <th className="px-4 py-3 font-medium text-navy/70">Email</th>
              <th className="px-4 py-3 font-medium text-navy/70">Class</th>
              <th className="px-4 py-3 font-medium text-navy/70">Gender</th>
              <th className="px-4 py-3 font-medium text-navy/70">Parent</th>
              <th className="px-4 py-3 font-medium text-navy/70">Contact</th>
              <th className="px-4 py-3 font-medium text-navy/70">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((student) => (
              <tr
                key={student.id}
                className={`border-b border-line last:border-0 transition-opacity duration-300 hover:bg-paper ${
                  deletingId === student.id ? "opacity-0" : "opacity-100"
                }`}
              >
                <td className="px-4 py-3">
                  {student.photo ? (
                    <img
                      src={student.photo}
                      alt={student.first_name}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cobalt/10 text-xs font-medium text-cobalt">
                      {student.first_name[0]}
                      {student.last_name[0]}
                    </div>
                  )}
                </td>
                <td className="px-4 py-3 font-medium text-navy">
                  {student.first_name} {student.last_name}
                </td>
                <td className="px-4 py-3 text-navy/70">{student.email}</td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-amber/10 px-2 py-0.5 text-xs font-medium text-amber">
                    Class {student.student_class}
                  </span>
                </td>
                <td className="px-4 py-3 text-navy/70">{student.gender}</td>
                <td className="px-4 py-3 text-navy/70">
                  {student.parent_name}
                </td>
                <td className="px-4 py-3 text-navy/70">
                  {student.parent_contact}
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-3">
                    <Link
                      href={`/admin/students/${student.id}/edit`}
                      className="text-sm text-cobalt hover:underline"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => askDelete(student.id)}
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
              Delete student?
            </h3>
            <p className="mb-6 text-sm text-navy/60">
              This will permanently remove the student's record and login
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
