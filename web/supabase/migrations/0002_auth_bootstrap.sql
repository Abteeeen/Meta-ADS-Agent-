-- Creates an organization and its first owner after a Supabase Auth sign-in.
-- This is intentionally the only bootstrap path that bypasses normal RLS inserts.
create or replace function public.bootstrap_organization(organization_name text)
returns uuid
language plpgsql
security definer
set search_path = public
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

revoke all on function public.bootstrap_organization(text) from public;
grant execute on function public.bootstrap_organization(text) to authenticated;
