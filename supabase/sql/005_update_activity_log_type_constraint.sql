-- Digital Patient Whiteboard
-- Update activity log update_type constraint to support current app actions.

alter table public.patient_activity_logs
drop constraint if exists patient_activity_logs_update_type_check;

alter table public.patient_activity_logs
add constraint patient_activity_logs_update_type_check check (
  update_type in (
    'created',
    'updated',
    'stage_change',
    'blocker_update',
    'next_action_update',
    'detox_update',
    'note'
  )
);
