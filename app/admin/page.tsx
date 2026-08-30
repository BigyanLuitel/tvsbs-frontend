// app/admin/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RTooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
  ResponsiveContainer,
} from "recharts";

type Student = { id: number; student_class: number };
type Teacher = { id: number };
type ClassOption = { id: number; class_name: string; section: string };
type AttendanceRecord = { date: string; status: string };
type Invoice = { outstanding: string; status: string };

export default function AdminHomePage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/students").then((res) => res.json()),
      fetch("/api/teachers").then((res) => res.json()),
      fetch("/api/classes").then((res) => res.json()),
      fetch("/api/attendance").then((res) => res.json()),
      fetch("/api/fees/invoices").then((res) => res.json()),
    ]).then(
      ([
        studentsData,
        teachersData,
        classesData,
        attendanceData,
        invoicesData,
      ]) => {
        setStudents(studentsData);
        setTeachers(teachersData);
        setClasses(classesData);
        setAttendance(attendanceData);
        setInvoices(invoicesData);
        setLoading(false);
      },
    );
  }, []);

  const today = new Date().toISOString().slice(0, 10);
  const todayAttendance = attendance.filter((a) => a.date === today);
  const presentToday = todayAttendance.filter(
    (a) => a.status === "PRESENT" || a.status === "LATE",
  ).length;
  const absentToday = todayAttendance.filter(
    (a) => a.status === "ABSENT",
  ).length;

  const totalOutstanding = invoices.reduce(
    (sum, inv) => sum + Number(inv.outstanding),
    0,
  );
  const unpaidCount = invoices.filter((inv) => inv.status === "UNPAID").length;

  const studentsPerClass = classes.map((c) => ({
    name: `${c.class_name} ${c.section}`,
    count: students.filter((s) => s.student_class === c.id).length,
  }));

  const feeStatusData = [
    {
      name: "Paid",
      value: invoices.filter((i) => i.status === "PAID").length,
      color: "#2C6CC4",
    },
    {
      name: "Partially Paid",
      value: invoices.filter((i) => i.status === "PARTIALLY_PAID").length,
      color: "#E8862E",
    },
    {
      name: "Unpaid",
      value: invoices.filter((i) => i.status === "UNPAID").length,
      color: "#DC2626",
    },
  ].filter((d) => d.value > 0);

  const last7Days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().slice(0, 10);
  });

  const attendanceTrend = last7Days.map((date) => {
    const dayRecords = attendance.filter((a) => a.date === date);
    const present = dayRecords.filter(
      (a) => a.status === "PRESENT" || a.status === "LATE",
    ).length;
    return { date: date.slice(5), present };
  });

  if (loading) {
    return (
      <div>
        <div className="mb-6 h-6 w-48 animate-pulse rounded bg-line" />
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-lg bg-line" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="mb-6 text-xl font-semibold text-navy">
        Dashboard Overview
      </h2>

      <div className="mb-6 grid grid-cols-4 gap-4">
        <div className="rounded-lg border border-line bg-white p-4">
          <p className="text-xs text-navy/60">Total Students</p>
          <p className="mt-1 text-2xl font-semibold text-cobalt">
            {students.length}
          </p>
        </div>
        <div className="rounded-lg border border-line bg-white p-4">
          <p className="text-xs text-navy/60">Total Teachers</p>
          <p className="mt-1 text-2xl font-semibold text-cobalt">
            {teachers.length}
          </p>
        </div>
        <div className="rounded-lg border border-line bg-white p-4">
          <p className="text-xs text-navy/60">Total Classes</p>
          <p className="mt-1 text-2xl font-semibold text-cobalt">
            {classes.length}
          </p>
        </div>
        <div className="rounded-lg border border-line bg-white p-4">
          <p className="text-xs text-navy/60">Outstanding Fees</p>
          <p className="mt-1 text-2xl font-semibold text-danger">
            Rs. {totalOutstanding.toFixed(0)}
          </p>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4">
        <div className="rounded-lg border border-line bg-white p-4">
          <p className="mb-3 text-sm font-medium text-navy">
            Students per Class
          </p>
          <div className="overflow-x-auto">
            <div style={{ width: Math.max(studentsPerClass.length * 70, 400) }}>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={studentsPerClass} margin={{ bottom: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E7E2DC" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 10 }}
                    angle={-40}
                    textAnchor="end"
                    interval={0}
                  />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <RTooltip />
                  <Bar dataKey="count" fill="#2C6CC4" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-line bg-white p-4">
          <p className="mb-3 text-sm font-medium text-navy">
            Fee Status Breakdown
          </p>
          {feeStatusData.length === 0 ? (
            <p className="text-sm text-navy/50">No invoices generated yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={feeStatusData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={75}
                  label
                >
                  {feeStatusData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <RTooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="mb-6 rounded-lg border border-line bg-white p-4">
        <p className="mb-3 text-sm font-medium text-navy">
          Attendance Trend (Last 7 Days)
        </p>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={attendanceTrend}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E7E2DC" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
            <RTooltip />
            <Line
              type="monotone"
              dataKey="present"
              stroke="#2C6CC4"
              strokeWidth={2}
              dot={{ r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4">
        <div className="rounded-lg border border-line bg-white p-4">
          <p className="mb-3 text-sm font-medium text-navy">
            Today's Attendance
          </p>
          {todayAttendance.length === 0 ? (
            <p className="text-sm text-navy/50">
              No attendance marked yet today.
            </p>
          ) : (
            <div className="flex gap-6">
              <div>
                <p className="text-xs text-navy/60">Present</p>
                <p className="text-xl font-semibold text-cobalt">
                  {presentToday}
                </p>
              </div>
              <div>
                <p className="text-xs text-navy/60">Absent</p>
                <p className="text-xl font-semibold text-danger">
                  {absentToday}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="rounded-lg border border-line bg-white p-4">
          <p className="mb-3 text-sm font-medium text-navy">Fee Status</p>
          <div className="flex gap-6">
            <div>
              <p className="text-xs text-navy/60">Unpaid Invoices</p>
              <p className="text-xl font-semibold text-amber">{unpaidCount}</p>
            </div>
            <div>
              <p className="text-xs text-navy/60">Total Invoices</p>
              <p className="text-xl font-semibold text-navy">
                {invoices.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-line bg-white p-4">
        <p className="mb-3 text-sm font-medium text-navy">Quick Links</p>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin/students/add"
            className="rounded-md border border-line px-3 py-2 text-sm text-navy/70 hover:border-cobalt hover:text-cobalt"
          >
            + Add Student
          </Link>
          <Link
            href="/admin/teachers/add"
            className="rounded-md border border-line px-3 py-2 text-sm text-navy/70 hover:border-cobalt hover:text-cobalt"
          >
            + Add Teacher
          </Link>
          <Link
            href="/admin/fees/invoices"
            className="rounded-md border border-line px-3 py-2 text-sm text-navy/70 hover:border-cobalt hover:text-cobalt"
          >
            View Invoices
          </Link>
          <Link
            href="/admin/results"
            className="rounded-md border border-line px-3 py-2 text-sm text-navy/70 hover:border-cobalt hover:text-cobalt"
          >
            View Results
          </Link>
        </div>
      </div>
    </div>
  );
}
