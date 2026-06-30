alter table public.patient_cards
add column if not exists assigned_owner text;

create index if not exists patient_cards_assigned_owner_idx
on public.patient_cards (assigned_owner);

create index if not exists patient_cards_next_follow_up_due_at_idx
on public.patient_cards (next_follow_up_due_at);