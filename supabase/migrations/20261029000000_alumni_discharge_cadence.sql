-- Applied to isolated fictional simulator branch only on 2026-10-29.
-- Backfill of historical data is intentionally excluded.
alter table public.alumni_people add column if not exists discharge_on date;
create table if not exists public.alumni_cadence (
 id uuid primary key default gen_random_uuid(),
 alumni_id uuid not null references public.alumni_people(id) on delete cascade,
 checkpoint text not null,
 due_on date not null,
 status text not null default 'scheduled' check(status in ('scheduled','completed','skipped')),
 created_at timestamptz not null default now(),
 unique(alumni_id,checkpoint)
);
alter table public.alumni_cadence enable row level security;
-- PostgreSQL GRANT is required in addition to row-level security for Data API reads.
revoke all on table public.alumni_cadence from anon, authenticated, service_role;
grant select, update on table public.alumni_cadence to authenticated;
create policy "cadence_staff_read" on public.alumni_cadence for select to authenticated
 using (exists(select 1 from public.alumni_staff_roles r where r.staff_id=(select auth.uid()) and r.is_active and r.alumni_role in ('admin','liaison')));
create policy "cadence_staff_update" on public.alumni_cadence for update to authenticated
 using (exists(select 1 from public.alumni_staff_roles r where r.staff_id=(select auth.uid()) and r.is_active and r.alumni_role in ('admin','liaison')))
 with check (exists(select 1 from public.alumni_staff_roles r where r.staff_id=(select auth.uid()) and r.is_active and r.alumni_role in ('admin','liaison')));
create or replace function public.alumni_generate_cadence() returns trigger
 language plpgsql security definer set search_path=public as $$
begin
 if new.is_fictional and new.discharge_on is not null then
  insert into public.alumni_cadence(alumni_id,checkpoint,due_on)
  select new.id,x.checkpoint,new.discharge_on+x.days
  from (values ('Day 2',2),('Day 7',7),('Day 14',14),('Day 30',30),('Day 60',60),('Day 90',90),('Month 6',180),('Month 9',270),('Month 12',365)) x(checkpoint,days)
  on conflict(alumni_id,checkpoint) do update set due_on=excluded.due_on
   where alumni_cadence.status='scheduled';
 end if;
 return new;
end $$;
drop trigger if exists alumni_discharge_cadence on public.alumni_people;
create trigger alumni_discharge_cadence after insert or update of discharge_on
 on public.alumni_people for each row execute function public.alumni_generate_cadence();
