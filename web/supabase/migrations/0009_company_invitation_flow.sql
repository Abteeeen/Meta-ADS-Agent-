-- One-time company invitation issuance and acceptance.
-- Raw tokens are returned once; only SHA-256 hashes are persisted.
create or replace function private.create_company_invitation(
  target_company_id uuid,
  invite_email text,
  invite_role text default 'client_viewer',
  validity_hours integer default 24
)
returns table (invitation_id uuid, invite_token text, expires_at timestamptz)
language plpgsql
security definer
set search_path = public, private, pg_temp
as $$
declare
  normalized_email text := lower(trim(invite_email));
  raw_token text;
  new_invitation_id uuid;
  invitation_expiry timestamptz;
begin
  if auth.uid() is null then
    raise exception 'Authentication is required.';
  end if;

  if not public.can_operate_company(target_company_id) then
    raise exception 'You do not have permission to invite members to this company.';
  end if;

  if normalized_email !~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$' then
    raise exception 'Enter a valid email address.';
  end if;

  if invite_role not in ('client_admin', 'client_viewer') then
    raise exception 'Unsupported company role.';
  end if;

  if validity_hours not between 1 and 168 then
    raise exception 'Invitation validity must be between 1 and 168 hours.';
  end if;

  update public.company_invitations
  set status = 'revoked'
  where company_id = target_company_id
    and email = normalized_email
    and status = 'pending';

  raw_token := encode(gen_random_bytes(32), 'hex');
  invitation_expiry := now() + make_interval(hours => validity_hours);

  insert into public.company_invitations (
    company_id,
    email,
    role,
    invite_token_hash,
    status,
    expires_at,
    invited_by
  ) values (
    target_company_id,
    normalized_email,
    invite_role,
    encode(digest(raw_token, 'sha256'), 'hex'),
    'pending',
    invitation_expiry,
    auth.uid()
  ) returning id into new_invitation_id;

  return query select new_invitation_id, raw_token, invitation_expiry;
end;
$$;

create or replace function private.accept_company_invitation(invite_token text)
returns uuid
language plpgsql
security definer
set search_path = public, private, auth, pg_temp
as $$
declare
  invitation public.company_invitations%rowtype;
  signed_in_email text;
begin
  if auth.uid() is null then
    raise exception 'Sign in with the invited email address first.';
  end if;

  select lower(email) into signed_in_email
  from auth.users
  where id = auth.uid();

  select * into invitation
  from public.company_invitations
  where invite_token_hash = encode(digest(trim(invite_token), 'sha256'), 'hex')
  for update;

  if invitation.id is null or invitation.status <> 'pending' then
    raise exception 'This invitation is invalid or no longer active.';
  end if;

  if invitation.expires_at <= now() then
    raise exception 'This invitation has expired. Ask the agency to send a new one.';
  end if;

  if signed_in_email is null or signed_in_email <> invitation.email then
    raise exception 'Sign in with the same email address that received the invitation.';
  end if;

  insert into public.company_members (company_id, user_id, role)
  values (invitation.company_id, auth.uid(), invitation.role)
  on conflict (company_id, user_id) do update set role = excluded.role;

  update public.company_invitations
  set status = 'accepted', accepted_by = auth.uid(), accepted_at = now()
  where id = invitation.id;

  return invitation.company_id;
end;
$$;

create or replace function private.list_company_access(target_company_id uuid)
returns table (
  access_id uuid,
  email text,
  role text,
  access_scope text,
  status text,
  created_at timestamptz,
  expires_at timestamptz
)
language plpgsql
security definer
set search_path = public, private, auth, pg_temp
as $$
begin
  if auth.uid() is null or not private.can_operate_company(target_company_id) then
    raise exception 'You do not have permission to view access for this company.';
  end if;

  return query
  select agency_member.user_id, lower(agency_user.email), agency_member.role,
    'agency'::text, 'active'::text, agency_member.created_at, null::timestamptz
  from public.companies company
  join public.organization_members agency_member on agency_member.organization_id = company.organization_id
  join auth.users agency_user on agency_user.id = agency_member.user_id
  where company.id = target_company_id
  union all
  select client_member.user_id, lower(client_user.email), client_member.role,
    'client'::text, 'active'::text, client_member.created_at, null::timestamptz
  from public.company_members client_member
  join auth.users client_user on client_user.id = client_member.user_id
  where client_member.company_id = target_company_id
  union all
  select invitation.id, invitation.email, invitation.role,
    'invitation'::text, invitation.status, invitation.created_at, invitation.expires_at
  from public.company_invitations invitation
  where invitation.company_id = target_company_id
    and invitation.status in ('pending', 'accepted')
  order by 6;
end;
$$;

revoke all on function private.create_company_invitation(uuid, text, text, integer) from public;
revoke all on function private.accept_company_invitation(text) from public;
revoke all on function private.list_company_access(uuid) from public;
grant execute on function private.create_company_invitation(uuid, text, text, integer) to authenticated;
grant execute on function private.accept_company_invitation(text) to authenticated;
grant execute on function private.list_company_access(uuid) to authenticated;

create or replace function public.create_company_invitation(
  target_company_id uuid,
  invite_email text,
  invite_role text default 'client_viewer',
  validity_hours integer default 24
)
returns table (invitation_id uuid, invite_token text, expires_at timestamptz)
language sql
security invoker
set search_path = private, public, pg_temp
as $$
  select * from private.create_company_invitation(target_company_id, invite_email, invite_role, validity_hours);
$$;

create or replace function public.accept_company_invitation(invite_token text)
returns uuid
language sql
security invoker
set search_path = private, public, pg_temp
as $$
  select private.accept_company_invitation(invite_token);
$$;

create or replace function public.list_company_access(target_company_id uuid)
returns table (
  access_id uuid,
  email text,
  role text,
  access_scope text,
  status text,
  created_at timestamptz,
  expires_at timestamptz
)
language sql
security invoker
set search_path = private, public, pg_temp
as $$
  select * from private.list_company_access(target_company_id);
$$;

revoke all on function public.create_company_invitation(uuid, text, text, integer) from public;
revoke all on function public.accept_company_invitation(text) from public;
revoke all on function public.list_company_access(uuid) from public;
grant execute on function public.create_company_invitation(uuid, text, text, integer) to authenticated;
grant execute on function public.accept_company_invitation(text) to authenticated;
grant execute on function public.list_company_access(uuid) to authenticated;
