# SPR Alumni Connect | Current Project Status

**Current direction approved:** 2026-10-22  
**Updated:** 2026-10-22  
**Phase:** Infrastructure repurpose approved; bounded technical inventory in progress  
**Purpose:** SPR employee-led alumni engagement and follow-up, independent of housing, THRIVE, and the former intake Whiteboard product.

> **THIS FILE CONTROLS CURRENT ENGINEERING STATUS.** Earlier Whiteboard project documents and alumni V1/V2/V3 drafts are provenance/reference only. The Google Drive blueprint is the approved business-direction companion. Statements about work are categorized as approved, implemented, tested, or operational; approval alone is not completion.

## Working links

- **Current blueprint in Google Drive (DSS-held, SPR custody follow-up):** https://docs.google.com/document/d/19AfVXOF0Y1RoDbOPm22_FgQvlf5wRr3JpRnwhpMWFuU/edit
- **Current repository:** https://github.com/Derek561/digital-patient-whiteboard
- **Existing Supabase project:** `ojhovkhnhwlocshpnmts` (reused, not duplicated)
- **First active issue (inventory and recovery):** https://github.com/Derek561/digital-patient-whiteboard/issues/1
- **Next executable issue (fictional staff demo slice):** https://github.com/Derek561/digital-patient-whiteboard/issues/2
- **Historical October 14-15 notes:** https://docs.google.com/document/d/1qC4uvyiflOq0FqAciwHEckIK5V1aDr_HvmqcCFM4t8M/edit

## Approved baseline

1. Build **SPR Alumni Connect** as a standalone SPR-controlled **program and application**, separate in purpose and data authority from Oceanside Housing, THRIVE, and KIPU. The legacy Whiteboard application is not in use and its old purpose is retired.
2. Reuse this **existing GitHub repository** and **existing Supabase project**. No new repo or DB project merely to support the rebuild. Retain existing infrastructure/auth code only where verified useful.
3. **Destructive replacement of obsolete Whiteboard code/schema inside this project is authorized.** Use a bounded inventory and verified secure recovery/rollback reference before irreversible data/schema steps. Do not convert historical Whiteboard patient data into alumni records.
4. Design staff workflows for **two administrators and two alumni liaisons**; a planned approximately **100 opt-in alumni** pilot remains subject to scope and readiness review. Mobile-first Android/iPhone workflow, low typing, human outreach with honest logs.
5. Functional scope: consent and revocation, contact preferences, individual outreach/logging, staff assignment, next-step queues, weekly Zoom alumni meetings, resources, self-service where appropriate, auditability. KIPU intake consent coordination is required; no existing technical integration is assumed.
6. **Demo work is expressly expected.** Use fictional records and safe test actions until access, privacy, consent and messaging have been verified for real use. Do not treat compliance/contractual safeguards as blanket permission to send live messages.
7. Ordinary UI/wording/task-order refinements stay within approved work. Material changes to authority, access, privacy, subscriptions or integrations become recorded decisions. We correct specific defects proportionately rather than building new permanent rules from every incident.

## Five approved milestones

| # | Milestone | Status | Evidence needed |
|---|---|---|---|
| 1 | Reuse existing infrastructure | **Approved; repository and project verified** | Same repository + Supabase ID confirmed |
| 2 | Bounded technical inventory and recovery baseline | **In progress** | Keep/replace/remove; auth/permissions/dependency map; recoverability |
| 3 | Rebuild alumni foundation | **Not started** | Testable alumni schema, permissions, consent, fictional records |
| 4 | Functional mobile-first staff workspace | **Not started** | Tested liaison/admin tasks on Android and iPhone |
| 5 | End-to-end testing and pilot readiness | **Not started** | Verified workflows, compliance/readiness, exceptions and limitations |

Milestones describe progress, not impermeable gates. A later test can reveal a fix in an earlier milestone; record the fix and move forward.

## Existing technical facts (read-only verification)

- GitHub repository: `Derek561/digital-patient-whiteboard`, main branch, **public** as checked 2026-10-22. Do **not** put PHI, contact sheets, credentials, confidential DB exports, or individual patient data in commits or issues. Review repository visibility before any sensitive implementation.
- Source currently uses Next.js, React, TypeScript, Supabase, and an existing login foundation. Code may be rewritten.
- Supabase `ojhovkhnhwlocshpnmts`: **7 public tables**, each with RLS enabled; **4** `auth.users` accounts. Counts at initial inventory: `profiles` (4), `patient_cards` (18), `patient_activity_logs` (32), `patient_stage_history` (0), `next_actions` (0), `dropdown_options` (60), `audit_events` (0). These counts and structures must be rechecked before destructive work. Existing data are *not* a confirmed demo dataset.
- **Access-policy finding:** existing authenticated-role `patient_cards` and `next_actions` policies use broad `true` predicates for reading and/or writing. RLS is on, but per-liaison/administrator authorization is **not** proven and must be redesigned and negatively tested before alumni use. See Issue #1 evidence.
- This baseline has **not** deleted, renamed or changed production DB objects, auth users, DNS, deployments, or former Whiteboard app code.

## Initial keep / replace / remove decisions (provisional until Issue #1 closes)

