-- Atomic, staff-authorized, fictional-only inbound pipeline.
CREATE OR REPLACE FUNCTION public.alumni_receive_simulated_v06(p_alumni_id uuid, p_channel text, p_scenario text, p_event_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SET search_path TO 'public', 'pg_temp'
AS $function$
declare v_actor uuid:=auth.uid();v_body text;v_action text;v_category text;v_priority text;v_conversation uuid;v_assignee uuid;v_message uuid;v_existing uuid;v_id text:='sim:'||p_event_id::text;
begin
if v_actor is null or not exists(select 1 from public.alumni_staff_roles r join public.profiles p on p.id=r.staff_id where r.staff_id=v_actor and r.is_active and r.alumni_role in ('admin','liaison') and p.is_active) then raise exception 'Access denied'; end if;
if p_alumni_id is null or p_event_id is null or p_channel not in ('sms','email') or not exists(select 1 from public.alumni_people where id=p_alumni_id and is_fictional) then raise exception 'Invalid fictional event';end if;
case p_scenario
when 'transport' then v_body:='Could someone help me arrange a ride to my meeting tomorrow?';v_action:='Assist with transportation resources';v_category:='Transportation';v_priority:='high';
when 'housing' then v_body:='Can someone call me about housing options?';v_action:='Return requested call';v_category:='Housing';v_priority:='high';
when 'employment' then v_body:='Do you have information about employment resources?';v_action:='Assist with employment resources';v_category:='Employment';v_priority:='normal';
when 'meeting' then v_body:='What time is the next alumni meeting?';v_action:='Invite to alumni meeting';v_category:='Community meeting';v_priority:='normal';
when 'checkin' then v_body:='Just checking in. Things are going well!';v_priority:='low';
else raise exception 'Invalid scenario';end case;
perform pg_advisory_xact_lock(hashtextextended(v_id,0));
select m.id,m.conversation_id into v_message,v_conversation from public.alumni_messages m where m.provider_message_id=v_id;
if v_message is not null then return jsonb_build_object('duplicate',true,'conversation_id',v_conversation,'message_id',v_message);end if;
select c.id,c.assigned_staff_id into v_conversation,v_assignee from public.alumni_conversations c where c.alumni_id=p_alumni_id and c.channel=p_channel order by c.created_at desc limit 1;
if v_conversation is null then insert into public.alumni_conversations(alumni_id,channel,assigned_staff_id)values(p_alumni_id,p_channel,v_actor) returning id,assigned_staff_id into v_conversation,v_assignee;end if;
v_assignee:=coalesce(v_assignee,v_actor);
insert into public.alumni_messages(conversation_id,direction,body,delivery_state,provider_message_id,created_by) values(v_conversation,'inbound',v_body,'simulated',v_id,v_actor) returning id into v_message;
insert into public.alumni_events(alumni_id,actor_id,event_type,object_type,object_id,event_data) values(p_alumni_id,v_actor,'simulated_inbound_triage','message',v_message,jsonb_build_object('scenario',p_scenario,'priority',v_priority,'channel',p_channel,'source','simulation'));
if v_category is not null then
 select id into v_existing from public.alumni_support_requests where alumni_id=p_alumni_id and category=v_category and status in ('open','in_progress') limit 1;
 if v_existing is null then insert into public.alumni_support_requests(alumni_id,assigned_staff_id,category,summary,status)values(p_alumni_id,v_assignee,v_category,v_body,'open');end if;
end if;
if v_action is not null then
 select id into v_existing from public.alumni_followups where alumni_id=p_alumni_id and next_action=v_action and status='open' limit 1;
 if v_existing is null then insert into public.alumni_followups(alumni_id,conversation_id,assigned_staff_id,next_action,due_on) values(p_alumni_id,v_conversation,v_assignee,v_action,(now() at time zone 'America/New_York')::date);end if;
end if;
return jsonb_build_object('duplicate',false,'conversation_id',v_conversation,'message_id',v_message);
end $function$
;
revoke all on function public.alumni_receive_simulated_v06(uuid,text,text,uuid) from public,anon;
grant execute on function public.alumni_receive_simulated_v06(uuid,text,text,uuid) to authenticated;
