-- Keep privileged RLS helpers out of Supabase's public RPC API.
create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to authenticated;

create or replace function private.bootstrap_organization(organization_name text)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  new_organization_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Authentication is required to create an organization.';
  end if;

  if char_length(trim(organization_name)) not between 1 and 120 then
    raise exception 'Organization name must be between 1 and 120 characters.';
  end if;

  insert into public.organizations (name)
  values (trim(organization_name))
  returning id into new_organization_id;

  insert into public.organization_members (organization_id, user_id, role)
  values (new_organization_id, auth.uid(), 'owner');

  return new_organization_id;
end;
$$;

create or replace function private.is_company_member(target_company_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.companies company
    join public.organization_members membership on membership.organization_id = company.organization_id
    where company.id = target_company_id
      and membership.user_id = (select auth.uid())
  );
$$;

create or replace function private.can_operate_company(target_company_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.companies company
    join public.organization_members membership on membership.organization_id = company.organization_id
    where company.id = target_company_id
      and membership.user_id = (select auth.uid())
      and membership.role in ('owner', 'operator')
  );
$$;

revoke all on function private.bootstrap_organization(text) from public;
revoke all on function private.is_company_member(uuid) from public;
revoke all on function private.can_operate_company(uuid) from public;
grant execute on function private.bootstrap_organization(text) to authenticated;
grant execute on function private.is_company_member(uuid) to authenticated;
grant execute on function private.can_operate_company(uuid) to authenticated;

create or replace function public.bootstrap_organization(organization_name text)
returns uuid
language sql
security invoker
set search_path = private, public, pg_temp
as $$
  select private.bootstrap_organization(organization_name);
$$;

create or replace function public.is_company_member(target_company_id uuid)
returns boolean
language sql
stable
security invoker
set search_path = private, public, pg_temp
as $$
  select private.is_company_member(target_company_id);
$$;

create or replace function public.can_operate_company(target_company_id uuid)
returns boolean
language sql
stable
security invoker
set search_path = private, public, pg_temp
as $$
  select private.can_operate_company(target_company_id);
$$;

revoke all on function public.bootstrap_organization(text) from public;
revoke all on function public.is_company_member(uuid) from public;
revoke all on function public.can_operate_company(uuid) from public;
grant execute on function public.bootstrap_organization(text) to authenticated;
grant execute on function public.is_company_member(uuid) to authenticated;
grant execute on function public.can_operate_company(uuid) to authenticated;