| Asset | Current direction | Remaining verification |
|---|---|---|
| Repo and Supabase project identity | **KEEP** | Verify deployment and environment links |
| Supabase Auth service and eligible staff accounts | **EVALUATE / KEEP if suitable** | Session handling, authorization, current staff roster |
| `profiles` and role values | **REWORK** | Foreign keys, policies, auth consistency |
| Patient intake/whiteboard cards and logs | **REPLACE** | Secure recovery of old records, dependencies, triggers/views |
| UI layout and components | **REUSE SELECTIVELY** | Mobile workflow, auth, accessibility |
| Secrets, storage, RLS, deployment | **AUDIT BEFORE CHANGE** | Access, service keys, vendor/service suitability |

## October 22 implementation checkpoint (code candidate, not released)

- **Code rollback:** `archive/whiteboard-before-alumni-rebuild-20261022`, baseline commit `63614099bdcf710809f6f7ad87701992d9cf9f40`.
- **Development branch:** `feature/spr-alumni-staff-demo-v0-1`. **Draft PR:** https://github.com/Derek561/digital-patient-whiteboard/pull/3
- **Preview build:** https://digital-patient-whiteboard-5f2o9pqny-derek561s-projects.vercel.app/alumni-demo (Vercel READY at `c35c4997b6e15a3e1a87cad6169c047883dbb56c`). This proves compilation, not signed-in/mobile acceptance.
- **First slice coded:** existing staff authentication plus active-profile gate; 3 fictional alumni; simulated interaction outcomes; short notes; next follow-up date; interaction history and work queue; revoked contact prevents demo recording. No real calls, messages or Supabase writes. Local component state resets on refresh.
- **Inventory finding:** 11 FKs, 3 update triggers, 1 public function, zero public views/Edge Functions/migrations/storage objects. Vercel project `prj_EEiAc6ChtMNXJeLe9xhUsw9ZnAfl` connected. Existing policies are too broad for alumni.
- **Recovery:** source rollback established. SPR Supabase organization is Pro with daily-backup capability, but an actual restorable backup of this database has not been verified. **No destructive schema changes** until the database recovery path is verified.
- **Android first-field-test (2026-10-22):** two private screen recordings demonstrate existing staff sign-in, switching fictional alumni, saving simulated outcomes for Alex (text) and Jordan (call), and corresponding local interaction history/work queue cards. This is preliminary real-device acceptance for the **fictional UI only**. Additional user-provided Android screenshots **visually verified the fictional revoked-contact UI block** for Taylor Brooks: status warning, disabled form controls, disabled submit button. These checks do not prove persistence, server-side consent enforcement, iPhone behavior, or role-specific RLS. The `Legacy homepage` button still returns to the retired Whiteboard, and the mobile form is scroll-heavy; streamline and retire the legacy route as part of the alumni shell. See Issue #2 for details. No sensitive video attachments were committed.
- **Next Android refinement candidate (2026-10-22):** feature branch commit `c123493c44af5078dbc746225ccb3c7871e5fce5` passed Vercel READY build; preview https://digital-patient-whiteboard-btnii02h6-derek561s-projects.vercel.app/alumni-demo. Replaced tall mobile people cards with a compact selector, tightened form/header layout, collapsed optional notes, made outcomes method-specific, added history/queue counts and removed demo navigation to legacy Whiteboard. Recheck the compact interaction and revoked-contact behavior on an actual device before marking mobile refinement accepted. Changes remain isolated from production and do not write Supabase records.
- **Current task truth:** Issue #1 inventory mapping done / DB recovery verification open; Issue #2 candidate coded and built / staff, Android/iPhone and persistence/RLS acceptance open.
- **Inventory detail on feature branch:** `docs/SPR_ALUMNI_INVENTORY_AND_RECOVERY_2026-10-22.md`. Companion Drive project blueprint now records the same checkpoint.

## Workflow correction | 2026-10-22 desktop review

**Current demo gap:** the demo currently jumps from selecting a fictional alumni record directly to logging an outcome. There is **no functional call, text, email composer, dialer launch, two-way thread, or delivery confirmation**. This must not be confused with a complete staff communications workflow.

**Controlling workflow:** open alumni profile -> confirm consent and channel preferences -> **start/compose the actual or simulated communication** -> capture contact result/reply -> assign follow-up -> save audited history/work queue.

**Next demo change:** add first-class Call/Text/Email action layer with **simulation-only** initiation and explicit state transition to outcome entry. Preserve revoked-contact block at initiation as well as recording. Real desktop/mobile telephony or two-way messaging integrations require a separate provider/consent/security design, and no automatic delivery/status claims until implemented.

See [Issue #2](https://github.com/Derek561/digital-patient-whiteboard/issues/2) for the action-layer acceptance conditions. This corrects the existing approved staff slice and does not create a new milestone.

## Next action

**Issue #1, in order:** finish dependency/policy/auth/deployment inventory, record secure code+database recoverability, then identify the exact first non-destructive implementation change. No new whole-program discovery phase.

**Issue #2 follows:** staff sign-in → fictional alumni record → permitted contact method → outreach outcome → follow-up → history and queue confirmed under role and RLS tests on phones.

## Tracking discipline

This file states current direction, verified status, risks, and next action. GitHub issues/commits hold task-level evidence. The Google Drive blueprint holds business/operating decisions. Do not maintain competing trackers; DSS Core is a future read/oversight surface, not a prerequisite.

**Custody:** The companion Google Doc currently lives in the connected DSS Enterprises Drive SPR Projects folder because an SPR-owned Google Drive account is not connected. Confirm SPR-controlled document access/custody in the normal administrative workflow. This does not stop development with fictional records.
