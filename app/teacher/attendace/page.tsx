// app/admin/attendance/page.tsx
"use client";

import { useState, useEffect } from "react";

type ClassOption = { id: number; class_name: string; section: string };
type Student = {
  id: number;
  first_name: string;
  last_name: string;
  student_class: number;
};

const STATUSES = ["PRESENT", "ABSENT", "LATE", "EXCUSED"] as const;
type Status = (typeof STATUSES)[number];

export default function AttendancePage() {
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [statusMap, setStatusMap] = useState<Record<number, Status>>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/classes")
      .then((res) => res.json())
      .then(setClasses);
    fetch("/api/students")
      .then((res) => res.json())
      .then(setAllStudents);
  }, []);

  const roster = allStudents.filter(
    (s) => s.student_class === Number(selectedClass),
  );

  function setStatus(studentId: number, status: Status) {
    setStatusMap((prev) => ({ ...prev, [studentId]: status }));
  }

  function markAllAs(status: Status) {
    const updates: Record<number, Status> = {};
    roster.forEach((s) => (updates[s.id] = status));
    setStatusMap((prev) => ({ ...prev, ...updates }));
  }
  async function handleSubmit() {
    if (!selectedClass) return;
    setSubmitting(true);
    setError("");
    setSuccess(false);

    const status_map: Record<string, string> = {};
    roster.forEach((s) => {
      status_map[String(s.id)] = statusMap[s.id] || "PRESENT";
    });

    const res = await fetch("/api/attendance/mark-class", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        class_id: Number(selectedClass),
        date,
        status_map,
      }),
    });

    setSubmitting(false);

    if (!res.ok) {
      const errData = await res.json();
      setError(JSON.stringify(errData));
      return;
    }

    setSuccess(true);
  }

  const statusStyles: Record<Status, string> = {
    PRESENT: "bg-cobalt/10 text-cobalt border-cobalt",
    ABSENT: "bg-danger/10 text-danger border-danger",
    LATE: "bg-amber/10 text-amber border-amber",
    EXCUSED: "bg-line text-navy/60 border-line",
  };

  return (
    <div>
      <h2 className="mb-6 text-xl font-semibold text-navy">Mark Attendance</h2>

      <div className="mb-6 flex flex-wrap items-end gap-4 rounded-lg border border-line bg-white p-4">
        <div>
          <label className="mb-1 block text-sm text-navy/70">Class</label>
          <select
            value={selectedClass}
            onChange={(e) => {
              setSelectedClass(e.target.value);
              setStatusMap({});
              setSuccess(false);
            }}
            className="rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-cobalt"
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
          <label className="mb-1 block text-sm text-navy/70">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-cobalt"
          />
        </div>

        {roster.length > 0 && (
          <button
            onClick={() => markAllAs("PRESENT")}
            className="rounded-md border border-line px-3 py-2 text-sm text-navy/70 hover:bg-paper"
          >
            Mark all Present
          </button>
        )}
      </div>

      {error && (
        <p className="mb-4 rounded-md bg-coral/10 px-3 py-2 text-sm text-coral">
          {error}
        </p>
      )}
      {success && (
        <p className="mb-4 rounded-md bg-cobalt/10 px-3 py-2 text-sm text-cobalt">
          Attendance saved for {roster.length} students.
        </p>
      )}

      {!selectedClass ? (
        <p className="text-sm text-navy/60">
          Select a class to see its roster.
        </p>
      ) : roster.length === 0 ? (
        <p className="text-sm text-navy/60">No students found in this class.</p>
      ) : (
        <>
          <div className="overflow-hidden rounded-lg border border-line bg-white">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-line bg-paper">
                  <th className="px-4 py-3 font-medium text-navy/70">
                    Student
                  </th>
                  <th className="px-4 py-3 font-medium text-navy/70">Status</th>
                </tr>
              </thead>
              <tbody>
                {roster.map((s) => {
                  const current = statusMap[s.id] || "PRESENT";
                  return (
                    <tr
                      key={s.id}
                      className="border-b border-line last:border-0"
                    >
                      <td className="px-4 py-3 font-medium text-navy">
                        {s.first_name} {s.last_name}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          {STATUSES.map((st) => (
                            <button
                              key={st}
                              onClick={() => setStatus(s.id, st)}
                              className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                                current === st
                                  ? statusStyles[st]
                                  : "border-line text-navy/40 hover:border-cobalt"
                              }`}
                            >
                              {st.charAt(0) + st.slice(1).toLowerCase()}
                            </button>
                          ))}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="mt-4 rounded-md bg-cobalt px-4 py-2 text-sm font-medium text-white transition hover:bg-cobalt/90 disabled:opacity-50"
          >
            {submitting ? "Saving..." : "Save Attendance"}
          </button>
        </>
      )}
    </div>
  );
}
