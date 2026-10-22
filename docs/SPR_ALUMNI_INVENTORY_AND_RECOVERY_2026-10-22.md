# SPR Alumni Connect | Bounded Dependency and Recovery Inventory
Date: 2026-10-22
Applies to: `Derek561/digital-patient-whiteboard` and Supabase `ojhovkhnhwlocshpnmts`
Related work: Issue #1 (inventory/recovery), Issue #2 (fictional staff demo)
Status: READ-ONLY INVENTORY COMPLETE; DESTRUCTIVE DB RECOVERY VERIFICATION OUTSTANDING.

## Code and hosting recovery reference

- Code before the alumni demo changes is preserved at branch `archive/whiteboard-before-alumni-rebuild-20261022`, created from `main` at commit `63614099bdcf710809f6f7ad87701992d9cf9f40`.
- Development changes are isolated at `feature/spr-alumni-staff-demo-v0-1`. Production branch remains `main`.
- Vercel project `prj_EEiAc6ChtMNXJeLe9xhUsw9ZnAfl` under TITAN-SYSTEMS team `team_Ic3TWXtfwjVkAIhRkmobJFLB` is connected to this repository. Baseline production deployment `dpl_6yEtXwkWJJXhD9RijZ3zm6iYJ7HL` was READY at the same main commit. This is a **code/deployment** reference only, NOT a database backup.
- Supabase organization Simple Path Recovery is **Pro**. According to current Supabase backup documentation, Pro offers automatic daily backups with 7-day retention. **An actual dated/restorable backup for this specific project has not been verified in the dashboard.** Secure export and restore readiness remain a precondition of future destructive database operations.

## Database inventory (read-only)

- Project: `ojhovkhnhwlocshpnmts`, Postgres 17, status ACTIVE_HEALTHY.
- User auth accounts: 4; `profiles`: 4.
- Other public tables and row estimates: `patient_cards` 18, `patient_activity_logs` 32, `patient_stage_history` 0, `next_actions` 0, `dropdown_options` 60, `audit_events` 0.
- All seven public tables have RLS enabled, but **legacy authenticated-role SELECT/INSERT/UPDATE policies use unrestricted true predicates on patient_cards and next_actions**. These are not appropriate alumni authorization rules.
- Eleven public foreign key constraints; especially `profiles.id -> auth.users.id`, patient activities/stage histories/next actions -> patient cards and profiles, audit events -> profiles.
- Existing timestamp update triggers on `profiles`, `patient_cards`, and `next_actions` call the public `set_updated_at` function.
- No public views observed. No Supabase project migrations recorded by the API. No Supabase Edge Functions, development branches, storage buckets, or storage objects found.
- Supabase security advisors reported: mutable search_path on `public.set_updated_at`; leaked password protection disabled. These require follow-up.
- The existing database may contain genuine former Whiteboard patient information. No records or identities were exported, copied to GitHub, or repurposed during this inventory.

## Dependency map and disposition

| Component | Decision | Reason / prerequisite |
|---|---|---|
| Existing repo & Supabase project | KEEP | User explicitly approved reuse, no additional infrastructure |
| Vercel project linkage | KEEP provisionally | Verified; production changes remain controlled |
| Supabase Auth service | KEEP provisionally | Existing 4 accounts; verify actual staff identities, sessions, reset flow, MFA before live pilot |
| `profiles` | REWORK | Foreign key to auth.users may be useful, role scheme is for Whiteboard |
| `patient_cards` | REPLACE | Intake stages and insurance/detox fields are not alumni workflow |
| `patient_activity_logs` | REPLACE | Structural concept of chronological interactions useful; schema not approved for alumni |
| `patient_stage_history` | REMOVE after recovery | Whiteboard-specific transition logic |
| `next_actions` | REBUILD | Queue pattern useful; enforce assigned-person/role access |
| `dropdown_options` | REPLACE selectively | Whiteboard vocab no longer relevant |
| `audit_events` | REBUILD / retain audit concept | Need genuine actor/action evidence and permission rules |
| Auth/login/recovery UI | REUSE / REFINE | Initial sign-in foundation, not a production security sign-off |
| Dictation helper | EVALUATE | Only if useful for mobile staff; avoid browser/device assumptions |
| RLS policies and triggers | REPLACE / REVIEW | Broad authenticated permissions unacceptable for alumni |

## First implementation slice

The feature branch adds `/alumni-demo` protected by existing Supabase staff authentication plus an active profile lookup. It does not query `patient_cards` or update Supabase tables. A client-side component uses **three fictional records** to demonstrate allowed/revoked contact preferences, simulated outcomes, history and follow-up queue. It does NOT send a message and its state resets on refresh.

Demo acceptance still pending: actual staff sign-in, iPhone and Android usability, role-specific negative tests on *future alumni schema*, and a decision about persistent server-side records. Vercel compilation passing is not full functional QA.

## Before destructive schema work

1. Review **Database > Backups** for the actual `ojhovkhnhwlocshpnmts` project, record the last available backup date and permitted restore method, and create a protected export if retention or granularity is insufficient.
2. Confirm a tested recoverability procedure, including database relations, auth dependencies, and any sensitive record handling. Never store backups in the public GitHub repository.
3. Compare dependencies once more immediately before DDL; replace old policies and schema in a coordinated, reversible sequence and run RLS negative tests.
4. Preserve raw historic alumni contacts only in approved private storage after consent/provenance checks, not in demo fixtures.

This is a bounded inventory, not permission to stop the safe fictional UI work.
