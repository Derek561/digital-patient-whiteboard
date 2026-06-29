-- Digital Patient Whiteboard
-- Update stage constraint for outreach-focused v0.2 board lanes.

alter table public.patient_cards
drop constraint if exists patient_cards_stage_check;

alter table public.patient_cards
add constraint patient_cards_stage_check check (
  stage in (
    'New Inquiry / Lead',
    'Contact Attempt',
    'Screening / Qualification',
    'Detox Needed',
    'Referred to Detox',
    'Currently in Detox',
    'Expected From Detox',
    'Scheduled Admission',
    'Arrived / Intake',
    'Admitted',
    'Did Not Admit / Lost',
    'Aftercare Follow-Up',
    'Closed',

    -- legacy v0.1 stages kept temporarily so old test records do not break
    'Prospective Lead',
    'Pending Verification',
    'Pending Clinical Review',
    'Travel / ETA Confirmed',
    'Arrived / On Site',
    'Intake In Progress',
    'Did Not Admit',
    'Discharge / Transition Pending',
    'Closed / No Further Action'
  )
);
