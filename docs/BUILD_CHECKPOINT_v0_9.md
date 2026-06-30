# Digital Patient Whiteboard / Outreach Movement Board
## Build Checkpoint v0.9

**Date:** 2026-06-30  
**Repo:** `Derek561/digital-patient-whiteboard`  
**Current milestone:** Local MVP operational build  
**Latest checkpoint commit:** `2a3f183 Add follow up work queue to dashboard`

---

## Purpose

This project is an operational visibility board for prospective patient movement, outreach follow-up, detox pathway tracking, blockers, ownership, and admission readiness.

The system is intended to support fast first-contact capture and follow-up accountability. It does **not** replace Kipu, CRM, Oceanside Housing census, or the official clinical record.

---

## Current Operational Boundary

This tool is for:

- Outreach movement visibility
- First-contact capture
- Detox pathway status
- Assigned ownership
- Follow-up due tracking
- Blockers and next actions
- Recent operational update trail

This tool is **not** for:

- Clinical documentation
- Therapy notes
- Diagnoses
- Trauma details
- Unnecessary PHI
- Billing
- Payroll
- Official census replacement

Minimum necessary operational information only.

---

## Completed Build Milestones

### v0.1 Initial Next.js / Supabase Base

Completed:

- Next.js app scaffolded
- Supabase connected
- Environment variables configured locally
- Login flow established through Supabase auth
- Protected dashboard route added

Core routes:

- `/`
- `/login`
- `/auth/callback`
- `/patients/new`
- `/patients/[id]`

---

### v0.2 Initial Outreach Dashboard

Completed:

- Main outreach movement dashboard
- Stage-based card layout
- Dashboard stat cards
- Basic board shell
- First operational wording pass

Dashboard title:

> Outreach, Detox Pathway, Admission Movement, and Follow-Up Visibility

---

### v0.3 Quick Capture / New Movement Card

Completed:

- New movement card form
- Quick capture layout
- Required fields kept minimal
- Advanced details kept collapsed
- Card creation flow
- Activity log on creation

Quick capture supports:

- Lead / Patient display name
- Current stage
- Lead source
- Current location / setting
- Detox needed
- Next action
- Assigned owner
- Quick note
- Advanced details

---

### v0.4 Patient Detail / Movement Update Flow

Completed:

- Card detail page
- Update movement stage
- Update detox pathway fields
- Update blocker
- Update next action
- Update follow-up due fields
- Activity logging for updates
- Minimum necessary reminder

Activity logs capture:

- Stage changes
- Location changes
- Detox-related changes
- Blocker changes
- Next action changes
- Quick update notes

---

### v0.5 Archive / Close Card Flow

Completed:

- Close / archive card section
- Close reason required
- Close note supported
- Archived cards leave active dashboard
- Close/archive action logs to Recent Updates

Archive behavior:

- Sets `is_archived = true`
- Updates conversion status
- Updates card stage when appropriate
- Preserves activity trail

---

### v0.6 Search and Filters

Completed:

- Search bar
- Stage filter
- Lead source filter
- Conversion status filter
- Clear filter link

Search supports:

- Patient display name
- Referral source
- Detox facility
- Current detox
- Next action
- Blocker
- Assigned owner

---

### v0.7 Hybrid Dictation Quick Update

Completed:

- Reusable `DictationTextarea` component
- Desktop browser Start Dictation / Stop support when available
- iPhone/Safari-friendly keyboard microphone fallback
- Manual typing fallback
- Quick Update Note on detail page uses dictation component

Component added:

