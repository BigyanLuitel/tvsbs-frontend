// app/admin/attendance/page.tsx
"use client";

import { useState, useEffect } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

type ClassOption = { id: number; class_name: string; section: string };
type AttendanceRecord = {
  id: number;
  student: number;
  student_email: string;
  date: string;
  status: "PRESENT" | "ABSENT" | "LATE" | "EXCUSED";
};
type Student = {
  id: number;
  first_name: string;
  last_name: string;
  student_class: number;
};

export default function AdminAttendancePage() {
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/classes").then((res) => res.json()),
      fetch("/api/students").then((res) => res.json()),
      fetch("/api/attendance").then((res) => res.json()),
    ]).then(([classesData, studentsData, recordsData]) => {
      setClasses(classesData);
      setStudents(studentsData);
      setRecords(recordsData);
      setLoading(false);
    });
  }, []);
  const roster = students.filter(
    (s) => s.student_class === Number(selectedClass),
  );

  const recordsForDay = records.filter(
    (r) => r.date === date && roster.some((s) => s.id === r.student),
  );

  function statusFor(studentId: number) {
    return recordsForDay.find((r) => r.student === studentId)?.status || null;
  }
  function attendancePercentFor(studentId: number) {
    const studentRecords = records.filter(
      (r) => r.student === studentId && r.status !== "EXCUSED",
    );
    if (studentRecords.length === 0) return null;

    const attended = studentRecords.filter(
      (r) => r.status === "PRESENT" || r.status === "LATE",
    ).length;
    return Math.round((attended / studentRecords.length) * 100);
  }

  const presentCount = recordsForDay.filter(
    (r) => r.status === "PRESENT" || r.status === "LATE",
  ).length;
  const absentCount = recordsForDay.filter((r) => r.status === "ABSENT").length;
  const excusedCount = recordsForDay.filter(
    (r) => r.status === "EXCUSED",
  ).length;
  const unmarkedCount = roster.length - recordsForDay.length;
  const chartData = [
    { name: "Present", value: presentCount, color: "#2C6CC4" },
    { name: "Absent", value: absentCount, color: "#DC2626" },
    { name: "Excused", value: excusedCount, color: "#94A3B8" },
  ].filter((d) => d.value > 0);
  const statusStyles: Record<string, string> = {
    PRESENT: "bg-cobalt/10 text-cobalt",
    LATE: "bg-amber/10 text-amber",
    ABSENT: "bg-danger/10 text-danger",
    EXCUSED: "bg-line text-navy/60",
  };

  if (loading) {
    return <p className="text-sm text-navy/60">Loading attendance data...</p>;
  }

  return (
    <div>
      <h2 className="mb-6 text-xl font-semibold text-navy">Attendance</h2>

      <div className="mb-6 flex flex-wrap items-end gap-4 rounded-lg border border-line bg-white p-4">
        <div>
          <label className="mb-1 block text-sm text-navy/70">Class</label>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
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
      </div>

      {!selectedClass ? (
        <p className="text-sm text-navy/60">
          Select a class to view its attendance.
        </p>
      ) : roster.length === 0 ? (
        <p className="text-sm text-navy/60">No students found in this class.</p>
      ) : (
        <>
          <div className="mb-6 grid grid-cols-4 gap-4">
            <div className="rounded-lg border border-line bg-white p-4">
              <p className="text-xs text-navy/60">Present</p>
              <p className="mt-1 text-2xl font-semibold text-cobalt">
                {presentCount}
              </p>
            </div>
            <div className="rounded-lg border border-line bg-white p-4">
              <p className="text-xs text-navy/60">Absent</p>
              <p className="mt-1 text-2xl font-semibold text-danger">
                {absentCount}
              </p>
            </div>
            <div className="rounded-lg border border-line bg-white p-4">
              <p className="text-xs text-navy/60">Excused</p>
              <p className="mt-1 text-2xl font-semibold text-navy/60">
                {excusedCount}
              </p>
            </div>
            <div className="rounded-lg border border-line bg-white p-4">
              <p className="text-xs text-navy/60">Not Marked</p>
              <p className="mt-1 text-2xl font-semibold text-amber">
                {unmarkedCount}
              </p>
            </div>
          </div>
          {chartData.length > 0 && (
            <div className="mb-6 rounded-lg border border-line bg-white p-4">
              <p className="mb-2 text-sm font-medium text-navy">
                Attendance Breakdown
              </p>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={chartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          <div className="overflow-hidden rounded-lg border border-line bg-white">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-line bg-paper">
                  <th className="px-4 py-3 font-medium text-navy/70">
                    Student
                  </th>
                  <th className="px-4 py-3 font-medium text-navy/70">Status</th>
                  <th className="px-4 py-3 font-medium text-navy/70">
                    Attendance %
                  </th>
                </tr>
              </thead>
              <tbody>
                {roster.map((s) => {
                  const status = statusFor(s.id);
                  return (
                    <tr
                      key={s.id}
                      className="border-b border-line last:border-0"
                    >
                      <td className="px-4 py-3 font-medium text-navy">
                        {s.first_name} {s.last_name}
                      </td>
                      <td className="px-4 py-3">
                        {status ? (
                          <span
                            className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusStyles[status]}`}
                          >
                            {status.charAt(0) + status.slice(1).toLowerCase()}
                          </span>
                        ) : (
                          <span className="text-xs text-navy/40">
                            Not marked
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {attendancePercentFor(s.id) !== null ? (
                          <span className="text-sm font-medium text-navy">
                            {attendancePercentFor(s.id)}%
                          </span>
                        ) : (
                          <span className="text-sm text-navy/40">N/A</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
