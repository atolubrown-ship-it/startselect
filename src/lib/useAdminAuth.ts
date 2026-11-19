"use client";

import { useCallback, useEffect, useState } from "react";
import { getSupabase } from "./supabase";
import { friendlyError } from "./remote";

/**
 * Admin sign-in state, powered by Supabase Auth.
 *
 * Important: this only decides what the page SHOWS. The real protection is in the
 * database — Row Level Security (see quilo-backend.sql) rejects any change to the
 * settings or the logo unless the signed-in user is listed in `admin_users`.
 */
export type AdminAuth =
  | { phase: "checking" }
  | { phase: "unconfigured" }
  | { phase: "signed-out" }
  | { phase: "not-admin"; email: string }
  | { phase: "admin"; email: string }
  | { phase: "error"; message: string };

export function useAdminAuth() {
  const [state, setState] = useState<AdminAuth>({ phase: "checking" });

  const check = useCallback(async () => {
    const sb = getSupabase();
    if (!sb) {
      setState({ phase: "unconfigured" });
      return;
    }
    try {
      const { data: sessionData } = await sb.auth.getSession();
      const session = sessionData.session;
      if (!session) {
        setState({ phase: "signed-out" });
        return;
      }
      const email = session.user.email ?? "";
      const { data, error } = await sb.rpc("is_admin");
      if (error) {
        setState({ phase: "error", message: friendlyError(error.message, "Couldn't check your admin access.") });
        return;
      }
      setState(data === true ? { phase: "admin", email } : { phase: "not-admin", email });
    } catch (e) {
      setState({
        phase: "error",
        message: friendlyError(e instanceof Error ? e.message : undefined, "Couldn't check your admin access."),
      });
    }
  }, []);

  useEffect(() => {
    void check();
    const sb = getSupabase();
    if (!sb) return;
    const { data } = sb.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "USER_UPDATED") {
        // Defer: calling Supabase inside this callback can deadlock.
        setTimeout(() => void check(), 0);
      }
    });
    return () => data.subscription.unsubscribe();
  }, [check]);

  /** Returns an error message, or null on success. */
  const signIn = useCallback(
    async (email: string, password: string): Promise<string | null> => {
      const sb = getSupabase();
      if (!sb) return "Supabase isn't configured yet.";
      try {
        const { error } = await sb.auth.signInWithPassword({ email: email.trim(), password });
        if (error) {
          const m = error.message.toLowerCase();
          if (m.includes("invalid login")) return "That email or password isn't right.";
          if (m.includes("not confirmed"))
            return "This email isn't confirmed yet. In Supabase, open Authentication → Users and confirm it.";
          return friendlyError(error.message, "Couldn't sign in. Please try again.");
        }
        await check();
        return null;
      } catch (e) {
        return friendlyError(e instanceof Error ? e.message : undefined, "Couldn't sign in. Please try again.");
      }
    },
    [check],
  );

  const signOut = useCallback(async () => {
    const sb = getSupabase();
    try {
      await sb?.auth.signOut();
    } catch {
      /* ignore */
    }
    setState({ phase: "signed-out" });
  }, []);

  return { state, signIn, signOut, recheck: check };
}