```text
src/components/DictationTextarea.tsx
Key behavior:

No audio is saved
Text is reviewed before saving
Dictation appends into normal textarea
Form submit works normally

v0.8 Assigned Owner / Follow-Up Due

Completed:

Added assigned_owner column
Added owner field to quick capture
Added owner field to detail/edit page
Added owner visibility to dashboard cards
Added follow-up due visibility to dashboard cards
Added overdue badge to board cards
Owner changes log in Recent Updates

Migration added:

supabase/sql/006_add_assigned_owner.sql

Migration contents:

alter table public.patient_cards
add column if not exists assigned_owner text;

create index if not exists patient_cards_assigned_owner_idx
on public.patient_cards (assigned_owner);

create index if not exists patient_cards_next_follow_up_due_at_idx
on public.patient_cards (next_follow_up_due_at);
v0.8.1 Dictation on Quick Capture

Completed:

Quick Note on /patients/new now uses DictationTextarea
First-contact notes can be dictated
Quick capture notes save into card operational notes
Quick capture notes now appear in Recent Updates on card creation

Expected first-contact workflow:

Enter display name
Select lead source
Select location / status
Select detox needed
Select next action
Assign owner
Dictate or type quick note
Save movement card
v0.9 My Follow-Ups / Overdue Work Queue

Completed:

Work Queue section added to dashboard
Overdue Follow-Ups
Due Today
Upcoming
Unassigned
Queue cards click through to detail page

Work Queue answers:

What is overdue?
What is due today?
What is coming up?
What has no owner?

This turns the dashboard from a card wall into an accountability cockpit.

Current Dashboard Sections

Dashboard currently includes:

Header / boundary card
Work Queue
Stat cards
Search and filters
Outreach Movement Board lanes
Recent Updates
First Build Spine
Minimum Necessary Reminder
Current Board Stages
New Inquiry / Lead
Contact Attempt
Screening / Qualification
Detox Needed
Referred to Detox
Currently in Detox
Expected From Detox
Scheduled Admission
Arrived / Intake
Admitted
Did Not Admit / Lost
Aftercare Follow-Up
Closed
Current Stat Cards
Open Leads
Detox Referrals
Currently in Detox
Expected From Detox
Current Work Queue Buckets
Overdue Follow-Ups
Due Today
Upcoming
Unassigned
Current Key Files
src/app/page.tsx
src/app/login/page.tsx
src/app/login/actions.ts
src/app/auth/callback/route.ts
src/app/patients/new/page.tsx
src/app/patients/new/actions.ts
src/app/patients/[id]/page.tsx
src/app/patients/[id]/actions.ts
src/components/DictationTextarea.tsx
src/lib/supabase/client.ts
src/lib/supabase/server.ts
supabase/sql/001_initial_schema_candidate.sql
supabase/sql/002_outreach_refocus_columns.sql
supabase/sql/005_update_activity_log_type_constraint.sql
supabase/sql/006_add_assigned_owner.sql
Current Known Working Features

Confirmed working locally:

Supabase auth login
Protected dashboard
Create movement card
Quick capture
Quick capture dictation
Quick note saves
Quick note logs in Recent Updates
Assigned owner saves
Follow-up due date saves
Dashboard owner visibility
Dashboard follow-up visibility
Overdue badge
Work Queue
Card detail update
Detail page dictation quick update
Archive / close card
Recent Updates activity trail
Search and filters
Build passes
Recent Important Commits
84f79fd Add hybrid dictation quick note field
eb43ec6 Add owner and follow up visibility to dashboard
61e5910 Add owner workflow and dictation to quick capture
33aaa18 Log quick capture notes on card creation
2a3f183 Add follow up work queue to dashboard
Current Build Status

Last known build status:

npm run build
Build passed

Last known Git state:

working tree clean
origin/main up to date
Operational Use Case

This system is being shaped for staff who need a fast, simple way to record outreach movement without opening multiple systems or writing long notes.

Primary staff workflow:

Call comes in
Create quick movement card
Assign owner
Set next action
Set follow-up due
Dictate or type short operational note
Save
Manager sees it in dashboard/work queue

The system should be simple enough that staff will actually use it.

Design Direction

Keep the tool:

Fast
Phone-friendly
Dropdown-heavy
Dictation-friendly
Minimum necessary
Operational, not clinical
Easy to scan
Easy to update

Avoid:

Overbuilding
Long required forms
Excessive typing
Clinical note creep
Too many mandatory fields
Making the first-contact workflow feel like full intake
Next Recommended Milestones
v1.0 Staff Usability Pass

Potential improvements:

Mobile layout review
Larger tap targets
Sticky save button on mobile
Cleaner first-contact screen
Reduce visual clutter
Make owner/follow-up fields impossible to miss
v1.1 Owner Filter / My Queue

Potential improvements:

Filter by assigned owner
“My Follow-Ups” view
Owner dropdown presets
Quick filter buttons for Derek / Admissions / Case Manager / Outreach
v1.2 Follow-Up Completion Flow

Potential improvements:

Mark follow-up completed
Auto-clear overdue when updated
Add next follow-up after completion
Log completed follow-up event
v1.3 Deployment

Recommended deployment target:

Vercel

Deployment should wait until the local workflow feels usable enough for real staff feedback.

Before deployment:

npm run build
Confirm login
Confirm create card
Confirm update card
Confirm archive
Confirm work queue
Confirm dictation fallback
Review Supabase auth redirect URLs
Add production environment variables
Notes for Future Development

Do not make this a replacement for Kipu or CRM.

This board should remain a movement and accountability layer. The value is speed, visibility, and ownership.

The first-contact flow should collect enough to prevent losing the lead, not everything needed for admission.

Operational notes should stay short and minimum necessary.

Current Summary

As of v0.9, the project has reached a usable local MVP.

It supports quick outreach capture, dictation-friendly notes, assigned ownership, follow-up due visibility, overdue tracking, work queue accountability, activity logs, search/filter, and archive/close flow.

The next phase should focus on staff usability and owner-based workflow before deployment.