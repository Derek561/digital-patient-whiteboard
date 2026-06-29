-- Digital Patient Whiteboard
-- Initial Supabase Schema Candidate v0.1
-- Purpose: Cards. Stages. Owners. Blockers. Next actions. Logs. Role access.

create extension if not exists "pgcrypto";

-- =========================================================
-- PROFILES
-- Links app users to Supabase Auth users.
-- =========================================================

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  role text not null default 'outreach',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint profiles_role_check check (
    role in (
      'admin',
      'executive',
      'admissions',
      'outreach',
      'clinical_leadership',
      'case_management',
      'housing_operations'
    )
  )
);

-- =========================================================
-- PATIENT CARDS
-- Main operational whiteboard card.
-- Minimum necessary only.
-- =========================================================

create table if not exists public.patient_cards (
  id uuid primary key default gen_random_uuid(),

  patient_display_name text not null,
  stage text not null default 'Prospective Lead',
  level_of_care text,
  referral_source text,

  expected_date date,
  expected_time time,

  location_need text,
  transportation_status text not null default 'pending',
  insurance_payment_status text not null default 'unknown',
  clinical_clearance_status text not null default 'not_started',

  primary_owner_id uuid references public.profiles(id) on delete set null,

  blocker text,
  next_action text,
  next_action_due_at timestamptz,
  priority text not null default 'medium',
  last_contact_at timestamptz,
  operational_notes text,

  is_archived boolean not null default false,

  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint patient_cards_stage_check check (
    stage in (
      'Prospective Lead',
      'Pending Verification',
      'Pending Clinical Review',
      'Scheduled Admission',
      'Travel / ETA Confirmed',
      'Arrived / On Site',
      'Intake In Progress',
      'Admitted',
      'Did Not Admit',
      'Discharge / Transition Pending',
      'Aftercare Follow-Up',
      'Closed / No Further Action'
    )
  ),

  constraint patient_cards_transportation_check check (
    transportation_status in (
      'pending',
      'confirmed',
      'not_needed',
      'issue'
    )
  ),

  constraint patient_cards_insurance_payment_check check (
    insurance_payment_status in (
      'unknown',
      'pending',
      'verified',
      'issue'
    )
  ),

  constraint patient_cards_clinical_clearance_check check (
    clinical_clearance_status in (
      'not_started',
      'pending',
      'approved',
      'denied_referred_out'
    )
  ),

  constraint patient_cards_priority_check check (
    priority in (
      'low',
      'medium',
      'high',
      'urgent'
    )
  )
);

-- =========================================================
-- PATIENT ACTIVITY LOGS
-- Preserves history.
-- Board shows current truth.
-- Logs show what happened.
-- =========================================================

create table if not exists public.patient_activity_logs (
  id uuid primary key default gen_random_uuid(),

  patient_card_id uuid not null references public.patient_cards(id) on delete cascade,
  stage_at_time text,
  update_type text not null default 'general',
  update_note text not null,
  next_action text,
  next_action_due_at timestamptz,
  confidentiality_check text default 'Minimum necessary only',

  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),

  constraint patient_activity_logs_update_type_check check (
    update_type in (
      'contact',
      'verification',
      'clinical_review',
      'transport',
      'housing',
      'aftercare',
      'discharge',
      'general'
    )
  )
);

-- =========================================================
-- PATIENT STAGE HISTORY
-- Tracks stage movement over time.
-- =========================================================

create table if not exists public.patient_stage_history (
  id uuid primary key default gen_random_uuid(),

  patient_card_id uuid not null references public.patient_cards(id) on delete cascade,
  from_stage text,
  to_stage text not null,
  changed_by uuid references public.profiles(id) on delete set null,
  changed_at timestamptz not null default now(),
  reason text
);

-- =========================================================
-- NEXT ACTIONS
-- Optional task layer for accountability.
-- =========================================================

create table if not exists public.next_actions (
  id uuid primary key default gen_random_uuid(),

  patient_card_id uuid not null references public.patient_cards(id) on delete cascade,
  title text not null,
  description text,
  assigned_to uuid references public.profiles(id) on delete set null,
  due_at timestamptz,
  status text not null default 'open',
  completed_at timestamptz,

  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint next_actions_status_check check (
    status in (
      'open',
      'completed',
      'canceled'
    )
  )
);

-- =========================================================
-- DROPDOWN OPTIONS
-- Admin-managed select values.
-- =========================================================

create table if not exists public.dropdown_options (
  id uuid primary key default gen_random_uuid(),

  category text not null,
  value text not null,
  label text not null,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),

  unique(category, value)
);

-- =========================================================
-- AUDIT EVENTS
-- Tracks important system actions.
-- =========================================================

