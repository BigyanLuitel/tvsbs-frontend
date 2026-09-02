// app/student/assistant/page.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";

type Message = { role: "user" | "assistant"; text: string; error?: boolean };
type Profile = { id: number; student_class: number };
type SubjectOption = { id: number; subject_name: string };

export default function StudentAssistantPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [subjects, setSubjects] = useState<SubjectOption[]>([]);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/students/me")
      .then((res) => res.json())
      .then(setProfile);
    fetch("/api/subjects/my-subjects")
      .then((res) => res.json())
      .then((data) => setSubjects(Array.isArray(data) ? data : []));
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend() {
    if (!input.trim() || !profile) return;

    const userMessage = input.trim();
    setMessages((prev) => [...prev, { role: "user", text: userMessage }]);
    setInput("");
    setSending(true);

    const res = await fetch("/api/ai/assistant", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        student_id: profile.id,
        class_id: profile.student_class,
        query_text: userMessage,
        subject_id: selectedSubject ? Number(selectedSubject) : null,
        interaction_mode: "chat",
      }),
    });

    const data = await res.json();
    setSending(false);

    if (!res.ok) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: data.detail || "Something went wrong. Please try again.",
          error: true,
        },
      ]);
      return;
    }

    setMessages((prev) => [
      ...prev,
      { role: "assistant", text: data.response_text },
    ]);
  }
  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-navy">Study Assistant</h2>
        <select
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
          className="rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-cobalt"
        >
          <option value="">General question</option>
          {subjects.map((s) => (
            <option key={s.id} value={s.id}>
              {s.subject_name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-1 flex-col overflow-hidden rounded-lg border border-line bg-white">
        <div className="flex-1 overflow-y-auto p-4">
          {messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-cobalt/10 text-2xl">
                💬
              </div>
              <p className="text-sm font-medium text-navy">
                Ask me anything about your subjects
              </p>
              <p className="mt-1 text-sm text-navy/50">
                Pick a subject above for a focused answer, or leave it general.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`flex items-end gap-2 ${m.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {m.role === "assistant" && (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-cobalt text-sm font-medium text-white">
                      AI
                    </div>
                  )}
                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
                      m.role === "user"
                        ? "rounded-br-sm bg-cobalt text-white"
                        : m.error
                          ? "rounded-bl-sm bg-coral/10 text-coral"
                          : "rounded-bl-sm bg-paper text-navy"
                    }`}
                  >
                    {m.role === "assistant" ? (
                      <div className="prose prose-sm max-w-none prose-p:my-1 prose-ol:my-1 prose-ul:my-1 prose-strong:text-navy">
                        <ReactMarkdown>{m.text}</ReactMarkdown>
                      </div>
                    ) : (
                      m.text
                    )}
                  </div>
                </div>
              ))}
              {sending && (
                <div className="flex items-end gap-2">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-cobalt text-sm font-medium text-white">
                    AI
                  </div>
                  <div className="rounded-2xl rounded-bl-sm bg-paper px-4 py-3">
                    <div className="flex gap-1">
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-navy/40 [animation-delay:-0.3s]" />
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-navy/40 [animation-delay:-0.15s]" />
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-navy/40" />
                    </div>
                  </div>
                </div>
              )}
              <div ref={scrollRef} />
            </div>
          )}
        </div>

        <div className="flex gap-2 border-t border-line p-3">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !sending && handleSend()}
            placeholder="Ask a question..."
            className="flex-1 rounded-full border border-line px-4 py-2.5 text-sm outline-none focus:border-cobalt"
          />
          <button
            onClick={handleSend}
            disabled={sending || !input.trim()}
            className="rounded-full bg-cobalt px-5 py-2.5 text-sm font-medium text-white transition hover:bg-cobalt/90 disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
