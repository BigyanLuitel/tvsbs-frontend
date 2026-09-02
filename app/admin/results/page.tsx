// app/admin/results/page.tsx
"use client";

import { useState, useEffect } from "react";

type ClassOption = { id: number; class_name: string; section: string };
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
  student_email: string;
  subject: number;
  subject_name: string;
  examination: number;
  marks_obtained: string;
  full_marks: string;
  grade: string;
  passed: boolean;
};

export default function AdminResultsPage() {
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [exams, setExams] = useState<ExamOption[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [results, setResults] = useState<ResultRow[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedClass, setSelectedClass] = useState("");
  const [selectedExam, setSelectedExam] = useState("");

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState("");
  const [attendance, setAttendance] = useState<
    { student: number; status: string }[]
  >([]);

  const [isPublished, setIsPublished] = useState(false);
  const [publishLoading, setPublishLoading] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/classes").then((res) => res.json()),
      fetch("/api/examinations").then((res) => res.json()),
      fetch("/api/students").then((res) => res.json()),
      fetch("/api/results").then((res) => res.json()),
      fetch("/api/attendance").then((res) => res.json()),
    ]).then(
      ([classesData, examsData, studentsData, resultsData, attendanceData]) => {
        setClasses(classesData);
        setExams(examsData);
        setStudents(studentsData);
        setResults(resultsData);
        setAttendance(attendanceData);
        setLoading(false);
      },
    );
  }, []);

  useEffect(() => {
    if (!selectedClass || !selectedExam) return;
    fetch(
      `/api/results/publication-status?examination_id=${selectedExam}&class_id=${selectedClass}`,
    )
      .then((res) => res.json())
      .then((data) => setIsPublished(data.published));
  }, [selectedClass, selectedExam]);

  const roster = students.filter(
    (s) => s.student_class === Number(selectedClass),
  );
  const rosterIds = roster.map((s) => s.id);
  const classResults = results.filter(
    (r) =>
      rosterIds.includes(r.student) && r.examination === Number(selectedExam),
  );
  const subjectNames = Array.from(
    new Set(classResults.map((r) => r.subject_name)),
  ).sort();

  const pivoted = roster.map((student) => {
    const studentResults = classResults.filter((r) => r.student === student.id);
    const marksBySubject: Record<string, ResultRow | undefined> = {};
    subjectNames.forEach((name) => {
      marksBySubject[name] = studentResults.find(
        (r) => r.subject_name === name,
      );
    });

    const totalObtained = studentResults.reduce(
      (sum, r) => sum + Number(r.marks_obtained),
      0,
    );
    const totalFull = studentResults.reduce(
      (sum, r) => sum + Number(r.full_marks),
      0,
    );
    const overallPercent =
      totalFull > 0 ? Math.round((totalObtained / totalFull) * 100) : null;
    const allPassed =
      studentResults.length > 0 && studentResults.every((r) => r.passed);

    return {
      student,
      marksBySubject,
      overallPercent,
      allPassed,
      hasResults: studentResults.length > 0,
    };
  });

  function attendancePercentFor(studentId: number) {
    const studentRecords = attendance.filter(
      (a) => a.student === studentId && a.status !== "EXCUSED",
    );
    if (studentRecords.length === 0) return null;
    const attended = studentRecords.filter(
      (a) => a.status === "PRESENT" || a.status === "LATE",
    ).length;
    return Math.round((attended / studentRecords.length) * 100);
  }

  async function togglePublish() {
    setPublishLoading(true);
    const endpoint = isPublished
      ? "/api/results/unpublish"
      : "/api/results/publish";

    await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        examination_id: Number(selectedExam),
        class_id: Number(selectedClass),
      }),
    });

    setIsPublished(!isPublished);
    setPublishLoading(false);
  }

  async function handleGenerate() {
    setGenerating(true);
    setGenError("");
    setPreviewUrl(null);

    const params = new URLSearchParams({
      examination_id: selectedExam,
      class_id: selectedClass,
      academic_year:
        exams.find((e) => e.id === Number(selectedExam))?.academic_year || "",
    });

    const res = await fetch(`/api/results/marksheets?${params.toString()}`);

    setGenerating(false);

    if (!res.ok) {
      const errData = await res.json();
      setGenError(errData.detail || "Failed to generate marksheets");
      return;
    }

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    setPreviewUrl(url);
  }

  if (loading) {
    return <p className="text-sm text-navy/60">Loading results data...</p>;
  }

  const passCount = pivoted.filter((p) => p.hasResults && p.allPassed).length;
  const failCount = pivoted.filter((p) => p.hasResults && !p.allPassed).length;

  return (
    <div>
      <h2 className="mb-6 text-xl font-semibold text-navy">Results</h2>

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

        {selectedClass && selectedExam && (
          <>
            <button
              onClick={togglePublish}
              disabled={publishLoading}
              className={`rounded-md px-4 py-2 text-sm font-medium transition disabled:opacity-50 ${
                isPublished
                  ? "border border-danger text-danger hover:bg-danger/10"
                  : "bg-cobalt text-white hover:bg-cobalt/90"
              }`}
            >
              {publishLoading
                ? "..."
                : isPublished
                  ? "Unpublish Results"
                  : "Publish Results"}
            </button>
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="rounded-md bg-cobalt px-4 py-2 text-sm font-medium text-white transition hover:bg-cobalt/90 disabled:opacity-50"
            >
              {generating ? "Generating..." : "Generate Marksheets"}
            </button>
          </>
        )}
      </div>

      {selectedClass && selectedExam && (
        <p className="mb-4 text-sm">
          Status:{" "}
          <span
            className={
              isPublished ? "font-medium text-cobalt" : "font-medium text-amber"
            }
          >
            {isPublished ? "Published to students" : "Not published"}
          </span>
        </p>
      )}

      {genError && (
        <p className="mb-4 rounded-md bg-coral/10 px-3 py-2 text-sm text-coral">
          {genError}
        </p>
      )}

      {!selectedClass || !selectedExam ? (
        <p className="text-sm text-navy/60">
          Select a class and examination to view results.
        </p>
      ) : (
        <>
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-line bg-white p-4">
              <p className="text-xs text-navy/60">Passed</p>
              <p className="mt-1 text-2xl font-semibold text-cobalt">
                {passCount}
              </p>
            </div>
            <div className="rounded-lg border border-line bg-white p-4">
              <p className="text-xs text-navy/60">Failed</p>
              <p className="mt-1 text-2xl font-semibold text-danger">
                {failCount}
              </p>
            </div>
          </div>

          <div className="overflow-x-auto rounded-lg border border-line bg-white">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead>
                <tr className="border-b border-line bg-paper">
                  <th className="px-4 py-3 font-medium text-navy/70">
                    Student
                  </th>
                  {subjectNames.map((name) => (
                    <th
                      key={name}
                      className="px-4 py-3 font-medium text-navy/70"
                    >
                      {name}
                    </th>
                  ))}
                  <th className="px-4 py-3 font-medium text-navy/70">
                    Attendance
                  </th>
                  <th className="px-4 py-3 font-medium text-navy/70">
                    Overall %
                  </th>
                  <th className="px-4 py-3 font-medium text-navy/70">Status</th>
                </tr>
              </thead>
              <tbody>
                {pivoted.map(
                  ({
                    student,
                    marksBySubject,
                    overallPercent,
                    allPassed,
                    hasResults,
                  }) => {
                    const attPct = attendancePercentFor(student.id);
                    return (
                      <tr
                        key={student.id}
                        className="border-b border-line last:border-0"
                      >
                        <td className="px-4 py-3 font-medium text-navy">
                          {student.first_name} {student.last_name}
                        </td>
                        {subjectNames.map((name) => {
                          const r = marksBySubject[name];
                          return (
                            <td key={name} className="px-4 py-3 text-navy/70">
                              {r ? (
                                `${r.marks_obtained}/${r.full_marks}`
                              ) : (
                                <span className="text-navy/30">—</span>
                              )}
                            </td>
                          );
                        })}
                        <td className="px-4 py-3">
                          {attPct === null ? (
                            <span className="text-navy/30">—</span>
                          ) : (
                            <span
                              className={
                                attPct >= 75
                                  ? "text-cobalt"
                                  : attPct >= 50
                                    ? "text-amber"
                                    : "text-danger"
                              }
                            >
                              {attPct}%
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 font-medium text-navy">
                          {overallPercent !== null ? (
                            `${overallPercent}%`
                          ) : (
                            <span className="text-navy/30">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {hasResults ? (
                            <span
                              className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                                allPassed
                                  ? "bg-cobalt/10 text-cobalt"
                                  : "bg-danger/10 text-danger"
                              }`}
                            >
                              {allPassed ? "Pass" : "Fail"}
                            </span>
                          ) : (
                            <span className="text-navy/30">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  },
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {previewUrl && (
        <div className="fixed inset-0 flex items-center justify-center bg-navy/40 backdrop-blur-sm p-6">
          <div className="flex h-full w-full max-w-3xl flex-col rounded-lg border border-line bg-white p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-base font-semibold text-navy">
                Marksheet Preview
              </h3>
              <div className="flex gap-3">
                <a
                  href={previewUrl}
                  download="marksheets.pdf"
                  className="rounded-md bg-cobalt px-4 py-2 text-sm font-medium text-white hover:bg-cobalt/90"
                >
                  Download
                </a>
                <button
                  onClick={() => {
                    URL.revokeObjectURL(previewUrl);
                    setPreviewUrl(null);
                  }}
                  className="rounded-md border border-line px-4 py-2 text-sm font-medium text-navy/70 hover:bg-paper"
                >
                  Close
                </button>
              </div>
            </div>
            <iframe
              src={previewUrl}
              className="flex-1 rounded-md border border-line"
            />
          </div>
        </div>
      )}
    </div>
  );
}
