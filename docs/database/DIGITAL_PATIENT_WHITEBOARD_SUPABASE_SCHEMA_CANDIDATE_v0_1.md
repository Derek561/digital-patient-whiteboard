# Digital Patient Whiteboard Supabase Schema Candidate v0.1

## Purpose

This document defines the first database planning candidate for the Digital Patient Whiteboard.

The system is a standalone Next.js + Supabase application. It is not a Kipu replacement, CRM replacement, or Oceanside Housing census replacement.

The first database design supports the build spine:

Cards. Stages. Owners. Blockers. Next actions. Logs. Role access.

## Core Tables

### 1. profiles

Stores staff profile and role information linked to Supabase Auth.

| Column     | Type        | Notes                                                                                            |
| ---------- | ----------- | ------------------------------------------------------------------------------------------------ |
| id         | uuid        | Primary key; references auth.users.id                                                            |
| full_name  | text        | Staff display name                                                                               |
| email      | text        | Staff email                                                                                      |
| role       | text        | admin, executive, admissions, outreach, clinical_leadership, case_management, housing_operations |
| is_active  | boolean     | Default true                                                                                     |
| created_at | timestamptz | Default now()                                                                                    |
| updated_at | timestamptz | Default now()                                                                                    |

### 2. patient_cards

Main operational movement card.

| Column                    | Type        | Notes                                               |
| ------------------------- | ----------- | --------------------------------------------------- |
| id                        | uuid        | Primary key                                         |
| patient_display_name      | text        | Initials or approved display name only              |
| stage                     | text        | Current lifecycle stage                             |
| level_of_care             | text        | PHP, IOP, OP, housing, detox referral, etc.         |
| referral_source           | text        | Basic source visibility                             |
| expected_date             | date        | Admission, transition, discharge, or follow-up date |
| expected_time             | time        | ETA or action time                                  |
| location_need             | text        | Housing, home, detox, hotel, unknown, not needed    |
| transportation_status     | text        | pending, confirmed, not_needed, issue               |
| insurance_payment_status  | text        | unknown, pending, verified, issue                   |
| clinical_clearance_status | text        | not_started, pending, approved, denied_referred_out |
| primary_owner_id          | uuid        | References profiles.id                              |
| blocker                   | text        | What is stopping movement                           |
| next_action               | text        | Specific next step                                  |
| next_action_due_at        | timestamptz | Due date/time                                       |
| priority                  | text        | low, medium, high, urgent                           |
| last_contact_at           | timestamptz | Last known contact                                  |
| operational_notes         | text        | Short minimum-necessary note                        |
| is_archived               | boolean     | Default false                                       |
| created_by                | uuid        | References profiles.id                              |
| created_at                | timestamptz | Default now()                                       |
| updated_at                | timestamptz | Default now()                                       |

### 3. patient_activity_logs

Preserves update history.

| Column                | Type        | Notes                                                                                     |
| --------------------- | ----------- | ----------------------------------------------------------------------------------------- |
| id                    | uuid        | Primary key                                                                               |
| patient_card_id       | uuid        | References patient_cards.id                                                               |
| stage_at_time         | text        | Stage when update was entered                                                             |
| update_type           | text        | contact, verification, clinical_review, transport, housing, aftercare, discharge, general |
| update_note           | text        | Operational note only                                                                     |
| next_action           | text        | Optional follow-up                                                                        |
| next_action_due_at    | timestamptz | Optional due date/time                                                                    |
| confidentiality_check | text        | Minimum necessary reminder / status                                                       |
| created_by            | uuid        | References profiles.id                                                                    |
| created_at            | timestamptz | Default now()                                                                             |

### 4. patient_stage_history

Tracks movement between lifecycle stages.

| Column          | Type        | Notes                       |
| --------------- | ----------- | --------------------------- |
| id              | uuid        | Primary key                 |
| patient_card_id | uuid        | References patient_cards.id |
| from_stage      | text        | Previous stage              |
| to_stage        | text        | New stage                   |
| changed_by      | uuid        | References profiles.id      |
| changed_at      | timestamptz | Default now()               |
| reason          | text        | Optional operational reason |

### 5. next_actions

Optional task layer for follow-up accountability.

| Column          | Type        | Notes                       |
| --------------- | ----------- | --------------------------- |
| id              | uuid        | Primary key                 |
| patient_card_id | uuid        | References patient_cards.id |
| title           | text        | Short action title          |
| description     | text        | Optional detail             |
| assigned_to     | uuid        | References profiles.id      |
| due_at          | timestamptz | Due date/time               |
| status          | text        | open, completed, canceled   |
| completed_at    | timestamptz | Completion timestamp        |
| created_by      | uuid        | References profiles.id      |
| created_at      | timestamptz | Default now()               |
| updated_at      | timestamptz | Default now()               |

### 6. dropdown_options

Admin-managed dropdown values.

| Column     | Type        | Notes                                                                    |
| ---------- | ----------- | ------------------------------------------------------------------------ |
| id         | uuid        | Primary key                                                              |
| category   | text        | stage, level_of_care, priority, blocker_type, update_type, location_need |
| value      | text        | Stored value                                                             |
| label      | text        | User-facing label                                                        |
| sort_order | integer     | Display order                                                            |
| is_active  | boolean     | Default true                                                             |
| created_at | timestamptz | Default now()                                                            |

### 7. audit_events

Tracks important system actions.

| Column      | Type        | Notes                                                               |
| ----------- | ----------- | ------------------------------------------------------------------- |
| id          | uuid        | Primary key                                                         |
| actor_id    | uuid        | References profiles.id                                              |
| action      | text        | created_card, updated_card, changed_stage, added_log, archived_card |
| entity_type | text        | patient_card, activity_log, next_action, profile                    |
| entity_id   | uuid        | Related record id                                                   |
| summary     | text        | Short audit summary                                                 |
| created_at  | timestamptz | Default now()                                                       |

## Initial Lifecycle Stages

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

## Initial Roles

1. admin
2. executive
3. admissions
4. outreach
5. clinical_leadership
6. case_management
7. housing_operations

## Security Direction

Row Level Security must be enabled before real use.

The default direction:

- Admin can manage all records.
- Executive can view dashboard and cards but should not edit routine records.
- Admissions can create and update admission movement cards.
- Outreach can create prospects and add contact updates.
- Clinical leadership can update clinical clearance status only.
- Case management can update transition and aftercare fields.
- Housing / operations can update location, transportation, and arrival-readiness fields.
- All users should only access minimum necessary information for their role.

## PHI Guardrail

The database should only store minimum necessary operational information.

Do not store clinical notes, therapy content, diagnoses, trauma details, medication narratives, or unnecessary PHI in v0.1.

## Open Decisions

| Decision                     | Default                                     | Status   |
| ---------------------------- | ------------------------------------------- | -------- |
| Store patient legal name?    | No, use display name/initials only for v0.1 | Proposed |
| Allow attachments?           | No                                          | Proposed |
| Enable exports?              | Executive/admin only later                  | Proposed |
| Add voice transcripts?       | No, future only                             | Proposed |
| Connect to Kipu/CRM/housing? | No, future integration only                 | Proposed |