create table if not exists public.audit_events (
  id uuid primary key default gen_random_uuid(),

  actor_id uuid references public.profiles(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  summary text,
  created_at timestamptz not null default now()
);

-- =========================================================
-- UPDATED_AT TRIGGER FUNCTION
-- =========================================================

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

drop trigger if exists set_patient_cards_updated_at on public.patient_cards;
create trigger set_patient_cards_updated_at
before update on public.patient_cards
for each row
execute function public.set_updated_at();

drop trigger if exists set_next_actions_updated_at on public.next_actions;
create trigger set_next_actions_updated_at
before update on public.next_actions
for each row
execute function public.set_updated_at();

-- =========================================================
-- SEED DROPDOWN OPTIONS
-- =========================================================

insert into public.dropdown_options (category, value, label, sort_order)
values
  ('stage', 'Prospective Lead', 'Prospective Lead', 10),
  ('stage', 'Pending Verification', 'Pending Verification', 20),
  ('stage', 'Pending Clinical Review', 'Pending Clinical Review', 30),
  ('stage', 'Scheduled Admission', 'Scheduled Admission', 40),
  ('stage', 'Travel / ETA Confirmed', 'Travel / ETA Confirmed', 50),
  ('stage', 'Arrived / On Site', 'Arrived / On Site', 60),
  ('stage', 'Intake In Progress', 'Intake In Progress', 70),
  ('stage', 'Admitted', 'Admitted', 80),
  ('stage', 'Did Not Admit', 'Did Not Admit', 90),
  ('stage', 'Discharge / Transition Pending', 'Discharge / Transition Pending', 100),
  ('stage', 'Aftercare Follow-Up', 'Aftercare Follow-Up', 110),
  ('stage', 'Closed / No Further Action', 'Closed / No Further Action', 120),

  ('priority', 'low', 'Low', 10),
  ('priority', 'medium', 'Medium', 20),
  ('priority', 'high', 'High', 30),
  ('priority', 'urgent', 'Urgent', 40),

  ('transportation_status', 'pending', 'Pending', 10),
  ('transportation_status', 'confirmed', 'Confirmed', 20),
  ('transportation_status', 'not_needed', 'Not Needed', 30),
  ('transportation_status', 'issue', 'Issue', 40),

  ('insurance_payment_status', 'unknown', 'Unknown', 10),
  ('insurance_payment_status', 'pending', 'Pending', 20),
  ('insurance_payment_status', 'verified', 'Verified', 30),
  ('insurance_payment_status', 'issue', 'Issue', 40),

  ('clinical_clearance_status', 'not_started', 'Not Started', 10),
  ('clinical_clearance_status', 'pending', 'Pending', 20),
  ('clinical_clearance_status', 'approved', 'Approved', 30),
  ('clinical_clearance_status', 'denied_referred_out', 'Denied / Referred Out', 40),

  ('update_type', 'contact', 'Contact', 10),
  ('update_type', 'verification', 'Verification', 20),
  ('update_type', 'clinical_review', 'Clinical Review', 30),
  ('update_type', 'transport', 'Transport', 40),
  ('update_type', 'housing', 'Housing', 50),
  ('update_type', 'aftercare', 'Aftercare', 60),
  ('update_type', 'discharge', 'Discharge', 70),
  ('update_type', 'general', 'General', 80)
on conflict (category, value) do nothing;

-- =========================================================
-- ROW LEVEL SECURITY
-- Enabled now, permissive policies added for development only.
-- Tighten before real PHI-adjacent use.
-- =========================================================

alter table public.profiles enable row level security;
alter table public.patient_cards enable row level security;
alter table public.patient_activity_logs enable row level security;
alter table public.patient_stage_history enable row level security;
alter table public.next_actions enable row level security;
alter table public.dropdown_options enable row level security;
alter table public.audit_events enable row level security;

-- Development read/write policies.
-- These are NOT final production policies.

create policy "Authenticated users can read profiles"
on public.profiles
for select
to authenticated
using (true);

create policy "Authenticated users can read patient cards"
on public.patient_cards
for select
to authenticated
using (true);

create policy "Authenticated users can insert patient cards"
on public.patient_cards
for insert
to authenticated
with check (true);

create policy "Authenticated users can update patient cards"
on public.patient_cards
for update
to authenticated
using (true)
with check (true);

create policy "Authenticated users can read activity logs"
on public.patient_activity_logs
for select
to authenticated
using (true);

create policy "Authenticated users can insert activity logs"
on public.patient_activity_logs
for insert
to authenticated
with check (true);

create policy "Authenticated users can read stage history"
on public.patient_stage_history
for select
to authenticated
using (true);

create policy "Authenticated users can insert stage history"
on public.patient_stage_history
for insert
to authenticated
with check (true);

create policy "Authenticated users can read next actions"
on public.next_actions
for select
to authenticated
using (true);

create policy "Authenticated users can insert next actions"
on public.next_actions
for insert
to authenticated
with check (true);

create policy "Authenticated users can update next actions"
on public.next_actions
for update
to authenticated
using (true)
with check (true);

create policy "Authenticated users can read dropdown options"
on public.dropdown_options
for select
to authenticated
using (true);

create policy "Authenticated users can read audit events"
on public.audit_events
for select
to authenticated
using (true);

create policy "Authenticated users can insert audit events"
on public.audit_events
for insert
to authenticated
with check (true);
