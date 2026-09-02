// app/student/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

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
  subject_name: string;
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
  const [photoError, setPhotoError] = useState(false);

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

  const attendanceChartData =
    overallAttendance !== null
      ? [
          { name: "Attended", value: overallAttendance },
          { name: "Missed", value: 100 - overallAttendance },
        ]
      : [];

  const attendanceColor =
    overallAttendance !== null && overallAttendance >= 75
      ? "#2C6CC4"
      : overallAttendance !== null && overallAttendance >= 50
        ? "#E8862E"
        : "#DC2626";

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

  const subjectChartData = latestExamResults.map((r) => ({
    subject:
      r.subject_name.length > 8
        ? r.subject_name.slice(0, 8) + "…"
        : r.subject_name,
    percent: Math.round(
      (Number(r.marks_obtained) / Number(r.full_marks)) * 100,
    ),
  }));

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
            <div key={i} className="h-40 animate-pulse rounded-lg bg-line" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 overflow-hidden rounded-lg border border-line bg-white">
        <div className="h-14 bg-cobalt" />
        <div className="flex items-end gap-5 px-6 pb-6 -mt-8">
          {profile?.photo && !photoError ? (
            <img
              src={profile.photo}
              alt={profile.first_name}
              onError={() => setPhotoError(true)}
              className="h-20 w-20 rounded-full border-4 border-white object-cover"
            />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-white bg-cobalt/10 text-xl font-medium text-cobalt">
              {profile?.first_name[0]}
              {profile?.last_name[0]}
            </div>
          )}
          <div className="pb-1">
            <h2 className="text-xl font-semibold text-navy">
              {profile?.first_name} {profile?.last_name}
            </h2>
            <p className="text-sm text-navy/60">{profile?.email}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 border-t border-line px-6 py-3">
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
          <span className="rounded-full bg-line px-2 py-0.5 text-xs font-medium text-navy/60">
            DOB: {profile?.date_of_birth}
          </span>
        </div>
      </div>

      <p className="mb-3 text-sm font-medium text-navy">Overview</p>
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-line bg-white p-4">
          <p className="mb-1 text-xs text-navy/60">Attendance</p>
          {attendanceChartData.length === 0 ? (
            <p className="text-sm text-navy/40">No records yet</p>
          ) : (
            <div className="flex items-center gap-3">
              <div className="h-20 w-20">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={attendanceChartData}
                      dataKey="value"
                      innerRadius={26}
                      outerRadius={38}
                      startAngle={90}
                      endAngle={-270}
                    >
                      <Cell fill={attendanceColor} />
                      <Cell fill="#E7E2DC" />
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <p
                className="text-2xl font-semibold"
                style={{ color: attendanceColor }}
              >
                {overallAttendance}%
              </p>
            </div>
          )}
        </div>

        <div className="rounded-lg border border-line bg-white p-4">
          <p className="mb-1 text-xs text-navy/60">Latest Exam</p>
          {latestPercent === null ? (
            <p className="mt-2 text-sm text-navy/40">
              No published results yet
            </p>
          ) : (
            <>
              <p
                className={`text-2xl font-semibold ${latestPassed ? "text-cobalt" : "text-danger"}`}
              >
                {latestPercent}%
              </p>
              <p className="mt-1 text-xs text-navy/50">
                {latestExamResults[0]?.examination_display}
              </p>
            </>
          )}
        </div>

        <div className="rounded-lg border border-line bg-white p-4">
          <p className="mb-1 text-xs text-navy/60">Fees Outstanding</p>
          <p className="text-2xl font-semibold text-danger">
            Rs. {totalOutstanding.toFixed(0)}
          </p>
        </div>
      </div>

      {subjectChartData.length > 0 && (
        <div className="mb-6 rounded-lg border border-line bg-white p-4">
          <p className="mb-3 text-sm font-medium text-navy">
            {latestExamResults[0]?.examination_display} — Subject Performance
          </p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={subjectChartData}>
              <XAxis dataKey="subject" tick={{ fontSize: 10 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="percent" fill="#2C6CC4" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

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
