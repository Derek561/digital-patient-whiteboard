# Digital Patient Whiteboard Project Charter v0.1

## Project Name

Digital Patient Whiteboard

## Project Subtitle

Admissions, Movement, Transition, and Aftercare Visibility

## Core Decision

The Digital Patient Whiteboard will move forward as a custom Next.js + Supabase application. The existing spreadsheet will remain the planning blueprint only and will not be used as the live operational tool. The app will provide a human-centered interface for patient movement visibility, operational accountability, next-action ownership, and limited aftercare follow-up while maintaining clear boundaries from Kipu, CRM, and Oceanside Housing census.

## Boundary Statement

This tool does not replace Kipu, CRM, or Oceanside Housing census. It is a visibility layer for operational movement and accountability.

## First Build Spine

Cards. Stages. Owners. Blockers. Next actions. Logs. Role access.

## Immediate Next Steps

1. Create project scaffold.
2. Draft Supabase schema candidate.
3. Build dashboard and patient movement board wireframe.
4. Define role-based access.
5. Build v0.1 around cards, stages, owners, blockers, next actions, logs, and role access.

# Digital Patient Whiteboard Project Charter v0.1

## Project Name

**Digital Patient Whiteboard**

## Project Subtitle

**Admissions, Movement, Transition, and Aftercare Visibility**

## Project Status

Planning / Initial Build Preparation

## Core Decision

The **Digital Patient Whiteboard** will move forward as a custom **Next.js + Supabase** application.

The existing spreadsheet will remain the planning blueprint only and will **not** be used as the live operational tool.

The application will provide a human-centered interface for patient movement visibility, operational accountability, next-action ownership, and limited aftercare follow-up while maintaining clear boundaries from Kipu, CRM, and Oceanside Housing census.

## Boundary Statement

This tool does **not** replace Kipu, CRM, or Oceanside Housing census.

It is a visibility layer for operational movement and accountability.

## Purpose

The purpose of the Digital Patient Whiteboard is to create one shared operational view showing:

* Who is expected to come in
* Where the person is in the admissions or movement process
* What is blocking progress
* Who owns the next step
* When the next action is due
* Whether the person admitted, did not admit, transitioned, discharged, or requires aftercare follow-up

The system is designed to reduce scattered communication, unclear ownership, missed follow-ups, and operational confusion during patient movement.

## Problem Statement

Patient movement currently touches multiple areas, including outreach, admissions, clinical leadership, case management, housing/operations, and executive oversight.

Without a shared operational board, teams may rely on text messages, verbal updates, spreadsheets, CRM notes, Kipu documentation, or memory. This creates risk for:

* Missed admissions
* Unclear ownership
* Duplicate follow-up
* Poor visibility into blockers
* Confusion between outreach, admissions, housing, and clinical responsibilities
* Lost context after shift changes
* Inconsistent aftercare or transition follow-up

The Digital Patient Whiteboard is intended to solve the visibility and accountability gap without becoming a second clinical chart or CRM.

## What This Tool Is

The Digital Patient Whiteboard is:

* An operational movement board
* A shared visibility layer
* A next-action ownership tool
* A blocker tracking tool
* A status board for admissions and transitions
* A limited aftercare follow-up visibility tool
* A role-based staff interface
* A future voice-update-friendly workflow

## What This Tool Is Not

The Digital Patient Whiteboard is not:

* A CRM replacement
* A Kipu replacement
* A clinical documentation system
* A housing census replacement
* A billing platform
* A therapy note system
* A medical record
* A marketing pipeline system
* A payroll or staffing system

## Initial Build Principle

The first version must be simple enough for staff to use quickly.

The application should focus on:

**Cards. Stages. Owners. Blockers. Next actions. Logs. Role access.**

Anything outside of that should be considered future scope unless it directly supports the core workflow.

## Primary User Groups

| User Group           | Primary Use                                                                              |
| -------------------- | ---------------------------------------------------------------------------------------- |
| Outreach             | Add prospects, update contact status, identify referral source, document next follow-up  |
| Admissions           | Manage pending admission movement, verification status, arrival timing, intake readiness |
| Clinical Leadership  | Update clinical review status only                                                       |
| Housing / Operations | View arrival needs, transportation, location needs, and housing readiness                |
| Case Management      | Track discharge, transition, aftercare, appointments, and resource handoff needs         |
| Executive Leadership | View summary dashboard and operational movement overview                                 |
| Admin / System Owner | Manage users, roles, dropdowns, stages, permissions, and audit needs                     |

## Core Workflow

1. A prospective or expected patient is added to the board.
2. The patient is assigned a current movement stage.
3. A primary owner is assigned.
4. Any blocker is identified.
5. A next action is entered.
6. A due date/time is assigned.
7. Staff update the card as movement occurs.
8. Every meaningful update is written to the activity log.
9. The card is closed, admitted, transitioned, or moved to aftercare follow-up as appropriate.

## v0.1 Core Features

### 1. Patient Movement Cards

Each patient or prospective patient should appear as a card.

Minimum card fields:

