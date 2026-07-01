alter table public.patient_activity_logs
add column if not exists operational_notes text;
