// app/admin/fees/invoices/page.tsx
"use client";

import { useEffect, useState } from "react";
import TableSkeleton from "@/app/components/TableSkeleton";

type Invoice = {
  id: number;
  student: number;
  student_email: string;
  fee_category: number;
  category_name: string;
  month: string;
  amount_due: string;
  previous_due: string;
  amount_paid: string;
  due_date: string;
  status: "UNPAID" | "PARTIALLY_PAID" | "PAID";
  total_due: string;
  outstanding: string;
};

export default function FeeInvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [showGenerate, setShowGenerate] = useState(false);
  const [genForm, setGenForm] = useState({
    month: "",
    due_date: "",
    academic_year: "",
  });
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState("");
  const [genSuccess, setGenSuccess] = useState("");

  const [payingInvoice, setPayingInvoice] = useState<Invoice | null>(null);
  const [payAmount, setPayAmount] = useState("");
  const [paySubmitting, setPaySubmitting] = useState(false);
  const [payError, setPayError] = useState("");

  useEffect(() => {
    loadInvoices();
  }, []);

  function loadInvoices() {
    setLoading(true);
    fetch("/api/fees/invoices")
      .then((res) => res.json())
      .then((data) => {
        setInvoices(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load invoices");
        setLoading(false);
      });
  }

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    setGenError("");
    setGenSuccess("");
    setGenerating(true);

    const res = await fetch("/api/fees/invoices/generate-monthly", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(genForm),
    });

    setGenerating(false);

    if (!res.ok) {
      const errData = await res.json();
      setGenError(JSON.stringify(errData));
      return;
    }

    const created = await res.json();
    setGenSuccess(`Generated ${created.length} invoice(s).`);
    loadInvoices();
  }

  async function handlePay(e: React.FormEvent) {
    e.preventDefault();
    if (!payingInvoice) return;
    setPayError("");
    setPaySubmitting(true);

    const res = await fetch(`/api/fees/invoices/${payingInvoice.id}/pay`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: payAmount }),
    });

    setPaySubmitting(false);

    if (!res.ok) {
      const errData = await res.json();
      setPayError(errData.detail || JSON.stringify(errData));
      return;
    }

    setPayingInvoice(null);
    setPayAmount("");
    loadInvoices();
  }
  const filtered = invoices.filter((inv) => {
    const matchesSearch =
      `${inv.student_email} ${inv.category_name} ${inv.month}`
        .toLowerCase()
        .includes(search.toLowerCase());
    const matchesStatus = !statusFilter || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalOutstanding = invoices.reduce(
    (sum, inv) => sum + Number(inv.outstanding),
    0,
  );
  const totalCollected = invoices.reduce(
    (sum, inv) => sum + Number(inv.amount_paid),
    0,
  );
  const unpaidCount = invoices.filter((inv) => inv.status === "UNPAID").length;

  const statusStyles: Record<string, string> = {
    PAID: "bg-cobalt/10 text-cobalt",
    PARTIALLY_PAID: "bg-amber/10 text-amber",
    UNPAID: "bg-danger/10 text-danger",
  };

  if (loading) {
    return (
      <div>
        <div className="mb-6 h-6 w-32 animate-pulse rounded bg-line" />
        <TableSkeleton cols={7} />
      </div>
    );
  }

  if (error) {
    return <p className="text-sm text-coral">{error}</p>;
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-navy">Fee Invoices</h2>
          <p className="text-sm text-navy/60">{invoices.length} invoices</p>
        </div>
        <button
          onClick={() => setShowGenerate(true)}
          className="rounded-md bg-cobalt px-4 py-2 text-sm font-medium text-white transition hover:bg-cobalt/90"
        >
          Generate Monthly Invoices
        </button>
      </div>

      <div className="mb-6 grid grid-cols-3 gap-4">
        <div className="rounded-lg border border-line bg-white p-4">
          <p className="text-xs text-navy/60">Total Collected</p>
          <p className="mt-1 text-2xl font-semibold text-cobalt">
            Rs. {totalCollected.toFixed(2)}
          </p>
        </div>
        <div className="rounded-lg border border-line bg-white p-4">
          <p className="text-xs text-navy/60">Total Outstanding</p>
          <p className="mt-1 text-2xl font-semibold text-danger">
            Rs. {totalOutstanding.toFixed(2)}
          </p>
        </div>
        <div className="rounded-lg border border-line bg-white p-4">
          <p className="text-xs text-navy/60">Unpaid Invoices</p>
          <p className="mt-1 text-2xl font-semibold text-amber">
            {unpaidCount}
          </p>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Search by student, category, or month..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-sm rounded-md border border-line px-3 py-2 text-sm text-navy outline-none transition focus:border-cobalt"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-cobalt"
        >
          <option value="">All statuses</option>
          <option value="UNPAID">Unpaid</option>
          <option value="PARTIALLY_PAID">Partially Paid</option>
          <option value="PAID">Paid</option>
        </select>
      </div>

      <div className="overflow-hidden rounded-lg border border-line bg-white">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-line bg-paper">
              <th className="px-4 py-3 font-medium text-navy/70">Student</th>
              <th className="px-4 py-3 font-medium text-navy/70">Category</th>
              <th className="px-4 py-3 font-medium text-navy/70">Month</th>
              <th className="px-4 py-3 font-medium text-navy/70">Total Due</th>
              <th className="px-4 py-3 font-medium text-navy/70">
                Outstanding
              </th>
              <th className="px-4 py-3 font-medium text-navy/70">Status</th>
              <th className="px-4 py-3 font-medium text-navy/70">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((inv) => (
              <tr
                key={inv.id}
                className="border-b border-line last:border-0 hover:bg-paper"
              >
                <td className="px-4 py-3 text-navy/70">{inv.student_email}</td>
                <td className="px-4 py-3 text-navy/70">{inv.category_name}</td>
                <td className="px-4 py-3 text-navy/70">{inv.month}</td>
                <td className="px-4 py-3 font-medium text-navy">
                  Rs. {inv.total_due}
                </td>
                <td className="px-4 py-3 font-medium text-navy">
                  Rs. {inv.outstanding}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusStyles[inv.status]}`}
                  >
                    {inv.status.replace("_", " ")}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {inv.status !== "PAID" && (
                    <button
                      onClick={() => {
                        setPayingInvoice(inv);
                        setPayAmount("");
                        setPayError("");
                      }}
                      className="text-sm text-cobalt hover:underline"
                    >
                      Record Payment
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showGenerate && (
        <div className="fixed inset-0 flex items-center justify-center bg-navy/40 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-lg border border-line bg-white p-6">
            <h3 className="mb-4 text-base font-semibold text-navy">
              Generate Monthly Invoices
            </h3>
            <p className="mb-4 text-sm text-navy/60">
              Creates this month's invoice for every student, for every
              recurring fee category with a defined rate.
            </p>

            <form onSubmit={handleGenerate}>
              {genError && (
                <p className="mb-4 rounded-md bg-coral/10 px-3 py-2 text-sm text-coral">
                  {genError}
                </p>
              )}
              {genSuccess && (
                <p className="mb-4 rounded-md bg-cobalt/10 px-3 py-2 text-sm text-cobalt">
                  {genSuccess}
                </p>
              )}

              <label className="mb-1 block text-sm text-navy/70">Month</label>
              <input
                value={genForm.month}
                onChange={(e) =>
                  setGenForm((prev) => ({ ...prev, month: e.target.value }))
                }
                required
                placeholder="e.g. 2026-04"
                className="mb-4 w-full rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-cobalt"
              />

              <label className="mb-1 block text-sm text-navy/70">
                Due Date
              </label>
              <input
                type="date"
                value={genForm.due_date}
                onChange={(e) =>
                  setGenForm((prev) => ({ ...prev, due_date: e.target.value }))
                }
                required
                className="mb-4 w-full rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-cobalt"
              />

              <label className="mb-1 block text-sm text-navy/70">
                Academic Year
              </label>
              <input
                value={genForm.academic_year}
                onChange={(e) =>
                  setGenForm((prev) => ({
                    ...prev,
                    academic_year: e.target.value,
                  }))
                }
                required
                placeholder="e.g. 2025-2026"
                className="mb-6 w-full rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-cobalt"
              />

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowGenerate(false)}
                  className="rounded-md px-4 py-2 text-sm font-medium text-navy/70 hover:bg-paper"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={generating}
                  className="rounded-md bg-cobalt px-4 py-2 text-sm font-medium text-white hover:bg-cobalt/90 disabled:opacity-50"
                >
                  {generating ? "Generating..." : "Generate"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {payingInvoice && (
        <div className="fixed inset-0 flex items-center justify-center bg-navy/40 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-lg border border-line bg-white p-6">
            <h3 className="mb-1 text-base font-semibold text-navy">
              Record Payment
            </h3>
            <p className="mb-4 text-sm text-navy/60">
              {payingInvoice.student_email} — {payingInvoice.category_name} (
              {payingInvoice.month})
              <br />
              Outstanding: Rs. {payingInvoice.outstanding}
            </p>

            <form onSubmit={handlePay}>
              {payError && (
                <p className="mb-4 rounded-md bg-coral/10 px-3 py-2 text-sm text-coral">
                  {payError}
                </p>
              )}

              <label className="mb-1 block text-sm text-navy/70">
                Amount (Rs.)
              </label>
              <input
                type="number"
                step="0.01"
                value={payAmount}
                onChange={(e) => setPayAmount(e.target.value)}
                required
                className="mb-6 w-full rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-cobalt"
              />

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setPayingInvoice(null)}
                  className="rounded-md px-4 py-2 text-sm font-medium text-navy/70 hover:bg-paper"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={paySubmitting}
                  className="rounded-md bg-cobalt px-4 py-2 text-sm font-medium text-white hover:bg-cobalt/90 disabled:opacity-50"
                >
                  {paySubmitting ? "Recording..." : "Record Payment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
