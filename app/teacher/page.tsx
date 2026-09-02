// app/teacher/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Profile = { first_name: string; last_name: string };
type ClassOption = {
  id: number;
  class_name: string;
  section: string;
  teacher: number | null;
};
type Assignment = {
  id: number;
  title: string;
  class_name: string;
  due_date: string;
};
type AttendanceRecord = { date: string };

export default function TeacherHomePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/classes").then((res) => res.json()),
      fetch("/api/assignments").then((res) => res.json()),
    ]).then(([classesData, assignmentsData]) => {
      setClasses(classesData);
      setAssignments(assignmentsData);
      setLoading(false);
    });
  }, []);
  const [myUserId, setMyUserId] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/teachers/me")
      .then((res) => res.json())
      .then((data) => {
        setMyUserId(data.user_id);
        setProfile(data);
      });
  }, []);

  const myClasses = classes.filter((c) => c.teacher === myUserId);
  const recentAssignments = assignments.slice(0, 5);
  if (loading) {
    return (
      <div>
        <div className="mb-6 h-6 w-48 animate-pulse rounded bg-line" />
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-lg bg-line" />
          ))}
        </div>
      </div>
    );
  }

  const today = new Date().toISOString().slice(0, 10);
  const upcomingAssignments = recentAssignments.filter(
    (a) => a.due_date >= today,
  );
  const overdueCount = recentAssignments.filter(
    (a) => a.due_date < today,
  ).length;

  return (
    <div>
      <h2 className="mb-1 text-xl font-semibold text-navy">
        Welcome, {profile?.first_name ?? "Teacher"}
      </h2>
      <p className="mb-6 text-sm text-navy/60">
        Here's what's happening with your classes.
      </p>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-line bg-white p-4">
          <p className="text-xs text-navy/60">My Classes</p>
          <p className="mt-1 text-2xl font-semibold text-cobalt">
            {myClasses.length}
          </p>
        </div>
        <div className="rounded-lg border border-line bg-white p-4">
          <p className="text-xs text-navy/60">Assignments Posted</p>
          <p className="mt-1 text-2xl font-semibold text-cobalt">
            {assignments.length}
          </p>
        </div>
        <div className="rounded-lg border border-line bg-white p-4">
          <p className="text-xs text-navy/60">Overdue</p>
          <p className="mt-1 text-2xl font-semibold text-danger">
            {overdueCount}
          </p>
        </div>
      </div>

      {myClasses.length > 0 && (
        <div className="mb-6 rounded-lg border border-line bg-white p-4">
          <p className="mb-3 text-sm font-medium text-navy">
            My Homeroom Classes
          </p>
          <div className="flex flex-wrap gap-2">
            {myClasses.map((c) => (
              <span
                key={c.id}
                className="rounded-full bg-amber/10 px-3 py-1 text-sm font-medium text-amber"
              >
                {c.class_name} {c.section}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="mb-6 rounded-lg border border-line bg-white p-4">
        <p className="mb-3 text-sm font-medium text-navy">Recent Assignments</p>
        {recentAssignments.length === 0 ? (
          <p className="text-sm text-navy/50">
            You haven't posted any assignments yet.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {recentAssignments.map((a) => {
              const isOverdue = a.due_date < today;
              return (
                <div
                  key={a.id}
                  className="flex items-center justify-between border-b border-line pb-2 last:border-0 last:pb-0"
                >
                  <div>
                    <p className="text-sm font-medium text-navy">{a.title}</p>
                    <p className="text-xs text-navy/50">{a.class_name}</p>
                  </div>
                  <span
                    className={`text-xs font-medium ${isOverdue ? "text-danger" : "text-cobalt"}`}
                  >
                    {isOverdue ? "Overdue" : `Due ${a.due_date}`}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="rounded-lg border border-line bg-white p-4">
        <p className="mb-3 text-sm font-medium text-navy">Quick Links</p>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/teacher/attendance"
            className="rounded-md border border-line px-3 py-2 text-sm text-navy/70 hover:border-cobalt hover:text-cobalt"
          >
            Mark Attendance
          </Link>
          <Link
            href="/teacher/results"
            className="rounded-md border border-line px-3 py-2 text-sm text-navy/70 hover:border-cobalt hover:text-cobalt"
          >
            Enter Marks
          </Link>
          <Link
            href="/teacher/assignments"
            className="rounded-md border border-line px-3 py-2 text-sm text-navy/70 hover:border-cobalt hover:text-cobalt"
          >
            Post Assignment
          </Link>
        </div>
      </div>
    </div>
  );
}