| Field                | Purpose                                                      |
| -------------------- | ------------------------------------------------------------ |
| Patient Display Name | Initials or approved display name                            |
| Stage                | Current operational movement stage                           |
| Level of Care        | PHP, IOP, OP, housing, detox referral, etc.                  |
| Referral Source      | Outreach, family, provider, hospital, self, etc.             |
| Expected Date        | Admission, arrival, transition, discharge, or follow-up date |
| ETA / Time           | Expected arrival or action time                              |
| Location Need        | Housing, home, detox, hotel, unknown, not needed             |
| Transportation       | Pending, confirmed, not needed, issue                        |
| Insurance / Payment  | Unknown, pending, verified, issue                            |
| Clinical Clearance   | Not started, pending, approved, denied/referred out          |
| Primary Owner        | Staff/team responsible for next movement step                |
| Blocker              | What is stopping progress                                    |
| Next Action          | Specific next task                                           |
| Next Action Due      | Due date/time                                                |
| Priority             | Low, medium, high, urgent                                    |
| Last Contact         | Last known contact date/time                                 |
| Operational Notes    | Short non-clinical update                                    |

### 2. Lifecycle Stages

Initial stages:

1. Prospective Lead
2. Pending Verification
3. Pending Clinical Review
4. Scheduled Admission
5. Travel / ETA Confirmed
6. Arrived / On Site
7. Intake In Progress
8. Admitted
9. Did Not Admit
10. Discharge / Transition Pending
11. Aftercare Follow-Up
12. Closed / No Further Action

### 3. Activity Log

The board should show the current truth.

The activity log should show the history.

Activity log fields:

| Field                 | Purpose                                                                                   |
| --------------------- | ----------------------------------------------------------------------------------------- |
| Date/Time             | When the update occurred                                                                  |
| Patient Display Name  | Who the update relates to                                                                 |
| Stage at Time         | Stage when the update was entered                                                         |
| Staff / Owner         | Who entered the update                                                                    |
| Update Type           | Contact, verification, clinical review, transport, housing, aftercare, discharge, general |
| Update Note           | Short operational note                                                                    |
| Next Action           | Follow-up action                                                                          |
| Next Action Due       | Due date/time                                                                             |
| Confidentiality Check | Minimum necessary only                                                                    |

### 4. Role-Based Access

The system must support role-based visibility and editing.

Initial role model:

| Role                 |                                 View | Add Card | Edit Stage |   Add Log |  Export |
| -------------------- | -----------------------------------: | -------: | ---------: | --------: | ------: |
| Outreach             |                              Limited |      Yes |    Limited |       Yes |      No |
| Admissions           |                  Admissions Movement |      Yes |        Yes |       Yes | Limited |
| Clinical Leadership  |               Clinical Review Status |       No |    Limited |       Yes |      No |
| Housing / Operations | Location / Arrival / Transport Needs |  Limited |    Limited |       Yes |      No |
| Case Management      |               Transition / Aftercare |  Limited |        Yes |       Yes |      No |
| Executive Leadership |                  Summary / Read Only |       No |         No | Read Only |     Yes |
| Admin                |                                 Full |      Yes |        Yes |       Yes |     Yes |

### 5. Dashboard

The dashboard should show:

* Expected arrivals today
* Expected arrivals tomorrow
* High-priority blockers
* Overdue next actions
* Pending clinical review
* Pending verification
* Travel / ETA confirmed
* Discharge / transition pending
* Aftercare follow-up due
* Recently updated cards

### 6. Mobile-Friendly Staff Interface

The application must be usable from a phone.

The outreach/admissions experience should prioritize large, simple actions:

* Add New Prospect
* Update Status
* Add Contact Note
* Mark Blocker
* Set Next Action
* Confirm ETA
* Mark Did Not Admit
* Move to Aftercare Follow-Up
* Close / No Further Action

The interface should avoid spreadsheet-style data entry.

## Voice / Talk-to-Text Direction

Voice entry is a desired feature, but it should not be part of the first core build unless the basic workflow is stable.

### MVP Voice Strategy

Use native device dictation first:

* iPhone dictation
* Android voice typing
* Windows voice typing
* Browser-based dictation where available

### Future Voice Feature

Future app feature:

**Add Voice Update**

The user dictates an update, reviews the cleaned text, and approves it before saving.

Example dictated update:

> Talked to referral source. Patient is still coming today but insurance card is missing. They think arrival may be around 3.

Clean operational note:

> Referral source confirmed patient is still expected today. Insurance card remains pending. Estimated arrival time is approximately 3:00 PM. Admissions to follow up before arrival.

### Voice Guardrails

* Staff must review before saving.
* No automatic clinical conclusions.
* No diagnosis generation.
* No treatment narrative.
* No silent AI entry into the record.
* The saved note must remain operational and minimum necessary.

## PHI and Documentation Guardrails

Allowed:

* Initials or approved display name
* Expected admission or transition date
* Operational owner
* Movement stage
* Referral source
* Location need
* Transportation status
* Verification status
* Clinical clearance status only
* Blocker
* Next action
* Aftercare appointment status
* Resource handoff status

Not allowed:

