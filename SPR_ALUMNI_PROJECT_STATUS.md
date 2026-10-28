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

## Next action

**Issue #1, in order:** finish dependency/policy/auth/deployment inventory, record secure code+database recoverability, then identify the exact first non-destructive implementation change. No new whole-program discovery phase.

**Issue #2 follows:** staff sign-in → fictional alumni record → permitted contact method → outreach outcome → follow-up → history and queue confirmed under role and RLS tests on phones.

## Tracking discipline

This file states current direction, verified status, risks, and next action. GitHub issues/commits hold task-level evidence. The Google Drive blueprint holds business/operating decisions. Do not maintain competing trackers; DSS Core is a future read/oversight surface, not a prerequisite.

**Custody:** The companion Google Doc currently lives in the connected DSS Enterprises Drive SPR Projects folder because an SPR-owned Google Drive account is not connected. Confirm SPR-controlled document access/custody in the normal administrative workflow. This does not stop development with fictional records.

## October 28, 2026 | Working demo acceptance and communication-provider discovery

**Verified local checkpoint (user's cloned workstation):** feature branch `feature/spr-alumni-staff-demo-v0-1` commit `3d9f0711106acb5beba43c0d4510838e1e8ac4ac` pulled successfully. Next.js 16.2.9 build passed; `/alumni-demo` served HTTP 200. Screenshots confirm fictional alumni selector, Call/Text/Email test actions, a text draft, a recorded fictional interaction, visible history and follow-up queue, and blocked Call/Text/Email initiation for fictional Taylor Brooks after revocation. This is **local, session-only demonstration acceptance**, not persistent data, actual communication delivery, backend consent enforcement, production release, or full phone acceptance. The outdated next-demo-change description above is now implemented as a demo UI slice; deeper work remains.

**Product clarification:** SPR Alumni Connect is an SPR-run alumni **communication, support, and relationship management system**, not an outcome logger. Texting is the staff's primary outreach channel. Staff must be able to send individual and periodic group texts, receive and answer replies, coordinate email, occasional calls, birthdays and meeting invitations, support requests, and follow-up. Administrators need a shared view of staff activity, unanswered replies, follow-ups, and aggregated engagement; reply counts are not proof of wellbeing or recovery outcomes. Keep human-friendly, low-friction workflows and the existing five milestones.

**Current tool vs integration candidate:** Drew/Dom currently use **Hit Em Up** (`hitemupapp.com`) for personalized mass texts through device-native messaging. Replies ordinarily return to the originating phone's messages, and an authenticated, supported API for automatic centralized reply ingestion has **not been established**. **Mobile Text Alerts** (`mobile-text-alerts.com`) is a DIFFERENT provider discovered during exploration, not the current staff application. Its developer materials describe an API for bulk/individual SMS/MMS, subscriber grouping, scheduled messages, incoming replies via webhooks, delivery status and reporting. It is a **candidate only**, not a selected vendor, contracted service, provisioned number, or verified SPR integration. Twilio and other options remain comparison candidates. Do not imply Mobile Text Alerts and Hit Em Up are the same product.

**Agreed system design direction, not implementation evidence:** one shared two-way staff inbox; individual and grouped outbound campaigns; incoming replies associated with alumni and campaign/message; assigned liaison, next action, response and support-request handling; birthday/scheduled outreach; administrator reporting of sent/accepted/delivered/failed/replied/unanswered with status distinctions. Store timestamps, provider message identifiers, actor and event provenance; never turn an API 200 into a delivery assertion. Consent/channel preferences, revocations and opt-outs must be enforced before outbound dispatch and reflected on inbound events. Keep the system provider-independent until the service and required privacy/contractual safeguards are selected and verified.

**Next engineering goalposts:** (1) verify restorable Supabase recovery baseline before destructive schema replacement; (2) implement persistent fictional alumni, conversation/message records, inbound-event model, staff assignment and follow-up with role-specific authorization and auditable history; (3) exercise shared inbox, group campaign and simulated replies; (4) perform a bounded provider comparison, then test a real send, inbound reply, status callback and opt-out only after authorized account, consent and privacy setup. Avoid more disconnected demo-only UI polishing without progress toward durable shared continuity. No new project or competing roadmap.

## October 28, 2026 | Persistent foundation gate opened

**Owner instruction:** Proceed with full-system fictional-data development on the already-approved five-milestone roadmap. Preserve source history and existing functionality until a recovery route is verified. The full demo must exercise database-backed fictional profiles, communications/replies, campaigns, support, staff handoffs and admin reporting. Later real-world service tests are separate from simulation acceptance.

**Live read-only check:** Existing Supabase project `ojhovkhnhwlocshpnmts` is ACTIVE_HEALTHY, still has 7 RLS-enabled public Whiteboard tables (`profiles` 4, `patient_cards` 18, `patient_activity_logs` 32, `patient_stage_history` 0, `next_actions` 0, `dropdown_options` 60, `audit_events` 0). Supabase branch listing returned none. The current connector has no backup-list/restore-point verification capability. **A restorable database backup has NOT been verified.** No SQL writes or destructive schema actions taken at this checkpoint.

**One recovery prerequisite:** In Supabase dashboard for project `ojhovkhnhwlocshpnmts`, inspect Database > Backups and confirm an actual completed backup and available restore path; record date/time and recovery scope without exposing sensitive backup contents. If no restorable backup exists, prepare a secure, verified recovery/export approach before replacement. Retain public GitHub without data exports or secrets. After recovery is confirmed, implement persistent fictional foundation with role-specific authorization and tests, preserving the simulation/live-provider boundary.

## October 28, 2026 | Supabase scheduled backups visibly confirmed

User-supplied screenshot of Supabase Database > Backups for project `ojhovkhnhwlocshpnmts` shows Pro plan, eight dated physical scheduled backups October 21–28, 2026, and visible Restore controls (latest Oct 28). This resolves the earlier *backup existence / restoration option visible* uncertainty. No restore was executed or tested, and storage object bytes are not covered by these backups; a tested recovery outcome is not claimed. Separate screenshot of Database > Migrations shows no migration history. Preserve original tables until the replacement is controlled, and build fictional alumni data using additive, reviewed migrations rather than deleting existing records as a first step.

## October 28, 2026 | Additive fictional alumni schema deployed

**Actual implementation:** Supabase migration `alumni_fictional_foundation_v01` completed successfully in the existing project `ojhovkhnhwlocshpnmts`. Six new tables created: `alumni_people`, `alumni_conversations`, `alumni_messages`, `alumni_followups`, `alumni_support_requests`, `alumni_events`. All six have RLS enabled, zero rows, no permissive policies. `alumni_people.is_fictional` is constrained true and `alumni_messages` currently accepts simulated status with no provider message ID only. No browser access granted, no messages sent, no users imported. This is a restricted schema foundation, not operational persistence yet.

**Verification:** Live list_tables returned all six RLS-enabled zero-row tables and retained the seven older Whiteboard tables and previous row counts (profiles 4, patient_cards 18, patient_activity_logs 32, dropdown_options 60, others 0). No existing records deleted. Next gate: tested staff-role authorization and audit event rules, insert fictional data through controlled workflow, and wire the existing staff UI to persisted shared records. Avoid prematurely labeling permission or cross-login acceptance as complete.
