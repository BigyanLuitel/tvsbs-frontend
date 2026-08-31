// app/student/attendance/page.tsx
"use client";

import { useEffect, useState } from "react";

type AttendanceRecord = { id: number; date: string; status: string };

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export default function StudentAttendancePage() {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedMonthNum, setSelectedMonthNum] = useState("");

  useEffect(() => {
    fetch("/api/attendance/me")
      .then((res) => res.json())
      .then((data) => {
        setRecords(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load attendance");
        setLoading(false);
      });
  }, []);

  const availableYears = Array.from(
    new Set(records.map((r) => r.date.slice(0, 4))),
  )
    .sort()
    .reverse();

  const monthsInSelectedYear = Array.from(
    new Set(
      records
        .filter((r) => r.date.slice(0, 4) === selectedYear)
        .map((r) => r.date.slice(5, 7)),
    ),
  ).sort();

  useEffect(() => {
    if (availableYears.length > 0 && !selectedYear) {
      setSelectedYear(availableYears[0]);
    }
  }, [records]);

  useEffect(() => {
    if (
      monthsInSelectedYear.length > 0 &&
      (!selectedMonthNum || !monthsInSelectedYear.includes(selectedMonthNum))
    ) {
      setSelectedMonthNum(
        monthsInSelectedYear[monthsInSelectedYear.length - 1],
      );
    }
  }, [selectedYear, records]);

  const filteredRecords = records.filter(
    (r) =>
      r.date.slice(0, 4) === selectedYear &&
      r.date.slice(5, 7) === selectedMonthNum,
  );

  if (loading) {
    return <p className="text-sm text-navy/60">Loading your attendance...</p>;
  }
  if (error) {
    return <p className="text-sm text-coral">{error}</p>;
  }

  const nonExcused = filteredRecords.filter((r) => r.status !== "EXCUSED");
  const attended = nonExcused.filter(
    (r) => r.status === "PRESENT" || r.status === "LATE",
  ).length;
  const overallPercent =
    nonExcused.length > 0
      ? Math.round((attended / nonExcused.length) * 100)
      : null;
  const presentCount = filteredRecords.filter(
    (r) => r.status === "PRESENT",
  ).length;
  const absentCount = filteredRecords.filter(
    (r) => r.status === "ABSENT",
  ).length;
  const lateCount = filteredRecords.filter((r) => r.status === "LATE").length;

  const statusStyles: Record<string, string> = {
    PRESENT: "bg-cobalt/10 text-cobalt",
    LATE: "bg-amber/10 text-amber",
    ABSENT: "bg-danger/10 text-danger",
    EXCUSED: "bg-line text-navy/60",
  };

  return (
    <div>
      <h2 className="mb-6 text-xl font-semibold text-navy">My Attendance</h2>

      <div className="mb-4 flex gap-3">
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
          className="rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-cobalt"
        >
          {availableYears.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>

        <select
          value={selectedMonthNum}
          onChange={(e) => setSelectedMonthNum(e.target.value)}
          className="rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-cobalt"
        >
          {monthsInSelectedYear.map((m) => (
            <option key={m} value={m}>
              {MONTH_NAMES[Number(m) - 1]}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-6 grid grid-cols-4 gap-4">
        <div className="rounded-lg border border-line bg-white p-4">
          <p className="text-xs text-navy/60">Overall</p>
          <p
            className={`mt-1 text-2xl font-semibold ${
              overallPercent !== null && overallPercent >= 75
                ? "text-cobalt"
                : overallPercent !== null && overallPercent >= 50
                  ? "text-amber"
                  : "text-danger"
            }`}
          >
            {overallPercent !== null ? `${overallPercent}%` : "—"}
          </p>
        </div>
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
          <p className="text-xs text-navy/60">Late</p>
          <p className="mt-1 text-2xl font-semibold text-amber">{lateCount}</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-line bg-white">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-line bg-paper">
              <th className="px-4 py-3 font-medium text-navy/70">Date</th>
              <th className="px-4 py-3 font-medium text-navy/70">Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredRecords.map((r) => (
              <tr key={r.id} className="border-b border-line last:border-0">
                <td className="px-4 py-3 text-navy">{r.date}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusStyles[r.status]}`}
                  >
                    {r.status.charAt(0) + r.status.slice(1).toLowerCase()}
                  </span>
                </td>
              </tr>
            ))}
            {filteredRecords.length === 0 && (
              <tr>
                <td
                  colSpan={2}
                  className="px-4 py-6 text-center text-sm text-navy/40"
                >
                  No attendance records for this month.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
