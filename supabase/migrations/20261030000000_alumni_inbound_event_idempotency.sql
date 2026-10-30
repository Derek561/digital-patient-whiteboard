-- Fictional simulator and future inbound providers must supply a stable event ID.
-- Unique non-null provider IDs prevent duplicate message rows on replay.
create unique index if not exists alumni_messages_provider_message_id_unique
  on public.alumni_messages (provider_message_id)
  where provider_message_id is not null;
