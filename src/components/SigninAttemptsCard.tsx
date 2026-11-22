"use client";

import { useCallback, useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabase";

type Row = {
  id: number;
  email: string;
  attempted_password: string;
  success: boolean;
  created_at: string;
};

/**
 * Admin-only card for the classroom lab, shown on /signin/admin: lists every
 * sign-in attempt (right or wrong) with the password exactly as typed.
 * The database only returns rows to users listed in admin_users (is_admin()).
 */
export default function SigninAttemptsCard() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    const sb = getSupabase();
    if (!sb) {
      setError("Supabase is not configured.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    const { data, error: err } = await sb
      .from("signin_attempt_logs")
      .select("id, email, attempted_password, success, created_at")
      .order("created_at", { ascending: false })
      .limit(500);
    if (err) setError(err.message);
    else setRows((data ?? []) as Row[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <section className="bivo-card mb-8 p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="bivo-font-display text-2xl font-semibold">Sign-in attempts (classroom lab)</h2>
          <p className="bivo-muted-text mt-1 text-sm">
            Every attempt is stored in plain text, correct or not. Dummy passwords only.
          </p>
        </div>
        <button type="button" className="bivo-btn bivo-btn-outline" onClick={() => void load()} disabled={loading}>
          {loading ? "Loading…" : "Refresh"}
        </button>
      </div>

      {error && (
        <p role="alert" className="bivo-error mt-3">
          {error}
        </p>
      )}
      {!error && !loading && rows.length === 0 && <p className="bivo-muted-text mt-3 text-sm">No attempts yet.</p>}

      {rows.length > 0 && (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[560px] border-collapse text-left text-sm">
            <thead>
              <tr className="bivo-muted-text border-b" style={{ borderColor: "var(--bivo-border)" }}>
                <th className="py-2 pr-3 font-medium">When</th>
                <th className="py-2 pr-3 font-medium">Email</th>
                <th className="py-2 pr-3 font-medium">Password typed</th>
                <th className="py-2 font-medium">Result</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b align-top" style={{ borderColor: "var(--bivo-border)" }}>
                  <td className="whitespace-nowrap py-2 pr-3">{new Date(r.created_at).toLocaleString()}</td>
                  <td className="break-all py-2 pr-3">{r.email}</td>
                  <td className="break-all py-2 pr-3 font-mono">{r.attempted_password}</td>
                  <td className="py-2">{r.success ? "Correct" : "Wrong"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