* Full clinical history
* Therapy notes
* Trauma details
* Diagnoses unless specifically approved by compliance
* Medication narratives
* Psychotherapy content
* Detailed medical reasoning
* Unnecessary benefit details
* Full CRM history
* Housing financial details
* Uncontrolled screenshots or text chains as source of truth

## System of Record Boundaries

| Area                      | Digital Patient Whiteboard                 | System of Record                   |
| ------------------------- | ------------------------------------------ | ---------------------------------- |
| Outreach status           | Basic referral and next contact visibility | CRM                                |
| Admission movement        | Operational visibility                     | Kipu / Admissions record           |
| Clinical review           | Status only                                | Kipu / Clinical documentation      |
| Housing need              | Location/transport readiness only          | Oceanside Housing system           |
| Case management follow-up | Operational next action visibility         | Kipu case management documentation |
| Aftercare                 | Appointment/resource follow-up visibility  | Kipu / Alumni / CM process         |
| Audit                     | App activity log                           | Future audit log / Supabase        |

## Recommended Tech Stack

### Frontend

* Next.js
* TypeScript
* Tailwind CSS
* Mobile-first card interface

### Backend

* Supabase
* PostgreSQL
* Supabase Auth
* Supabase Row Level Security
* Supabase Storage only if approved for limited attachments later

### Initial Data Tables

| Table                 | Purpose                            |
| --------------------- | ---------------------------------- |
| profiles              | User profile and role              |
| patient_cards         | Main patient movement cards        |
| patient_activity_logs | Running operational update history |
| patient_stage_history | Tracks stage movement              |
| next_actions          | Tasks and follow-up ownership      |
| dropdown_options      | Managed select options             |
| audit_events          | Change tracking and accountability |

## Initial App Routes

Suggested route structure:

```text
/app
  /(auth)
    /login
  /(protected)
    /dashboard
    /board
    /patients/[id]
    /actions
    /aftercare
    /admin
```

## First Build Milestones

### Milestone 1: Project Scaffold

* Create Next.js app
* Add Tailwind
* Add Supabase client
* Add environment variables
* Add protected layout
* Add basic navigation

### Milestone 2: Supabase Schema

* Create profiles table
* Create patient_cards table
* Create patient_activity_logs table
* Create patient_stage_history table
* Create next_actions table
* Create dropdown_options table
* Create audit_events table
* Enable Row Level Security

### Milestone 3: Basic Board UI

* Dashboard cards
* Stage columns
* Patient movement cards
* Priority badges
* Blocker indicators
* Next-action due indicators

### Milestone 4: Add / Edit Patient Card

* Add new patient/prospect
* Edit stage
* Update owner
* Update blocker
* Update next action
* Update ETA
* Update priority

### Milestone 5: Activity Log

* Add log note
* Show history
* Preserve previous updates
* Track staff and timestamp

### Milestone 6: Role Access

* Admin role
* Outreach role
* Admissions role
* Clinical leadership role
* Housing / operations role
* Case management role
* Executive read-only role

### Milestone 7: Mobile Usability Pass

* Large buttons
* Drawer-based updates
* Quick update form
* Simple search
* Today / Tomorrow / Overdue filters

### Milestone 8: Pilot Review

* Test with limited users
* Review usability
* Review PHI boundaries
* Review role permissions
* Decide whether to expand

## v0.1 Success Criteria

The first version is successful if:

* Staff can add or update a patient card in under 60 seconds.
* Leadership can see expected movement without asking multiple people.
* Every active card has an owner and next action.
* Blockers are visible.
* The activity log preserves history.
* Users do not rely on spreadsheet data entry.
* The tool does not duplicate Kipu, CRM, or housing census.
* Role access prevents unnecessary visibility.
* The workflow is easier than text chains and verbal updates.

## Build Philosophy

Build the spine first.

The spine is:

**Cards. Stages. Owners. Blockers. Next actions. Logs. Role access.**

Do not overbuild before the core workflow works.

## Open Decisions

| Decision            | Recommended Default                                  | Status                                |
| ------------------- | ---------------------------------------------------- | ------------------------------------- |
| Final project name  | Digital Patient Whiteboard                           | Proposed                              |
| Live platform       | Next.js + Supabase                                   | Approved direction                    |
| Spreadsheet usage   | Blueprint only                                       | Approved direction                    |
| Voice feature       | Future layer after workflow proof                    | Proposed                              |
| Attachments         | Not included in v0.1                                 | Proposed                              |
| PHI level           | Minimum necessary only                               | Requires leadership/compliance review |
| App hosting         | Netlify or Vercel                                    | Open                                  |
| Authentication      | Supabase Auth                                        | Proposed                              |
| Initial pilot group | Outreach, Admissions, Ops, Clinical Lead, CM/Housing | Proposed                              |

## Immediate Next Step

Create the repo planning document at:

```text
docs/DIGITAL_PATIENT_WHITEBOARD_PROJECT_CHARTER_v0_1.md
```

Then begin with:

1. Project scaffold
2. Supabase schema candidate
3. UI wireframe for dashboard and board
4. Role access plan
5. v0.1 build checklist
