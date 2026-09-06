// app/admin/reports/page.tsx
"use client";

import { useEffect, useState } from "react";

type ClassOption = { id: number; class_name: string; section: string };

type AttendanceRow = {
  student_id: number;
  email: string;
  attendance_percentage: number;
};
type FeeRow = { student_id: number; email: string; total_outstanding: number };
type AcademicRow = { student_id: number; email: string; gpa: number | null };

type Report = {
  id: number;
  report_type: "ATTENDANCE_SUMMARY" | "FEE_SUMMARY" | "ACADEMIC_SUMMARY";
  report_type_display: string;
  generated_by_email: string | null;
  class_name: string | null;
  date_from: string | null;
  date_to: string | null;
  generated_at: string;
  data: (AttendanceRow | FeeRow | AcademicRow)[];
};

const REPORT_TYPES = [
  { value: "ATTENDANCE_SUMMARY", label: "Attendance Summary" },
  { value: "FEE_SUMMARY", label: "Fee Summary" },
  { value: "ACADEMIC_SUMMARY", label: "Academic Summary" },
];

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const [form, setForm] = useState({
    report_type: "ATTENDANCE_SUMMARY",
    class_id: "",
    date_from: "",
    date_to: "",
    academic_year: "",
  });
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState("");

  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  useEffect(() => {
    loadReports();
    fetch("/api/classes")
      .then((res) => res.json())
      .then(setClasses);
  }, []);

  function loadReports() {
    setLoading(true);
    fetch("/api/reports")
      .then((res) => res.json())
      .then((data) => {
        setReports(
          [...data].sort(
            (a, b) =>
              new Date(b.generated_at).getTime() -
              new Date(a.generated_at).getTime(),
          ),
        );
        setLoading(false);
      });
  }

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    setGenError("");
    setGenerating(true);

    const payload: Record<string, string> = {
      report_type: form.report_type,
    };
    if (form.class_id) payload.class_id = form.class_id;
    if (form.report_type === "ATTENDANCE_SUMMARY") {
      payload.date_from = form.date_from;
      payload.date_to = form.date_to;
    }
    if (form.report_type === "ACADEMIC_SUMMARY") {
      payload.academic_year = form.academic_year;
    }

    const res = await fetch("/api/reports/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setGenerating(false);

    if (!res.ok) {
      const errData = await res.json();
      setGenError(errData.detail || "Failed to generate report");
      return;
    }

    const created = await res.json();
    setExpandedId(created.id);
    loadReports();
  }

  async function confirmDelete() {
    if (confirmDeleteId === null) return;
    const id = confirmDeleteId;
    setConfirmDeleteId(null);

    const res = await fetch(`/api/reports/${id}`, { method: "DELETE" });
    if (res.ok) {
      setReports((prev) => prev.filter((r) => r.id !== id));
      if (expandedId === id) setExpandedId(null);
    }
  }

  function renderReportTable(report: Report) {
    if (report.report_type === "ATTENDANCE_SUMMARY") {
      const rows = report.data as AttendanceRow[];
      return (
        <table className="w-full min-w-[400px] text-left text-sm">
          <thead>
            <tr className="border-b border-line bg-paper">
              <th className="px-4 py-2 font-medium text-navy/70">Student</th>
              <th className="px-4 py-2 font-medium text-navy/70">
                Attendance %
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr
                key={r.student_id}
                className="border-b border-line last:border-0"
              >
                <td className="px-4 py-2 text-navy">{r.email}</td>
                <td className="px-4 py-2">
                  <span
                    className={
                      r.attendance_percentage >= 75
                        ? "text-cobalt"
                        : r.attendance_percentage >= 50
                          ? "text-amber"
                          : "text-danger"
                    }
                  >
                    {r.attendance_percentage}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    }

    if (report.report_type === "FEE_SUMMARY") {
      const rows = report.data as FeeRow[];
      return (
        <table className="w-full min-w-[400px] text-left text-sm">
          <thead>
            <tr className="border-b border-line bg-paper">
              <th className="px-4 py-2 font-medium text-navy/70">Student</th>
              <th className="px-4 py-2 font-medium text-navy/70">
                Outstanding
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr
                key={r.student_id}
                className="border-b border-line last:border-0"
              >
                <td className="px-4 py-2 text-navy">{r.email}</td>
                <td className="px-4 py-2 font-medium text-danger">
                  Rs. {r.total_outstanding.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    }

    const rows = report.data as AcademicRow[];
    return (
      <table className="w-full min-w-[400px] text-left text-sm">
        <thead>
          <tr className="border-b border-line bg-paper">
            <th className="px-4 py-2 font-medium text-navy/70">Student</th>
            <th className="px-4 py-2 font-medium text-navy/70">GPA</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr
              key={r.student_id}
              className="border-b border-line last:border-0"
            >
              <td className="px-4 py-2 text-navy">{r.email}</td>
              <td className="px-4 py-2 text-navy">
                {r.gpa !== null ? (
                  r.gpa.toFixed(2)
                ) : (
                  <span className="text-navy/30">Not computed</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  if (loading) {
    return <p className="text-sm text-navy/60">Loading reports...</p>;
  }

  return (
    <div>
      <h2 className="mb-6 text-xl font-semibold text-navy">Reports</h2>

      <form
        onSubmit={handleGenerate}
        className="mb-6 rounded-lg border border-line bg-white p-4"
      >
        {genError && (
          <p className="mb-4 rounded-md bg-coral/10 px-3 py-2 text-sm text-coral">
            {genError}
          </p>
        )}

        <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
          <div>
            <label className="mb-1 block text-sm text-navy/70">
              Report Type
            </label>
            <select
              value={form.report_type}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, report_type: e.target.value }))
              }
              className="w-full rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-cobalt"
            >
              {REPORT_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-navy/50">
              {form.report_type === "ATTENDANCE_SUMMARY" &&
                "Each student's attendance % over the date range you pick."}
              {form.report_type === "FEE_SUMMARY" &&
                "Each student's total unpaid fee amount, as of right now."}
              {form.report_type === "ACADEMIC_SUMMARY" &&
                "Each student's GPA for the academic year you specify (requires Final results already computed)."}
            </p>
          </div>

          <div>
            <label className="mb-1 block text-sm text-navy/70">
              Class (optional)
            </label>
            <select
              value={form.class_id}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, class_id: e.target.value }))
              }
              className="w-full rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-cobalt"
            >
              <option value="">All classes</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.class_name} {c.section}
                </option>
              ))}
            </select>
          </div>

          {form.report_type === "ATTENDANCE_SUMMARY" && (
            <>
              <div>
                <label className="mb-1 block text-sm text-navy/70">From</label>
                <input
                  type="date"
                  value={form.date_from}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, date_from: e.target.value }))
                  }
                  required
                  className="w-full rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-cobalt"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-navy/70">To</label>
                <input
                  type="date"
                  value={form.date_to}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, date_to: e.target.value }))
                  }
                  required
                  className="w-full rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-cobalt"
                />
              </div>
            </>
          )}

          {form.report_type === "ACADEMIC_SUMMARY" && (
            <div>
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
                className="w-full rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-cobalt"
              />
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={generating}
          className="rounded-md bg-cobalt px-4 py-2 text-sm font-medium text-white transition hover:bg-cobalt/90 disabled:opacity-50"
        >
          {generating ? "Generating..." : "Generate Report"}
        </button>
      </form>

      {reports.length === 0 ? (
        <p className="text-sm text-navy/60">No reports generated yet.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {reports.map((r) => (
            <div key={r.id} className="rounded-lg border border-line bg-white">
              <div className="flex flex-wrap items-center justify-between gap-2 p-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-cobalt/10 px-2 py-0.5 text-xs font-medium text-cobalt">
                      {r.report_type_display}
                    </span>
                    <span className="text-sm font-medium text-navy">
                      {r.class_name ? `for ${r.class_name}` : "for all classes"}
                      {" · "}
                      {r.data.length} student{r.data.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-navy/50">
                    Generated {new Date(r.generated_at).toLocaleString()}
                    {r.generated_by_email && ` by ${r.generated_by_email}`}
                    {r.date_from && ` · ${r.date_from} to ${r.date_to}`}
                  </p>
                </div>
                <div className="flex gap-3 text-sm">
                  <button
                    onClick={() =>
                      setExpandedId(expandedId === r.id ? null : r.id)
                    }
                    className="text-cobalt hover:underline"
                  >
                    {expandedId === r.id ? "Hide" : "View"}
                  </button>
                  <button
                    onClick={() => setConfirmDeleteId(r.id)}
                    className="text-danger hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </div>

              {expandedId === r.id && (
                <div className="overflow-x-auto border-t border-line">
                  {r.data.length === 0 ? (
                    <p className="p-4 text-sm text-navy/50">
                      No students matched this report's criteria.
                    </p>
                  ) : (
                    renderReportTable(r)
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {confirmDeleteId !== null && (
        <div className="fixed inset-0 flex items-center justify-center bg-navy/40 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-lg border border-line bg-white p-6">
            <h3 className="mb-2 text-base font-semibold text-navy">
              Delete report?
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
