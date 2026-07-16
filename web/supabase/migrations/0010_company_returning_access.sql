-- Allow an authorized agency member to read a company row during INSERT RETURNING.
-- The previous helper re-queried the just-inserted company by id, which is not
-- visible through that helper until the insert statement completes.
create or replace function private.can_read_company_row(
  target_company_id uuid,
  target_organization_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.organization_members membership
    where membership.organization_id = target_organization_id
      and membership.user_id = (select auth.uid())
  ) or exists (
    select 1
    from public.company_members membership
    where membership.company_id = target_company_id
      and membership.user_id = (select auth.uid())
  );
$$;

revoke all on function private.can_read_company_row(uuid, uuid) from public;
grant execute on function private.can_read_company_row(uuid, uuid) to authenticated;

create or replace function public.can_read_company_row(
  target_company_id uuid,
  target_organization_id uuid
)
returns boolean
language sql
stable
security invoker
set search_path = private, public, pg_temp
as $$
  select private.can_read_company_row(target_company_id, target_organization_id);
$$;

revoke all on function public.can_read_company_row(uuid, uuid) from public;
grant execute on function public.can_read_company_row(uuid, uuid) to authenticated;

drop policy "company members can read their company" on public.companies;
create policy "company members can read their company"
on public.companies for select to authenticated
using ((select public.can_read_company_row(id, organization_id)));
