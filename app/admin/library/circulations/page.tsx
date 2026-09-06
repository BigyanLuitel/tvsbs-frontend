// app/admin/library/circulations/page.tsx
"use client";

import { useEffect, useState } from "react";

type Book = { id: number; title: string; available_copies: number };
type StudentOption = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  student_class: number;
};
type ClassOption = { id: number; class_name: string; section: string };
type Circulation = {
  id: number;
  book: number;
  book_title: string;
  student: number;
  student_first_name: string;
  student_last_name: string;
  student_email: string;
  issue_date: string;
  due_date: string;
  return_date: string | null;
  is_overdue: boolean;
};

export default function CirculationsPage() {
  const [circulations, setCirculations] = useState<Circulation[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [allStudents, setAllStudents] = useState<StudentOption[]>([]);
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");

  const [showIssue, setShowIssue] = useState(false);
  const [issueForm, setIssueForm] = useState({
    book_id: "",
    student_id: "",
    issue_date: "",
    due_date: "",
  });
  const [issuing, setIssuing] = useState(false);
  const [issueError, setIssueError] = useState("");

  useEffect(() => {
    loadCirculations();
    fetch("/api/library/books")
      .then((res) => res.json())
      .then(setBooks);
    fetch("/api/students")
      .then((res) => res.json())
      .then(setAllStudents);
    fetch("/api/classes")
      .then((res) => res.json())
      .then(setClasses);
  }, []);

  function loadCirculations() {
    setLoading(true);
    fetch("/api/library/circulations")
      .then((res) => res.json())
      .then((data) => {
        setCirculations(data);
        setLoading(false);
      });
  }

  function handleClassChange(value: string) {
    setSelectedClass(value);
    setIssueForm((prev) => ({ ...prev, student_id: "" }));
  }

  function todayStr() {
    return new Date().toISOString().split("T")[0];
  }

  async function handleIssue(e: React.FormEvent) {
    e.preventDefault();
    setIssueError("");

    if (issueForm.due_date < issueForm.issue_date) {
      setIssueError("Due date cannot be before the issue date.");
      return;
    }

    setIssuing(true);

    const res = await fetch("/api/library/circulations/issue", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        book_id: Number(issueForm.book_id),
        student_id: Number(issueForm.student_id),
        issue_date: issueForm.issue_date,
        due_date: issueForm.due_date,
      }),
    });

    setIssuing(false);

    if (!res.ok) {
      const errData = await res.json();
      setIssueError(errData.detail || "Failed to issue book");
      return;
    }

    setIssueForm({ book_id: "", student_id: "", issue_date: "", due_date: "" });
    setSelectedClass("");
    setShowIssue(false);
    loadCirculations();
    fetch("/api/library/books")
      .then((res) => res.json())
      .then(setBooks);
  }

  async function handleReturn(id: number) {
    const res = await fetch(`/api/library/circulations/${id}/return`, {
      method: "POST",
    });
    if (res.ok) {
      loadCirculations();
      fetch("/api/library/books")
        .then((res) => res.json())
        .then(setBooks);
    }
  }

  const filtered = circulations.filter((c) => {
    if (statusFilter === "active") return !c.return_date;
    if (statusFilter === "returned") return !!c.return_date;
    if (statusFilter === "overdue") return c.is_overdue;
    return true;
  });

  const activeCount = circulations.filter((c) => !c.return_date).length;
  const overdueCount = circulations.filter((c) => c.is_overdue).length;
  const studentsInClass = allStudents.filter(
    (s) => s.student_class === Number(selectedClass),
  );

  if (loading) {
    return (
      <div>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <div className="h-6 w-56 animate-pulse rounded bg-line" />
            <div className="mt-2 h-4 w-32 animate-pulse rounded bg-line" />
          </div>
          <div className="h-9 w-28 animate-pulse rounded-md bg-line" />
        </div>

        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {[0, 1].map((i) => (
            <div key={i} className="rounded-lg border border-line bg-white p-4">
              <div className="h-3 w-32 animate-pulse rounded bg-line" />
              <div className="mt-2 h-7 w-12 animate-pulse rounded bg-line" />
            </div>
          ))}
        </div>

        <div className="mb-4 h-9 w-44 animate-pulse rounded-md bg-line" />

        <div className="overflow-x-auto rounded-lg border border-line bg-white">
          <table className="w-full min-w-[750px] text-left text-sm">
            <thead>
              <tr className="border-b border-line bg-paper">
                <th className="px-4 py-3 font-medium text-navy/70">Book</th>
                <th className="px-4 py-3 font-medium text-navy/70">Student</th>
                <th className="px-4 py-3 font-medium text-navy/70">Issued</th>
                <th className="px-4 py-3 font-medium text-navy/70">Due</th>
                <th className="px-4 py-3 font-medium text-navy/70">Status</th>
                <th className="px-4 py-3 font-medium text-navy/70">Actions</th>
              </tr>
            </thead>
            <tbody>
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <tr
                  key={i}
                  className="border-b border-line last:border-0"
                  style={{ animationDelay: `${i * 75}ms` }}
                >
                  <td className="px-4 py-3">
                    <div className="h-4 w-32 animate-pulse rounded bg-line" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="h-4 w-28 animate-pulse rounded bg-line" />
                    <div className="mt-1.5 h-3 w-36 animate-pulse rounded bg-line" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="h-4 w-20 animate-pulse rounded bg-line" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="h-4 w-20 animate-pulse rounded bg-line" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="h-5 w-20 animate-pulse rounded-full bg-line" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="h-4 w-24 animate-pulse rounded bg-line" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-navy">
            Library Circulation
          </h2>
          <p className="text-sm text-navy/60">
            {circulations.length} total transactions
          </p>
        </div>
        <button
          onClick={() => {
            setSelectedClass("");
            setIssueForm({
              book_id: "",
              student_id: "",
              issue_date: todayStr(),
              due_date: "",
            });
            setShowIssue(true);
          }}
          className="rounded-md bg-cobalt px-4 py-2 text-sm font-medium text-white transition hover:bg-cobalt/90"
        >
          Issue Book
        </button>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-line bg-white p-4">
          <p className="text-xs text-navy/60">Currently Checked Out</p>
          <p className="mt-1 text-2xl font-semibold text-cobalt">
            {activeCount}
          </p>
        </div>
        <div className="rounded-lg border border-line bg-white p-4">
          <p className="text-xs text-navy/60">Overdue</p>
          <p className="mt-1 text-2xl font-semibold text-danger">
            {overdueCount}
          </p>
        </div>
      </div>

      <select
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value)}
        className="mb-4 rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-cobalt"
      >
        <option value="">All records</option>
        <option value="active">Currently checked out</option>
        <option value="overdue">Overdue</option>
        <option value="returned">Returned</option>
      </select>

      <div className="overflow-x-auto rounded-lg border border-line bg-white">
        <table className="w-full min-w-[750px] text-left text-sm">
          <thead>
            <tr className="border-b border-line bg-paper">
              <th className="px-4 py-3 font-medium text-navy/70">Book</th>
              <th className="px-4 py-3 font-medium text-navy/70">Student</th>
              <th className="px-4 py-3 font-medium text-navy/70">Issued</th>
              <th className="px-4 py-3 font-medium text-navy/70">Due</th>
              <th className="px-4 py-3 font-medium text-navy/70">Status</th>
              <th className="px-4 py-3 font-medium text-navy/70">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <tr
                key={c.id}
                className="border-b border-line last:border-0 hover:bg-paper"
              >
                <td className="px-4 py-3 font-medium text-navy">
                  {c.book_title}
                </td>
                <td className="px-4 py-3">
                  <div className="font-medium text-navy">
                    {c.student_first_name} {c.student_last_name}
                  </div>
                  <div className="text-xs text-navy/60">{c.student_email}</div>
                </td>
                <td className="px-4 py-3 text-navy/70">{c.issue_date}</td>
                <td className="px-4 py-3 text-navy/70">{c.due_date}</td>
                <td className="px-4 py-3">
                  <span
                    className={`whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium ${
                      c.return_date
                        ? "bg-line text-navy/60"
                        : c.is_overdue
                          ? "bg-danger/10 text-danger"
                          : "bg-cobalt/10 text-cobalt"
                    }`}
                  >
                    {c.return_date
                      ? "Returned"
                      : c.is_overdue
                        ? "Overdue"
                        : "Checked Out"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {!c.return_date && (
                    <button
                      onClick={() => handleReturn(c.id)}
                      className="text-sm text-cobalt hover:underline"
                    >
                      Mark Returned
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showIssue && (
        <div className="fixed inset-0 flex items-center justify-center bg-navy/40 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-lg border border-line bg-white p-6">
            <h3 className="mb-4 text-base font-semibold text-navy">
              Issue Book
            </h3>

            <form onSubmit={handleIssue}>
              {issueError && (
                <p className="mb-4 rounded-md bg-coral/10 px-3 py-2 text-sm text-coral">
                  {issueError}
                </p>
              )}

              <label className="mb-1 block text-sm text-navy/70">Book</label>
              <select
                value={issueForm.book_id}
                onChange={(e) =>
                  setIssueForm((prev) => ({ ...prev, book_id: e.target.value }))
                }
                required
                className="mb-4 w-full rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-cobalt"
              >
                <option value="">Select a book</option>
                {books.map((b) => (
                  <option
                    key={b.id}
                    value={b.id}
                    disabled={b.available_copies === 0}
                  >
                    {b.title} ({b.available_copies} available)
                  </option>
                ))}
              </select>

              <label className="mb-1 block text-sm text-navy/70">Class</label>
              <select
                value={selectedClass}
                onChange={(e) => handleClassChange(e.target.value)}
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

              <label className="mb-1 block text-sm text-navy/70">Student</label>
              <select
                value={issueForm.student_id}
                onChange={(e) =>
                  setIssueForm((prev) => ({
                    ...prev,
                    student_id: e.target.value,
                  }))
                }
                required
                disabled={!selectedClass}
                className="mb-4 w-full rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-cobalt disabled:bg-paper disabled:text-navy/40"
              >
                <option value="">
                  {selectedClass ? "Select a student" : "Select a class first"}
                </option>
                {studentsInClass.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.first_name} {s.last_name} ({s.email})
                  </option>
                ))}
              </select>

              <div className="mb-4 grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-sm text-navy/70">
                    Issue Date
                  </label>
                  <input
                    type="date"
                    value={issueForm.issue_date}
                    onChange={(e) =>
                      setIssueForm((prev) => ({
                        ...prev,
                        issue_date: e.target.value,
                      }))
                    }
                    required
                    className="w-full rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-cobalt"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-navy/70">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={issueForm.due_date}
                    onChange={(e) =>
                      setIssueForm((prev) => ({
                        ...prev,
                        due_date: e.target.value,
                      }))
                    }
                    min={issueForm.issue_date || undefined}
                    required
                    className="w-full rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-cobalt"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowIssue(false)}
                  className="rounded-md px-4 py-2 text-sm font-medium text-navy/70 hover:bg-paper"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={issuing}
                  className="rounded-md bg-cobalt px-4 py-2 text-sm font-medium text-white hover:bg-cobalt/90 disabled:opacity-50"
                >
                  {issuing ? "Issuing..." : "Issue"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
