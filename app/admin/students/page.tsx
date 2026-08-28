// app/admin/students/page.tsx
"use client";

import { useEffect, useState } from "react";

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
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-navy">Students</h2>
        <p className="text-sm text-navy/60">{students.length} enrolled</p>
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
            </tr>
          </thead>
          <tbody>
            {filtered.map((student) => (
              <tr
                key={student.id}
                className="border-b border-line last:border-0 hover:bg-paper"
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
