-- Digital Patient Whiteboard
-- Outreach Refocus Columns v0.2
-- Purpose: Support pre-admission outreach, detox pathway, lead origin, and follow-up visibility.

alter table public.patient_cards
add column if not exists lead_source text,
add column if not exists referral_source_name text,
add column if not exists current_location_setting text,
add column if not exists detox_needed text not null default 'unknown',
add column if not exists detox_referred_to text,
add column if not exists current_detox text,
add column if not exists expected_from_detox text not null default 'unknown',
add column if not exists expected_to_admit_after_detox text not null default 'unknown',
add column if not exists target_program text,
add column if not exists conversion_status text not null default 'open',
add column if not exists next_follow_up_due_at timestamptz;

alter table public.patient_cards
drop constraint if exists patient_cards_detox_needed_check;

alter table public.patient_cards
add constraint patient_cards_detox_needed_check check (
  detox_needed in ('yes', 'no', 'unknown')
);

alter table public.patient_cards
drop constraint if exists patient_cards_expected_from_detox_check;

alter table public.patient_cards
add constraint patient_cards_expected_from_detox_check check (
  expected_from_detox in ('yes', 'no', 'maybe', 'unknown')
);

alter table public.patient_cards
drop constraint if exists patient_cards_expected_to_admit_after_detox_check;

alter table public.patient_cards
add constraint patient_cards_expected_to_admit_after_detox_check check (
  expected_to_admit_after_detox in ('yes', 'no', 'maybe', 'unknown')
);

alter table public.patient_cards
drop constraint if exists patient_cards_conversion_status_check;

alter table public.patient_cards
add constraint patient_cards_conversion_status_check check (
  conversion_status in ('open', 'likely', 'uncertain', 'lost', 'admitted', 'closed')
);

insert into public.dropdown_options (category, value, label, sort_order)
values
  ('lead_source', 'google_ad', 'Google Ad', 10),
  ('lead_source', 'organic', 'Organic', 20),
  ('lead_source', 'referral_partner', 'Referral Partner', 30),
  ('lead_source', 'family', 'Family', 40),
  ('lead_source', 'alumni', 'Alumni', 50),
  ('lead_source', 'self', 'Self', 60),
  ('lead_source', 'provider', 'Provider', 70),
  ('lead_source', 'hospital', 'Hospital', 80),
  ('lead_source', 'detox', 'Detox', 90),
  ('lead_source', 'other', 'Other', 100),

  ('current_location_setting', 'unknown', 'Unknown', 10),
  ('current_location_setting', 'home', 'Home', 20),
  ('current_location_setting', 'hospital', 'Hospital / Medical', 30),
  ('current_location_setting', 'detox', 'Detox', 40),
  ('current_location_setting', 'jail', 'Jail / Legal Custody', 50),
  ('current_location_setting', 'residential', 'Residential Treatment', 60),
  ('current_location_setting', 'outside_php_iop', 'Outside PHP / IOP', 70),
  ('current_location_setting', 'other', 'Other', 80),

  ('conversion_status', 'open', 'Open', 10),
  ('conversion_status', 'likely', 'Likely', 20),
  ('conversion_status', 'uncertain', 'Uncertain', 30),
  ('conversion_status', 'lost', 'Lost', 40),
  ('conversion_status', 'admitted', 'Admitted', 50),
  ('conversion_status', 'closed', 'Closed', 60)
on conflict (category, value) do nothing;
