# Digital Patient Whiteboard / Outreach Movement Board

## Project Overview

The Digital Patient Whiteboard, also referred to as the Outreach Movement Board, is an operational visibility system for tracking prospective patient movement from first contact through outreach follow-up, detox pathway coordination, admission readiness, and final outcome.

This system is designed for fast use by outreach, admissions, alumni support, operations, and leadership staff who need a clear view of what is happening now, who owns the next step, and what needs attention.

It is not intended to replace Kipu, CRM, Oceanside Housing census, billing systems, or the official clinical record.

This is a minimum-necessary operational movement tool.

---

## Core Purpose

The system exists to answer practical questions quickly:

- Who contacted us?
- Where is the person in the outreach/admission pathway?
- Who owns the next follow-up?
- What is due today?
- What is overdue?
- Is the person in detox?
- Are they expected from detox?
- What is blocking the next step?
- What needs to happen next?
- Did the person admit, not admit, or close out?

The goal is to prevent leads, referrals, detox handoffs, and follow-ups from getting lost in texts, phone calls, memory, paper notes, or disconnected systems.

---

## Operational Boundary

This system is for operational movement tracking only.

### This system is for:

- First-contact capture
- Outreach movement tracking
- Admission movement visibility
- Detox pathway coordination
- Assigned owner tracking
- Follow-up due dates
- Overdue follow-up visibility
- Next actions
- Blockers
- Activity updates
- Archive / close workflow
- Leadership visibility

### This system is not for:

- Clinical documentation
- Therapy notes
- Diagnoses
- Trauma details
- Medical decision-making
- Billing
- Payroll
- Insurance documentation
- Official Kipu charting
- Official housing census replacement

Staff should enter only minimum necessary operational information.

---

## Current System Status

Current milestone:

