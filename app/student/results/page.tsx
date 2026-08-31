// app/student/results/page.tsx
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

type Result = {
  id: number;
  subject_name: string;
  examination: number;
  examination_display: string;
  marks_obtained: string;
  full_marks: string;
  grade: string;
  grade_point: string;
  passed: boolean;
};

type StudentProfile = {
  first_name: string;
  last_name: string;
  student_class: number;
  date_of_birth: string;
  gender: string;
  parent_name: string;
  parent_contact: string;
  roll_number?: string;
};

export default function StudentResultsPage() {
  const [results, setResults] = useState<Result[]>([]);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedExam, setSelectedExam] = useState("");

  useEffect(() => {
    Promise.all([
      fetch("/api/results/me").then((res) => res.json()),
      fetch("/api/students/me").then((res) => res.json()),
    ])
      .then(([resultsData, profileData]) => {
        setResults(resultsData);
        setProfile(profileData);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load results");
        setLoading(false);
      });
  }, []);

  const examOptions = Array.from(
    new Map(
      results.map((r) => [r.examination, r.examination_display]),
    ).entries(),
  );

  useEffect(() => {
    if (examOptions.length > 0 && !selectedExam) {
      setSelectedExam(String(examOptions[examOptions.length - 1][0]));
    }
  }, [results]);

  const filteredResults = results.filter(
    (r) => r.examination === Number(selectedExam),
  );
  filteredResults.length > 0 && filteredResults.every((r) => r.passed);

  if (loading) {
    return <p className="text-sm text-navy/60">Loading your results...</p>;
  }
  if (error) {
    return <p className="text-sm text-coral">{error}</p>;
  }

  const totalObtained = filteredResults.reduce(
    (sum, r) => sum + Number(r.marks_obtained),
    0,
  );
  const totalFull = filteredResults.reduce(
    (sum, r) => sum + Number(r.full_marks),
    0,
  );
  const overallPercent =
    totalFull > 0 ? Math.round((totalObtained / totalFull) * 100) : null;
  const avgGpa =
    filteredResults.length > 0
      ? (
          filteredResults.reduce((sum, r) => sum + Number(r.grade_point), 0) /
          filteredResults.length
        ).toFixed(2)
      : null;
  const allPassed =
    filteredResults.length > 0 && filteredResults.every((r) => r.passed);

  const GRADE_LEGEND = [
    ["90 - 100", "4.0", "A+"],
    ["80 - 89", "3.6", "A"],
    ["70 - 79", "3.2", "B+"],
    ["60 - 69", "2.8", "B"],
    ["50 - 59", "2.4", "C+"],
    ["40 - 49", "2.0", "C"],
    ["Below 40", "0.0", "NG"],
  ];

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-navy">My Marksheet</h2>
        <select
          value={selectedExam}
          onChange={(e) => setSelectedExam(e.target.value)}
          className="rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-cobalt"
        >
          {examOptions.map(([id, label]) => (
            <option key={id} value={id}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {filteredResults.length === 0 ? (
        <p className="text-sm text-navy/60">
          No results available for this examination.
        </p>
      ) : (
        <div className="rounded-lg border border-line bg-white p-8">
          <div className="mb-6 flex items-center gap-4 border-b border-line pb-6">
            <div className="rounded-full bg-cobalt/10 p-2">
              <Image
                src="/logo3.png"
                alt="TVSBS crest"
                width={56}
                height={56}
              />
            </div>
            <div className="text-center flex-1">
              <h1 className="font-display text-lg font-semibold text-navy">
                Tamor Valley Secondary Boarding School
              </h1>
              <p className="text-sm text-navy/60">Dhankuta, Nepal</p>
              <p className="mt-1 text-sm font-medium text-cobalt">
                {examOptions.find(([id]) => id === Number(selectedExam))?.[1]}{" "}
                Marksheet
              </p>
            </div>
          </div>

          {profile && (
            <div className="mb-6 grid grid-cols-3 gap-x-6 gap-y-2 rounded-md border border-line bg-paper p-4 text-sm">
              <p>
                <span className="font-medium text-navy">Name:</span>{" "}
                <span className="text-navy/70">
                  {profile.first_name} {profile.last_name}
                </span>
              </p>
              <p>
                <span className="font-medium text-navy">Gender:</span>{" "}
                <span className="text-navy/70">{profile.gender}</span>
              </p>
              <p>
                <span className="font-medium text-navy">Date of Birth:</span>{" "}
                <span className="text-navy/70">{profile.date_of_birth}</span>
              </p>
              <p>
                <span className="font-medium text-navy">Parent Name:</span>{" "}
                <span className="text-navy/70">{profile.parent_name}</span>
              </p>
              <p>
                <span className="font-medium text-navy">Parent Contact:</span>{" "}
                <span className="text-navy/70">{profile.parent_contact}</span>
              </p>
            </div>
          )}

          <div className="mb-6 overflow-hidden rounded-md border border-line">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-cobalt text-white">
                  <th className="px-4 py-3 font-medium">Subject</th>
                  <th className="px-4 py-3 font-medium">Marks</th>
                  <th className="px-4 py-3 font-medium">Grade</th>
                  <th className="px-4 py-3 font-medium">Grade Point</th>
                  <th className="px-4 py-3 font-medium">Remarks</th>
                </tr>
              </thead>
              <tbody>
                {filteredResults.map((r) => (
                  <tr key={r.id} className="border-b border-line last:border-0">
                    <td className="px-4 py-3 font-medium text-navy">
                      {r.subject_name}
                    </td>
                    <td className="px-4 py-3 text-navy/70">
                      {r.marks_obtained}/{r.full_marks}
                    </td>
                    <td className="px-4 py-3 text-navy">{r.grade}</td>
                    <td className="px-4 py-3 text-navy/70">{r.grade_point}</td>
                    <td className="px-4 py-3">
                      <span
                        className={r.passed ? "text-cobalt" : "text-danger"}
                      >
                        {r.passed ? "Pass" : "Fail"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mb-6 rounded-md border border-line bg-paper py-3 text-center">
            <span className="font-semibold text-navy">
              Grade Point Average: {avgGpa}
            </span>
            <span className="mx-2 text-navy/30">|</span>
            <span
              className={`font-semibold ${allPassed ? "text-cobalt" : "text-danger"}`}
            >
              Overall: {overallPercent}% ({allPassed ? "Pass" : "Fail"})
            </span>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="overflow-hidden rounded-md border border-line">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-paper">
                    <th className="px-3 py-2 font-medium text-navy/70">
                      Mark Range
                    </th>
                    <th className="px-3 py-2 font-medium text-navy/70">GPA</th>
                    <th className="px-3 py-2 font-medium text-navy/70">
                      Grade
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {GRADE_LEGEND.map(([range, gpa, grade]) => (
                    <tr key={grade} className="border-t border-line">
                      <td className="px-3 py-1.5 text-navy/70">{range}</td>
                      <td className="px-3 py-1.5 text-navy/70">{gpa}</td>
                      <td className="px-3 py-1.5 text-navy">{grade}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col items-center justify-center rounded-md border border-line bg-paper p-4 text-center">
              <p className="text-xs text-navy/60">Final Standing</p>
              <p
                className={`mt-1 text-3xl font-semibold ${allPassed ? "text-cobalt" : "text-danger"}`}
              >
                {allPassed ? "PASS" : "FAIL"}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
