export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-slate-100">
      <section className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-2xl shadow-black/30">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">
          Digital Patient Whiteboard
        </p>

        <h1 className="mt-4 text-3xl font-bold text-white">Sign in</h1>

        <p className="mt-3 text-sm leading-6 text-slate-400">
          Authentication shell placeholder. Supabase email login will be wired
          next. This page exists so the app has a clean access-control path
          before patient movement data is connected.
        </p>

        <div className="mt-6 rounded-2xl border border-amber-400/30 bg-amber-400/10 p-4 text-sm text-amber-100">
          Access will be role-based. This system is separate from Kipu, CRM, and
          Oceanside Housing census.
        </div>
      </section>
    </main>
  );
}
