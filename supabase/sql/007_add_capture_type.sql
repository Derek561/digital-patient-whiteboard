alter table public.patient_cards
add column if not exists capture_type text;

alter table public.patient_cards
drop constraint if exists patient_cards_capture_type_check;

alter table public.patient_cards
add constraint patient_cards_capture_type_check
check (
  capture_type is null
  or capture_type in (
    'potential_client',
    'referral_source_admission',
    'relapse_detox'
  )
);

create index if not exists patient_cards_capture_type_idx
on public.patient_cards (capture_type);