```text
v0.9 Local and Production MVP

The system currently supports:

Password-based staff login
Role/profile-based access foundation
Staff session header
Sign out button
Dashboard visibility
Quick movement card creation
Dictation-supported quick notes
Assigned owner tracking
Follow-up due dates
Work queue
Overdue follow-up tracking
Search and filters
Patient movement detail page
Activity log updates
Archive / close card flow
Supabase-backed data storage
Vercel production deployment

Main Workflow

The basic staff workflow is:

1. Staff receives or makes outreach contact.
2. Staff creates a quick movement card.
3. Staff assigns owner.
4. Staff selects next action.
5. Staff sets follow-up due date.
6. Staff types or dictates a short operational note.
7. Management sees the card on the dashboard.
8. Follow-up appears in work queue.
9. Card is updated as movement changes.
10. Card is closed or archived when no longer active.

Primary Screens
Login

Staff sign in with:

Email
Password

Magic-link login was tested but replaced because password login is more practical for daily operational use.

Future login options may include Google sign-in.

Dashboard

The dashboard provides the main operational view.

Current dashboard sections:

Staff session header
Outreach Movement Board header
Work Queue
Stat cards
Search and filters
Stage-based movement board
Recent Updates
First Build Spine
Minimum Necessary Reminder

Work Queue

The Work Queue answers the main accountability questions:

What is overdue?
What is due today?
What is upcoming?
What has no owner?

Current buckets:

Overdue Follow-Ups
Due Today
Upcoming
Unassigned

Movement Board

Cards are grouped by operational stage.

Current stages:

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

New Movement Card

The quick capture screen is designed for fast entry.

Current fields include:

Lead / patient display name
Current stage
Lead source
Current location / setting
Detox needed
Next action
Assigned owner
Quick note
Advanced details section

The quick note supports dictation where available and also works as a normal text field.

Movement Detail Page

The detail page allows staff to update an existing card.

Supported updates include:

Stage
Conversion status
Current location / setting
Detox needed
Detox referred to
Current detox
Expected from detox
Expected admission after detox
Blocker
Next action
Follow-up due
Assigned owner
Quick update note
Operational notes


Archive / Close Flow

Cards can be closed or archived when they should leave the active dashboard.

Archive/close behavior:

Removes card from active board
Preserves activity history
Records close reason
Supports close note
Updates status/stage as appropriate

User Roles

The current profile role system supports these role values:

admin
executive
admissions
outreach
clinical_leadership
case_management
housing_operations

Current intended role mapping:

Derek = admin
Matt = admin
Dominic = outreach
Drew = outreach

Future role behavior may include:

Admin-only staff onboarding
Admin-only user management
Role-based dashboard views
Role-based access restrictions
Owner-based queues
Current Authentication Direction

Password login is currently used for production testing and demo access.

Current login method:

Email + password

Future recommended authentication options:

Google login
Password login backup
Admin-created staff accounts
Password recovery
Role-based access

Magic links were removed from the primary login flow because they created too much friction for staff use and demo testing.

Technology Stack

Core stack:

Next.js
React
TypeScript
Tailwind CSS
Supabase
Vercel

Primary services:

Supabase Auth
Supabase Postgres
Supabase Row Level Security
Vercel Production Deployment
GitHub Repository
Key Project Files
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

Database planning and migrations:

supabase/sql/001_initial_schema_candidate.sql
supabase/sql/002_outreach_refocus_columns.sql
supabase/sql/005_update_activity_log_type_constraint.sql
supabase/sql/006_add_assigned_owner.sql

Project documentation:

docs/BUILD_CHECKPOINT_v0_9.md
docs/DIGITAL_PATIENT_WHITEBOARD_OUTREACH_REFOCUS_v0_2.md
docs/DIGITAL_PATIENT_WHITEBOARD_PROJECT_CHARTER_v0_1.md
docs/database/DIGITAL_PATIENT_WHITEBOARD_SUPABASE_SCHEMA_CANDIDATE_v0_1.md
Environment Variables

Required environment variables:

NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_SITE_URL=

For local Codespaces development, NEXT_PUBLIC_SITE_URL should point to the Codespaces forwarded URL.

For production Vercel deployment, NEXT_PUBLIC_SITE_URL should point to:

https://digital-patient-whiteboard.vercel.app

Important:

Never expose the Supabase service role key in client-side code.

If a service role key is later needed for admin user creation, it must be stored server-side only as:

SUPABASE_SERVICE_ROLE_KEY=

Never use:

NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY=
Production Deployment

Production deployment is handled through Vercel.

Production URL:

https://digital-patient-whiteboard.vercel.app

Deployment flow:

Code pushed to GitHub main branch
Vercel auto-deploys
Supabase environment variables are loaded in Vercel
Production app updates

Before pushing to production:

npm run build
git status

Standard commit flow:

git add .
git commit -m "Describe change"
git push origin main

Supabase Configuration Notes

Supabase Auth users are separate from app profiles.

Two layers are required:

1. Supabase Auth user
2. public.profiles row

The Auth user controls login.

The profile row controls app role and display/access behavior.

Current profile table role constraint allows:

admin
executive
admissions
outreach
clinical_leadership
case_management
housing_operations
Current Known Working Features

Confirmed working:

Production deployment
Email/password login
Staff session header
Sign out button
Dashboard loads
Work Queue displays
Quick capture creates cards
Assigned owner saves
Follow-up due saves
Quick notes save
Recent Updates logs activity
Search/filter works
Detail page updates work
Archive/close flow works
Drew login works
Dominic login works

Pending verification:

Derek password reset/login
Matt password reset/login
Final password recovery workflow
Admin staff onboarding page
Role-based UI restrictions
Near-Term Roadmap
v1.0 Staff Usability Pass

Focus:

Mobile layout review
Larger tap targets
Cleaner phone experience
Sticky save button
Less visual clutter
Easier first-contact capture
Clearer staff instructions
v1.1 Admin Staff Access Page

Goal:

Create an in-app admin page so approved admins can add staff without using the Supabase dashboard.

Potential route:

/dashboard/admin/users

Features:

Create staff user
Assign role
Set temporary password
Update profile
Reset password
Deactivate user
View active users

Important security requirement:

This feature requires the Supabase service role key and must be server-side only.

v1.2 Owner-Based Queue

Focus:

Filter by assigned owner
“My Follow-Ups”
“All Follow-Ups”
Owner dropdown presets
Staff-specific accountability views
v1.3 Follow-Up Completion Flow

Focus:

Mark follow-up completed
Add next follow-up
Clear overdue status
Log completed follow-up
Keep activity history clean
v1.4 Role-Based Permissions

Focus:

Admin access
Executive access
Outreach access
Admissions access
Housing operations access
Case management access

Possible permissions:

Admin: full access
Executive: full visibility
Outreach: create/update assigned cards
Admissions: admission movement focus
Housing operations: detox/housing movement focus
Case management: follow-up support view
v1.5 Production Hardening

Focus:

Error handling
Empty states
Rate limit handling
Better password reset workflow
Audit trail polish
Mobile QA
Vercel/Supabase environment documentation
Staff training notes
Development Commands

Install dependencies:

npm install

Run local development server:

npm run dev

Run production build check:

npm run build

Format selected files:

npx prettier --write .

Check Git state:

git status

Push changes:

git add .
git commit -m "Describe change"
git push origin main

Operational Philosophy

This tool should stay fast, simple, and useful.

The first-contact workflow should collect enough information to prevent losing the lead, not everything needed for full admission.

Staff should not have to write long notes.

Managers should be able to see what needs attention in seconds.

The system should favor:

Dropdowns
Short notes
Dictation support
Clear ownership
Clear next action
Follow-up accountability
Minimum necessary information

The system should avoid:

Clinical note creep
Overbuilding forms
Too many required fields
Duplicate official documentation
Confusing login flows
Slow staff workflows
Final Product Vision

When complete, this system should function as a live operational command board for outreach and admission movement.

It should help staff and leadership see:

Who is in motion
Where they are in the process
Who owns the next step
What is due now
What is overdue
What is blocked
What needs to happen next
What closed out

The goal is not to create another documentation burden.

The goal is to create a fast, clear, accountable movement layer so opportunities, referrals, detox handoffs, and follow-ups do not disappear into the fog.
