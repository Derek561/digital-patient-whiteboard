-- The simulator never accepts live provider IDs or delivery status.
-- Synthetic replay IDs are required for message idempotency.
alter table public.alumni_messages drop constraint if exists alumni_messages_simulation_only;
alter table public.alumni_messages add constraint alumni_messages_simulation_only
check (delivery_state = 'simulated' and
(provider_message_id is null or provider_message_id ~ '^sim:[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'));
