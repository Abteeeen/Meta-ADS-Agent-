-- Company-scoped client access and structured onboarding for the agency SaaS.
-- Agency roles remain organization-scoped; client roles are limited to one company.
create table public.company_members (
  company_id uuid not null references public.companies(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('client_admin', 'client_viewer')),
  created_at timestamptz not null default now(),
  primary key (company_id, user_id)
);

create table public.company_invitations (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  email text not null check (email = lower(trim(email)) and char_length(email) between 3 and 320),
  role text not null check (role in ('client_admin', 'client_viewer')),
  invite_token_hash text not null unique check (char_length(invite_token_hash) = 64),
  status text not null default 'pending' check (status in ('pending', 'accepted', 'revoked', 'expired')),
  expires_at timestamptz not null,
  invited_by uuid references auth.users(id) on delete set null,
  accepted_by uuid references auth.users(id) on delete set null,
  accepted_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.company_onboarding (
  company_id uuid primary key references public.companies(id) on delete cascade,
  status text not null default 'draft' check (status in ('draft', 'in_progress', 'ready_for_review', 'complete')),
  business_details jsonb not null default '{}'::jsonb,
  offer_catalog jsonb not null default '[]'::jsonb,
  audience_definition jsonb not null default '{}'::jsonb,
  locations jsonb not null default '[]'::jsonb,
  goals_and_budget jsonb not null default '{}'::jsonb,
  capacity_and_availability jsonb not null default '{}'::jsonb,
  claims_and_compliance jsonb not null default '{}'::jsonb,
  crm_process jsonb not null default '{}'::jsonb,
  follow_up_process jsonb not null default '{}'::jsonb,
  completed_steps jsonb not null default '[]'::jsonb,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index company_members_user_id_idx on public.company_members(user_id, company_id);
create index company_invitations_company_status_idx on public.company_invitations(company_id, status, expires_at);
create index company_invitations_email_status_idx on public.company_invitations(email, status, expires_at);

alter table public.company_members enable row level security;
alter table public.company_invitations enable row level security;
alter table public.company_onboarding enable row level security;

-- Security-definer helpers live in the private schema. The public wrappers are
-- invoker functions and remain the policy surface used by existing tables.
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
    left join public.organization_members agency_membership
      on agency_membership.organization_id = company.organization_id
      and agency_membership.user_id = (select auth.uid())
    left join public.company_members client_membership
      on client_membership.company_id = company.id
      and client_membership.user_id = (select auth.uid())
    where company.id = target_company_id
      and (agency_membership.user_id is not null or client_membership.user_id is not null)
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
    left join public.organization_members agency_membership
      on agency_membership.organization_id = company.organization_id
      and agency_membership.user_id = (select auth.uid())
      and agency_membership.role in ('owner', 'operator')
    left join public.company_members client_membership
      on client_membership.company_id = company.id
      and client_membership.user_id = (select auth.uid())
      and client_membership.role = 'client_admin'
    where company.id = target_company_id
      and (agency_membership.user_id is not null or client_membership.user_id is not null)
  );
$$;

create policy "operators can manage company members"
on public.company_members for all to authenticated
using ((select public.can_operate_company(company_id)))
with check ((select public.can_operate_company(company_id)));

create policy "members can read company members"
on public.company_members for select to authenticated
using ((select public.is_company_member(company_id)));

create policy "operators can manage company invitations"
on public.company_invitations for all to authenticated
using ((select public.can_operate_company(company_id)))
with check ((select public.can_operate_company(company_id)));

create policy "members can read company onboarding"
on public.company_onboarding for select to authenticated
using ((select public.is_company_member(company_id)));

create policy "operators can manage company onboarding"
on public.company_onboarding for all to authenticated
using ((select public.can_operate_company(company_id)))
with check ((select public.can_operate_company(company_id)));
