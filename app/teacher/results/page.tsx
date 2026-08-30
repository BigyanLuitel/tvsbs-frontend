// app/teacher/results/page.tsx
"use client";

import { useState, useEffect } from "react";

type ClassOption = { id: number; class_name: string; section: string };
type SubjectOption = { id: number; subject_name: string };
type ExamOption = {
  id: number;
  term: number;
  term_display: string;
  academic_year: string;
  is_final: boolean;
};
type Student = {
  id: number;
  first_name: string;
  last_name: string;
  student_class: number;
};
type ResultRow = {
  id: number;
  student: number;
  subject: number;
  examination: number;
  marks_obtained: string;
  full_marks: string;
};

export default function TeacherResultsPage() {
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [subjects, setSubjects] = useState<SubjectOption[]>([]);
  const [exams, setExams] = useState<ExamOption[]>([]);
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [existingResults, setExistingResults] = useState<ResultRow[]>([]);

  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedExam, setSelectedExam] = useState("");
  const [marks, setMarks] = useState<Record<number, string>>({});
  const [fullMarks, setFullMarks] = useState("100");

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/classes")
      .then((res) => res.json())
      .then(setClasses);
    fetch("/api/subjects")
      .then((res) => res.json())
      .then(setSubjects);
    fetch("/api/examinations")
      .then((res) => res.json())
      .then((data) => setExams(data.filter((e: ExamOption) => !e.is_final)));
    fetch("/api/students")
      .then((res) => res.json())
      .then(setAllStudents);
    fetch("/api/results")
      .then((res) => res.json())
      .then(setExistingResults);
  }, []);

  const roster = allStudents.filter(
    (s) => s.student_class === Number(selectedClass),
  );

  useEffect(() => {
    if (!selectedSubject || !selectedExam) return;
    const preFilled: Record<number, string> = {};
    roster.forEach((s) => {
      const existing = existingResults.find(
        (r) =>
          r.student === s.id &&
          r.subject === Number(selectedSubject) &&
          r.examination === Number(selectedExam),
      );
      if (existing) preFilled[s.id] = existing.marks_obtained;
    });
    setMarks(preFilled);
  }, [selectedClass, selectedSubject, selectedExam, existingResults]);

  function updateMark(studentId: number, value: string) {
    setMarks((prev) => ({ ...prev, [studentId]: value }));
  }
  async function handleSubmit() {
    if (!selectedClass || !selectedSubject || !selectedExam) return;
    setSubmitting(true);
    setError("");
    setSuccess("");

    let successCount = 0;
    let failCount = 0;

    for (const student of roster) {
      const markValue = marks[student.id];
      if (markValue === undefined || markValue === "") continue;

      const existing = existingResults.find(
        (r) =>
          r.student === student.id &&
          r.subject === Number(selectedSubject) &&
          r.examination === Number(selectedExam),
      );

      const payload = {
        student: student.id,
        subject: Number(selectedSubject),
        examination: Number(selectedExam),
        marks_obtained: markValue,
        full_marks: fullMarks,
      };

      const res = existing
        ? await fetch(`/api/results/${existing.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              marks_obtained: markValue,
              full_marks: fullMarks,
            }),
          })
        : await fetch("/api/results", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });

      if (res.ok) successCount++;
      else failCount++;
    }

    setSubmitting(false);
    setSuccess(
      `Saved ${successCount} result(s).${failCount ? ` ${failCount} failed.` : ""}`,
    );

    fetch("/api/results")
      .then((res) => res.json())
      .then(setExistingResults);
  }

  const passStyle = (mark: string) => {
    const pct = fullMarks ? (Number(mark) / Number(fullMarks)) * 100 : 0;
    if (!mark) return "";
    return pct >= 40 ? "border-cobalt" : "border-danger";
  };

  return (
    <div>
      <h2 className="mb-6 text-xl font-semibold text-navy">Enter Marks</h2>

      <div className="mb-6 flex flex-wrap items-end gap-4 rounded-lg border border-line bg-white p-4">
        <div>
          <label className="mb-1 block text-sm text-navy/70">Class</label>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-cobalt"
          >
            <option value="">Select class</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.class_name} {c.section}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm text-navy/70">Subject</label>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-cobalt"
          >
            <option value="">Select subject</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.subject_name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm text-navy/70">Examination</label>
          <select
            value={selectedExam}
            onChange={(e) => setSelectedExam(e.target.value)}
            className="rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-cobalt"
          >
            <option value="">Select exam</option>
            {exams.map((e) => (
              <option key={e.id} value={e.id}>
                {e.term_display} ({e.academic_year})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm text-navy/70">Full Marks</label>
          <input
            type="number"
            value={fullMarks}
            onChange={(e) => setFullMarks(e.target.value)}
            className="w-24 rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-cobalt"
          />
        </div>
      </div>

      {error && (
        <p className="mb-4 rounded-md bg-coral/10 px-3 py-2 text-sm text-coral">
          {error}
        </p>
      )}
      {success && (
        <p className="mb-4 rounded-md bg-cobalt/10 px-3 py-2 text-sm text-cobalt">
          {success}
        </p>
      )}

      {!selectedClass || !selectedSubject || !selectedExam ? (
        <p className="text-sm text-navy/60">
          Select a class, subject, and examination to enter marks.
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
                  <th className="px-4 py-3 font-medium text-navy/70">
                    Marks Obtained
                  </th>
                </tr>
              </thead>
              <tbody>
                {roster.map((s) => (
                  <tr key={s.id} className="border-b border-line last:border-0">
                    <td className="px-4 py-3 font-medium text-navy">
                      {s.first_name} {s.last_name}
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        step="0.01"
                        value={marks[s.id] || ""}
                        onChange={(e) => updateMark(s.id, e.target.value)}
                        className={`w-28 rounded-md border px-3 py-1.5 text-sm outline-none focus:border-cobalt ${passStyle(marks[s.id] || "")}`}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="mt-4 rounded-md bg-cobalt px-4 py-2 text-sm font-medium text-white transition hover:bg-cobalt/90 disabled:opacity-50"
          >
            {submitting ? "Saving..." : "Save Marks"}
          </button>
        </>
      )}
    </div>
  );
}
