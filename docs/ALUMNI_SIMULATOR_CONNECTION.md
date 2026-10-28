# SPR Alumni Simulator | Connection Gate

Environment: `alumni-full-simulator` (Supabase project `gnawvoxpluyyaqvbpzwd`). This is separate from the original Whiteboard project `ojhovkhnhwlocshpnmts`.

## Read-only API preflight

On the local computer, create an untracked file named `.env.simulator.local` with:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://gnawvoxpluyyaqvbpzwd.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=PASTE_SIMULATOR_PUBLISHABLE_KEY_HERE
```

Get the branch **publishable** key from Supabase > simulator branch > Project Settings > API Keys. Never use a secret/service-role key or commit credentials. Run:

```bash
node --env-file=.env.simulator.local scripts/check-alumni-simulator.mjs
```

The script refuses any project other than the simulator, makes read-only requests, and verifies the REST routes without retrieving data. It does not prove user authorization.

## Auth and application gate

This branch began without auth users or profiles. Create separate simulator test staff accounts using Supabase Authentication (not production credentials), then activate their `profiles` and `alumni_staff_roles` records. Test four staff roles and permissions independently before promoting any workflow.

The Next.js application currently reads `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` from its local environment. Do **not** swap the working `.env.local` until the simulator API and test logins are ready. Do not ingest real alumni data or connect live sending.

## Current cautions

The initial branch provisioning reported `MIGRATIONS_FAILED`. Subsequent manual migration replays installed the schema, but do not prove that resetting this branch or creating a new branch will succeed. Reconcile the historical Whiteboard baseline before relying on automated branch recreation.
