import Link from "next/link";
import { sendPasswordReset } from "./actions";

type ForgotPasswordPageProps = {
  searchParams?: Promise<{
    message?: string;
  }>;
};

export default async function ForgotPasswordPage({
  searchParams,
}: ForgotPasswordPageProps) {
  const params = await searchParams;
  const message = params?.message;

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-slate-100">
      <section className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-2xl shadow-black/30">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">
          Digital Patient Whiteboard
        </p>

        <h1 className="mt-4 text-3xl font-bold text-white">Reset password</h1>

        <p className="mt-3 text-sm leading-6 text-slate-400">
          Enter your approved staff email. If the account exists, a password
          reset link will be sent.
        </p>

        <form action={sendPasswordReset} className="mt-6 flex flex-col gap-4">
          <label className="flex flex-col gap-2 text-sm text-slate-300">
            Email address
            <input
              name="email"
              type="email"
              required
              placeholder="staff@example.com"
              className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-300"
            />
          </label>

          <button
            type="submit"
            className="rounded-xl bg-cyan-300 px-4 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-200"
          >
            Send reset link
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
