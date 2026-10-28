# SPR Alumni Connect | Governing Product Anchor
**Locked direction: October 28, 2026**
**Status: Approved product doctrine; NOT a declaration of functional completion.**
**Applies to:** existing Next.js application at `/alumni-workspace`, existing GitHub feature branch, isolated Supabase fictional simulator, future SPR-operated program.

## North Star
Build a sustainable **SPR institutional Alumni Continuity and Program Management System**, not a contact log, manual recorder, staff-specific tool, or isolated demo. The program exists for alumni benefit and SPR organizational improvement, even if every current employee is replaced tomorrow.

**Operating principle: Least necessary human input, greatest reliable, useful output derived from each action.** Capture information once, at its source. Reuse it across history, communications, responsibilities, follow-up, services, program measurement, and leadership insight. No duplicated entry, assumed outcome, or invented inference.

## What the system operates
1. **Institutional foundation:** discharge-to-alumni transition, eligibility/enrollment, documented channel-specific consent and revocation, identity, preferences, access roles, auditability, backups, portability, handovers, and staff succession.
2. **Communications:** centralized inbound/outbound SMS and email, with supported phone/call events; provider adapter receives events, reconciles alumni identity, preserves message and delivery provenance, and retains threads across staff. Individual and consent-aware group campaigns, replies, opt-outs, birthdays and invitations. Existing Hit Em Up is NOT proven to provide a suitable shared inbound API; Mobile Text Alerts/Twilio are candidates, not installed commitments.
3. **Cadence engine:** configurable, discharge-date-driven outreach checkpoints including early post-discharge, week 1, day 30, continuing months, six/twelve months and later alumni engagement; schedule may change with real interactions, consent, preferences and staff decisions. Do **not** claim an exact universally mandated SAMHSA cadence. Distinguish SPR protocol from funder-specific assessments and legal obligations.
4. **Continuity engine:** identify incoming requests, route and prioritize attention, propose next steps, preserve commitments and responsible role, track acknowledgment vs action vs confirmed resolution, overdue work, handoffs, and clear current state. Human approval for uncertain classification and consequential conclusions. Never infer relapse, safety, wellness or service resolution merely from silence or message volume.
5. **Support and community operations:** alumni needs, assistance, resources, meetings, events, participation, outreach calendars and feedback. Preserve the difference between requested, acknowledged, provided, confirmed useful, and resolved.
6. **Program intelligence ON TOP of and designed INTO the whole system:** performance (responsiveness, timeliness, coverage, quality), effectiveness (needs addressed, alumni feedback), intelligence (emerging needs, engagement, trends, unmet resources, planning, program decisions and later re-measurement). Measure alumni-initiated messages separately from SPR-initiated outreach, and two-way interaction separately from raw volume. High communication volume is meaningful evidence of attempted engagement, but not proof of quality or recovery outcome. Define denominators, data provenance, timestamps, and what was observed vs inferred.

## Human interaction: start with what needs attention
Staff open **Today** to understand what has arrived, what SPR committed to, what's due, who is responsible, and what needs a decision. **Inbox** supports direct communication in context; **Alumni** offers searchable individual continuity/history; **Support** manages real needs; **Outreach** manages campaigns and cadence; **Community** manages events and participation; **Program Intelligence** helps leaders act on quality evidence; **Administration** handles people, roles, protocols, infrastructure and succession. A search and manual note remain available for exceptions, not primary operating flows.

All four current staff (admins Derek/Matt, liaisons Drew/Dom) share institutional history. Their names are current occupants of replaceable roles, never hard-coded program dependencies. Administrative privileges are narrower than staff operational access.

## Simulator acceptance = complete operating environment
**Simulator means functional connected fictional operations**, not just seeded names, save buttons, or a pretty dashboard. In the SAME `http://localhost:3000/alumni-workspace` app, staff must be able to:
- Enroll a fictional alumnus with discharge date, eligibility, permitted channels and evidence of consent; revoke a permission and observe every affected workflow.
- See generated post-discharge outreach cadence and simulate the passage of time without waiting weeks; demonstrate how a genuine communication affects pending cadence.
- Generate inbound SMS/email/call events and group campaigns without live sending; see identity matching, triage, assignment, response, conversation, status and due work update across Today, Inbox and Alumni.
- Resolve needs across staff and distinguish communicated/acknowledged/promised/delivered/confirmed; preserve all event provenance.
- Conduct and evaluate outreach, meeting invitations, events, participation and feedback.
- Review trustworthy performance/engagement/needs reports, drill down to source records, decide a program adjustment and check its measured effect.
- Replace/deactivate a staff user, transfer assigned obligations and prove the replacement can continue every relationship with no missing history.
- Operate coherently from a low-density, accessible, mobile-friendly shared app shell with minimal typing and no dead controls.

**Acceptance criteria:** one action causes every justified downstream update; simulated provider events are source events rather than manual re-entry; no silent inference of fulfillment; role and consent checks always enforced; each screen reflects the same truth. Tests and deficiencies are explicitly reported. This is NOT yet accepted as fully implemented.

## Architecture / existing assets to retain
- GitHub: `Derek561/digital-patient-whiteboard` branch `feature/spr-alumni-staff-demo-v0-1`.
- Supabase simulator project `gnawvoxpluyyaqvbpzwd`, branch `alumni-full-simulator`: fictional-only data, four test staff accounts; separate from original project `ojhovkhnhwlocshpnmts`. Do not write real patient/alumni data to public GitHub.
- Reuse current Next.js/Supabase authentication, alumni tables, 100 fictional alumni, shared messages, followups, support, Today and directory. Current Inbox, profile, record-contact UI remain transitional and need unification.
- Keep provider integrations replaceable and differentiate actual inbound webhook events from *simulated* fabricated ones. No live outbound SMS/email or real alumni data in test environment.
- Existing simulator was demonstrated with 100 fictional alumni, 24 open follow-ups, 12 support requests and 14 conversations; figures are test fixtures, not quality outcomes.
- Caveat: original Supabase branch provisioning was flagged `MIGRATIONS_FAILED` despite subsequent schema repair. Migration portability/recovery and security checks remain prerequisites to promotion.
- The repository README contains substantial historical Whiteboard content. Read this anchor and `SPR_ALUMNI_PROJECT_STATUS.md` for CURRENT project authority.

## Where we stopped
October 28: owner stopped feature implementation to reset product logic and asked to update anchor and README before leaving for the day. Earlier incremental UI work (Today, Directory, Support and mixed legacy Inbox/Record) **does not prove** an end-to-end system. A small scenario definition file `src/lib/alumni/simulator-scenarios.ts` may exist in the branch but **is not connected to an operational engine**. Do not represent it as complete.

**Resume with one vertical slice across the SAME simulator:** fictional discharge/enrollment -> consent/cadence -> simulated inbound/outbound event -> triage/commitment -> staff action/outcome -> updated all surfaces -> program intelligence. Then expand scenarios and institutional handover. Avoid more independent recorder forms or isolated mock dashboards. Minimize vendor costs and keep scope governed by actual benefit.

## Decision test for every next change
**Does this make SPR's Alumni program more usable, effective, measurable and resilient with less human effort?** If not, it is not the next priority. No new repo/project, no unnecessary repeated approval, and no claim of full operational readiness until tested end to end.
