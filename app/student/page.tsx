// app/student/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Profile = {
  first_name: string;
  last_name: string;
  email: string;
  student_class: number;
  roll_number: string | null;
  date_of_birth: string;
  gender: string;
  parent_name: string;
  parent_contact: string;
  photo: string | null;
};
type AttendanceRecord = { date: string; status: string };
type Result = {
  examination: number;
  examination_display: string;
  marks_obtained: string;
  full_marks: string;
  passed: boolean;
};
type Invoice = { outstanding: string; status: string };

export default function StudentHomePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [results, setResults] = useState<Result[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/students/me").then((res) => res.json()),
      fetch("/api/attendance/me").then((res) => res.json()),
      fetch("/api/results/me").then((res) => res.json()),
      fetch("/api/fees/invoices/me").then((res) => res.json()),
    ]).then(([profileData, attendanceData, resultsData, invoicesData]) => {
      setProfile(profileData);
      setAttendance(attendanceData);
      setResults(resultsData);
      setInvoices(invoicesData);
      setLoading(false);
    });
  }, []);

  const nonExcused = attendance.filter((a) => a.status !== "EXCUSED");
  const attended = nonExcused.filter(
    (a) => a.status === "PRESENT" || a.status === "LATE",
  ).length;
  const overallAttendance =
    nonExcused.length > 0
      ? Math.round((attended / nonExcused.length) * 100)
      : null;

  const latestExamId =
    results.length > 0 ? results[results.length - 1].examination : null;
  const latestExamResults = results.filter(
    (r) => r.examination === latestExamId,
  );
  const latestTotal = latestExamResults.reduce(
    (sum, r) => sum + Number(r.marks_obtained),
    0,
  );
  const latestFull = latestExamResults.reduce(
    (sum, r) => sum + Number(r.full_marks),
    0,
  );
  const latestPercent =
    latestFull > 0 ? Math.round((latestTotal / latestFull) * 100) : null;
  const latestPassed =
    latestExamResults.length > 0 && latestExamResults.every((r) => r.passed);

  const totalOutstanding = invoices.reduce(
    (sum, inv) => sum + Math.max(Number(inv.outstanding), 0),
    0,
  );

  if (loading) {
    return (
      <div>
        <div className="mb-6 h-32 animate-pulse rounded-lg bg-line" />
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-lg bg-line" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center gap-6 rounded-lg border border-line bg-white p-6">
        {profile?.photo ? (
          <img
            src={profile.photo}
            alt={profile.first_name}
            className="h-24 w-24 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-cobalt/10 text-2xl font-medium text-cobalt">
            {profile?.first_name[0]}
            {profile?.last_name[0]}
          </div>
        )}

        <div>
          <h2 className="text-xl font-semibold text-navy">
            {profile?.first_name} {profile?.last_name}
          </h2>
          <p className="text-sm text-navy/60">{profile?.email}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <span className="rounded-full bg-amber/10 px-2 py-0.5 text-xs font-medium text-amber">
              Class {profile?.student_class}
            </span>
            {profile?.roll_number && (
              <span className="rounded-full bg-cobalt/10 px-2 py-0.5 text-xs font-medium text-cobalt">
                Roll No. {profile.roll_number}
              </span>
            )}
            <span className="rounded-full bg-line px-2 py-0.5 text-xs font-medium text-navy/60">
              {profile?.gender === "M" ? "Male" : "Female"}
            </span>
          </div>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4 rounded-lg border border-line bg-white p-4 text-sm">
        <p>
          <span className="font-medium text-navy">Date of Birth:</span>{" "}
          <span className="text-navy/70">{profile?.date_of_birth}</span>
        </p>
        <p>
          <span className="font-medium text-navy">Parent Name:</span>{" "}
          <span className="text-navy/70">{profile?.parent_name}</span>
        </p>
        <p>
          <span className="font-medium text-navy">Parent Contact:</span>{" "}
          <span className="text-navy/70">{profile?.parent_contact}</span>
        </p>
      </div>

      <div className="mb-6 grid grid-cols-3 gap-4">
        <div className="rounded-lg border border-line bg-white p-4">
          <p className="text-xs text-navy/60">Attendance</p>
          <p
            className={`mt-1 text-2xl font-semibold ${
              overallAttendance !== null && overallAttendance >= 75
                ? "text-cobalt"
                : overallAttendance !== null && overallAttendance >= 50
                  ? "text-amber"
                  : "text-danger"
            }`}
          >
            {overallAttendance !== null ? `${overallAttendance}%` : "—"}
          </p>
        </div>

        <div className="rounded-lg border border-line bg-white p-4">
          <p className="text-xs text-navy/60">Latest Exam</p>
          <p
            className={`mt-1 text-2xl font-semibold ${latestPassed ? "text-cobalt" : "text-danger"}`}
          >
            {latestPercent !== null ? `${latestPercent}%` : "—"}
          </p>
        </div>

        <div className="rounded-lg border border-line bg-white p-4">
          <p className="text-xs text-navy/60">Fees Outstanding</p>
          <p className="mt-1 text-2xl font-semibold text-danger">
            Rs. {totalOutstanding.toFixed(0)}
          </p>
        </div>
      </div>

      <div className="rounded-lg border border-line bg-white p-4">
        <p className="mb-3 text-sm font-medium text-navy">Quick Links</p>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/student/attendance"
            className="rounded-md border border-line px-3 py-2 text-sm text-navy/70 hover:border-cobalt hover:text-cobalt"
          >
            View Attendance
          </Link>
          <Link
            href="/student/results"
            className="rounded-md border border-line px-3 py-2 text-sm text-navy/70 hover:border-cobalt hover:text-cobalt"
          >
            View Marksheet
          </Link>
        </div>
      </div>
    </div>
  );
}
