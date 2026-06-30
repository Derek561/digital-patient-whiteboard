"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function checkSession() {
      const { data } = await supabase.auth.getSession();

      if (!mounted) return;

      setReady(true);

      if (!data.session) {
        setMessage(
          "Open the newest password reset email link, then enter a new password here.",
        );
      }
    }

    checkSession();

    return () => {
      mounted = false;
    };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage(null);

    const formData = new FormData(event.currentTarget);
    const password = String(formData.get("password") || "");
    const confirmPassword = String(formData.get("confirm_password") || "");

    if (password.length < 8) {
      setSaving(false);
      setMessage("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setSaving(false);
      setMessage("Passwords do not match.");
      return;
    }

    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) {
      setSaving(false);
      setMessage(error.message);
      return;
    }

    await supabase.auth.signOut();

    router.push(
      `/login?message=${encodeURIComponent(
        "Password updated. Please sign in with your new password.",
      )}`,
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-slate-100">
      <section className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-2xl shadow-black/30">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">
          Digital Patient Whiteboard
        </p>

        <h1 className="mt-4 text-3xl font-bold text-white">
          Set new password
        </h1>

        <p className="mt-3 text-sm leading-6 text-slate-400">
          Enter a new password for your staff account.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <label className="flex flex-col gap-2 text-sm text-slate-300">
            New password
            <input
              name="password"
              type="password"
              required
              minLength={8}
              placeholder="Enter new password"
              className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-300"
            />
          </label>

          <label className="flex flex-col gap-2 text-sm text-slate-300">
            Confirm password
            <input
              name="confirm_password"
              type="password"
              required
              minLength={8}
              placeholder="Confirm new password"
              className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-300"
            />
          </label>

          <button
            type="submit"
            disabled={!ready || saving}
            className="rounded-xl bg-cyan-300 px-4 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? "Saving..." : "Update password"}
          </button>
        </form>

        {message ? (
          <div className="mt-6 rounded-2xl border border-cyan-400/30 bg-cyan-400/10 p-4 text-sm text-cyan-100">
            {message}
          </div>
        ) : null}

        <div className="mt-6 flex justify-center">
          <Link
            href="/login"
            className="text-sm font-semibold text-cyan-300 hover:text-cyan-100"
          >
            Back to sign in
          </Link>
        </div>
      </section>
    </main>
  );
}