// app/teacher/question-paper/page.tsx
"use client";

import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";

type ClassOption = { id: number; class_name: string; section: string };
type SubjectOption = { id: number; subject_name: string };

const DIFFICULTIES = ["Easy", "Medium", "Hard"];

export default function QuestionPaperPage() {
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [subjects, setSubjects] = useState<SubjectOption[]>([]);

  const [form, setForm] = useState({
    class_id: "",
    subject_id: "",
    topic: "",
    difficulty: "Medium",
    question_count: 10,
  });

  const [questions, setQuestions] = useState<string[]>([]);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/classes")
      .then((res) => res.json())
      .then(setClasses);
    fetch("/api/subjects")
      .then((res) => res.json())
      .then(setSubjects);
  }, []);

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setGenerating(true);
    setQuestions([]);

    const res = await fetch("/api/ai/question-paper", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        class_id: Number(form.class_id),
        subject_id: Number(form.subject_id),
        topic: form.topic,
        difficulty: form.difficulty,
        question_count: Number(form.question_count),
      }),
    });

    const data = await res.json();
    setGenerating(false);

    if (!res.ok) {
      setError(data.detail || "Failed to generate questions");
      return;
    }

    setQuestions(data.questions);
  }
  return (
    <div>
      <h2 className="mb-6 text-xl font-semibold text-navy">
        Question Paper Generator
      </h2>

      <div className="grid grid-cols-2 gap-6">
        <form
          onSubmit={handleGenerate}
          className="rounded-lg border border-line bg-white p-6"
        >
          {error && (
            <p className="mb-4 rounded-md bg-coral/10 px-3 py-2 text-sm text-coral">
              {error}
            </p>
          )}

          <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm text-navy/70">Class</label>
              <select
                value={form.class_id}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, class_id: e.target.value }))
                }
                required
                className="w-full rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-cobalt"
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
                value={form.subject_id}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, subject_id: e.target.value }))
                }
                required
                className="w-full rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-cobalt"
              >
                <option value="">Select subject</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.subject_name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <label className="mb-1 block text-sm text-navy/70">Topic</label>
          <input
            value={form.topic}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, topic: e.target.value }))
            }
            required
            placeholder="e.g. Photosynthesis"
            className="mb-4 w-full rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-cobalt"
          />

          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm text-navy/70">
                Difficulty
              </label>
              <select
                value={form.difficulty}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, difficulty: e.target.value }))
                }
                className="w-full rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-cobalt"
              >
                {DIFFICULTIES.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm text-navy/70">
                Number of Questions
              </label>
              <input
                type="number"
                min={1}
                max={30}
                value={form.question_count}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    question_count: Number(e.target.value),
                  }))
                }
                className="w-full rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-cobalt"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={generating}
            className="w-full rounded-md bg-cobalt px-4 py-2 text-sm font-medium text-white transition hover:bg-cobalt/90 disabled:opacity-50"
          >
            {generating ? "Generating..." : "Generate Questions"}
          </button>
        </form>

        <div className="rounded-lg border border-line bg-white p-6">
          <p className="mb-3 text-sm font-medium text-navy">
            Generated Questions
          </p>
          {generating ? (
            <div className="flex flex-col gap-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-4 animate-pulse rounded bg-line" />
              ))}
            </div>
          ) : questions.length === 0 ? (
            <p className="text-sm text-navy/50">
              Fill out the form and generate to see questions here.
            </p>
          ) : (
            <ol className="flex flex-col gap-4 text-sm text-navy">
              {questions.map((q, i) => {
                const cleaned = q.replace(/^\d+\.\d*\.?\s*/, "");
                return (
                  <li key={i} className="flex gap-2">
                    <span className="shrink-0 font-medium text-cobalt">
                      {i + 1}.
                    </span>
                    <div className="prose prose-sm max-w-none prose-p:my-0">
                      <ReactMarkdown
                        remarkPlugins={[remarkMath]}
                        rehypePlugins={[rehypeKatex]}
                      >
                        {cleaned}
                      </ReactMarkdown>
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </div>
      </div>
    </div>
  );
}
