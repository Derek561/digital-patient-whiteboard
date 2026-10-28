-- Baseline dependency for a fresh simulator database.
-- Existing main database already has public.profiles; do not run against main.
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  role text not null default 'outreach',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
grant select on public.profiles to authenticated;
create policy profiles_staff_read on public.profiles for select to authenticated using (true);
