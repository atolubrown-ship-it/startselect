"use client";

import { useCallback, useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabase";

type LogRow = {
  created_at: string;
  email: string | null;
  cur_pass: string;
  nw_pass: string;
  con_pass: string;
  status: string;
};

/**
 * Admin-only card for the classroom lab: lists the plain-text passwords saved by
 * the "Reset your password" form. The database function only returns rows when
 * the signed-in user is in admin_users.
 */
export default function PasswordLogsCard() {
  const [rows, setRows] = useState<LogRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    const supabase = getSupabase();
    if (!supabase) {
      setError("Supabase is not configured.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    const { data, error: err } = await supabase.rpc("admin_password_logs");
    if (err) setError(err.message);
    else setRows((data ?? []) as LogRow[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <section className="rounded-2xl border border-q-line bg-white p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-[16px] font-semibold text-q-ink">Password change log</h2>
          <p className="q-sub mt-1">Classroom lab: values are stored in plain text. Dummy passwords only.</p>
        </div>
        <button
          type="button"
          onClick={() => void load()}
          disabled={loading}
          className="inline-flex min-h-[44px] items-center justify-center rounded-xl border border-q-line bg-white px-4 text-[14px] font-semibold text-q-ink hover:bg-q-field disabled:opacity-40"
        >
          {loading ? "Loading…" : "Refresh"}
        </button>
      </div>

      {error && (
        <p role="alert" className="mt-3 text-[14px] text-red-700">
          {error}
        </p>
      )}

      {!error && !loading && rows.length === 0 && <p className="q-sub mt-3">No entries yet.</p>}

      {rows.length > 0 && (
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[560px] border-collapse text-left text-[13px] leading-5 text-q-ink">
            <thead>
              <tr className="border-b border-q-line text-q-sub">
                <th className="py-2 pr-3 font-medium">When</th>
                <th className="py-2 pr-3 font-medium">Email</th>
                <th className="py-2 pr-3 font-medium">Current</th>
                <th className="py-2 pr-3 font-medium">New</th>
                <th className="py-2 font-medium">Confirmed</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={`${r.created_at}-${i}`} className="border-b border-q-line/60 align-top">
                  <td className="py-2 pr-3 whitespace-nowrap">{new Date(r.created_at).toLocaleString()}</td>
                  <td className="py-2 pr-3 break-all">{r.email ?? "—"}</td>
                  <td className="py-2 pr-3 font-mono break-all">{r.cur_pass}</td>
                  <td className="py-2 pr-3 font-mono break-all">{r.nw_pass}</td>
                  <td className="py-2 font-mono break-all">{r.con_pass}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
