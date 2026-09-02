// app/student/assignments/page.tsx
"use client";

import { useEffect, useState } from "react";

type Assignment = {
  id: number;
  title: string;
  description: string;
  subject_name: string;
  teacher_name: string;
  due_date: string;
  attachment: string | null;
  created_at: string;
};

export default function StudentAssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/assignments/me")
      .then((res) => res.json())
      .then((data) => {
        setAssignments(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load assignments");
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <p className="text-sm text-navy/60">Loading assignments...</p>;
  }
  if (error) {
    return <p className="text-sm text-coral">{error}</p>;
  }

  const today = new Date().toISOString().slice(0, 10);

  return (
    <div>
      <h2 className="mb-6 text-xl font-semibold text-navy">Assignments</h2>

      {assignments.length === 0 ? (
        <p className="text-sm text-navy/60">No assignments posted yet.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {assignments.map((a) => {
            const isOverdue = a.due_date < today;
            return (
              <div
                key={a.id}
                className="rounded-lg border border-line bg-white p-4"
              >
                <div className="mb-2 flex items-start justify-between">
                  <h3 className="font-medium text-navy">{a.title}</h3>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      isOverdue
                        ? "bg-danger/10 text-danger"
                        : "bg-cobalt/10 text-cobalt"
                    }`}
                  >
                    {isOverdue ? "Overdue" : "Due " + a.due_date}
                  </span>
                </div>
                <div className="mb-2 flex gap-2">
                  <span className="rounded-full bg-amber/10 px-2 py-0.5 text-xs font-medium text-amber">
                    {a.subject_name}
                  </span>
                  <span className="text-xs text-navy/50">
                    by {a.teacher_name}
                  </span>
                </div>
                <p className="mb-3 text-sm text-navy/70">{a.description}</p>
                {a.attachment && (
                  <a
                    href={a.attachment}
                    target="_blank"
                    className="text-sm text-cobalt hover:underline"
                  >
                    Download Attachment
                  </a>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
