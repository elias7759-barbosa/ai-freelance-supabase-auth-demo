-- Test-only delivery transport: confirmation remains mandatory.
-- No Data API exposure or browser-accessible mailbox.
create schema auth_test;
revoke all on schema auth_test from public, anon, authenticated, service_role;
grant usage on schema auth_test to supabase_auth_admin;

create table auth_test.mailbox (
  id uuid primary key default gen_random_uuid(),
  email text not null check (email ~ '^demo-[a-z0-9-]+@example\.test$'),
  otp text not null,
  action text not null,
  created_at timestamptz not null default now()
);
alter table auth_test.mailbox enable row level security;
revoke all on auth_test.mailbox from public, anon, authenticated, service_role;
grant select, insert, delete on auth_test.mailbox to supabase_auth_admin;
create policy "Auth transport only" on auth_test.mailbox
  for all to supabase_auth_admin using (true) with check (true);

create function auth_test.capture_email(event jsonb)
returns jsonb language plpgsql security invoker set search_path = '' as $$
declare address text := lower(event->'user'->>'email');
begin
  if address is null or address !~ '^demo-[a-z0-9-]+@example\.test$' then
    return jsonb_build_object('error',jsonb_build_object('http_code',400,'message','This sandbox accepts fictional demo addresses only.'));
  end if;
  delete from auth_test.mailbox where created_at < now() - interval '10 minutes';
  insert into auth_test.mailbox(email, otp, action)
  values(address,event->'email_data'->>'token',event->'email_data'->>'email_action_type');
  return '{}'::jsonb;
end;
$$;
revoke all on function auth_test.capture_email(jsonb) from public, anon, authenticated, service_role;
grant execute on function auth_test.capture_email(jsonb) to supabase_auth_admin;
