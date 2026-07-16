-- Let company-scoped client members access only their assigned company records.
-- Organization membership remains agency-only and is never granted to a client.
drop policy "members can read companies in their organization" on public.companies;
drop policy "owners and operators can create companies" on public.companies;
drop policy "members can read company profiles in their organization" on public.company_profiles;
drop policy "owners and operators can write company profiles" on public.company_profiles;

create policy "company members can read their company"
on public.companies for select to authenticated
using ((select public.is_company_member(id)));

create policy "agency operators can create companies"
on public.companies for insert to authenticated
with check (exists (
  select 1
  from public.organization_members membership
  where membership.organization_id = companies.organization_id
    and membership.user_id = (select auth.uid())
    and membership.role in ('owner', 'operator')
));

create policy "company operators can update their company"
on public.companies for update to authenticated
using ((select public.can_operate_company(id)))
with check ((select public.can_operate_company(id)));

create policy "company members can read their profile"
on public.company_profiles for select to authenticated
using ((select public.is_company_member(company_id)));

create policy "company operators can create profiles"
on public.company_profiles for insert to authenticated
with check ((select public.can_operate_company(company_id)));

create policy "company operators can update profiles"
on public.company_profiles for update to authenticated
using ((select public.can_operate_company(company_id)))
with check ((select public.can_operate_company(company_id)));
