create extension if not exists pgcrypto;

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 120),
  created_at timestamptz not null default now()
);

create table public.organization_members (
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('owner', 'operator', 'viewer')),
  created_at timestamptz not null default now(),
  primary key (organization_id, user_id)
);

create table public.companies (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 160),
  vertical text not null,
  status text not null default 'discovery' check (status in ('discovery', 'active', 'paused', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.company_profiles (
  company_id uuid primary key references public.companies(id) on delete cascade,
  business_model text not null,
  market text not null,
  offer text not null,
  primary_goal text not null,
  conversion_event text not null,
  landing_destination text,
  monthly_budget numeric check (monthly_budget is null or monthly_budget > 0),
  account_maturity text,
  tracking_status text not null default 'unknown' check (tracking_status in ('verified', 'unverified', 'unknown')),
  updated_at timestamptz not null default now()
);

create table public.agent_runs (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  mode text not null check (mode in ('workflow', 'strategist', 'auditor', 'analyst', 'reporting')),
  status text not null check (status in ('draft', 'completed', 'rejected')),
  input_payload jsonb not null default '{}'::jsonb,
  output_payload jsonb,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.metric_snapshots (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  period_start date not null,
  period_end date not null check (period_end >= period_start),
  source text not null check (source in ('manual', 'meta_read_only')),
  metrics jsonb not null,
  created_at timestamptz not null default now()
);

create table public.experiments (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  status text not null check (status in ('draft', 'approved', 'running', 'completed', 'stopped')),
  plan jsonb not null,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.decision_log (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  decision text not null,
  evidence jsonb not null default '[]'::jsonb,
  hypothesis text,
  guardrail text,
  outcome text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create index companies_organization_id_idx on public.companies(organization_id);
create index agent_runs_company_created_at_idx on public.agent_runs(company_id, created_at desc);
create index metric_snapshots_company_period_idx on public.metric_snapshots(company_id, period_start desc);
create index experiments_company_status_idx on public.experiments(company_id, status);
create index decision_log_company_created_at_idx on public.decision_log(company_id, created_at desc);

alter table public.organizations enable row level security;
alter table public.organization_members enable row level security;
alter table public.companies enable row level security;
alter table public.company_profiles enable row level security;
alter table public.agent_runs enable row level security;
alter table public.metric_snapshots enable row level security;
alter table public.experiments enable row level security;
alter table public.decision_log enable row level security;

create policy "members can read their organization memberships"
on public.organization_members for select
using (user_id = auth.uid());

create policy "members can read their organizations"
on public.organizations for select
using (exists (
  select 1 from public.organization_members membership
  where membership.organization_id = organizations.id and membership.user_id = auth.uid()
));

create policy "members can read companies in their organization"
on public.companies for select
using (exists (
  select 1 from public.organization_members membership
  where membership.organization_id = companies.organization_id and membership.user_id = auth.uid()
));

create policy "members can read company profiles in their organization"
on public.company_profiles for select
using (exists (
  select 1 from public.companies company join public.organization_members membership
    on membership.organization_id = company.organization_id
  where company.id = company_profiles.company_id and membership.user_id = auth.uid()
));

create policy "members can read agent runs in their organization"
on public.agent_runs for select
using (exists (
  select 1 from public.companies company join public.organization_members membership
    on membership.organization_id = company.organization_id
  where company.id = agent_runs.company_id and membership.user_id = auth.uid()
));

create policy "members can read metrics in their organization"
on public.metric_snapshots for select
using (exists (
  select 1 from public.companies company join public.organization_members membership
    on membership.organization_id = company.organization_id
  where company.id = metric_snapshots.company_id and membership.user_id = auth.uid()
));

create policy "members can read experiments in their organization"
on public.experiments for select
using (exists (
  select 1 from public.companies company join public.organization_members membership
    on membership.organization_id = company.organization_id
  where company.id = experiments.company_id and membership.user_id = auth.uid()
));

create policy "members can read decisions in their organization"
on public.decision_log for select
using (exists (
  select 1 from public.companies company join public.organization_members membership
    on membership.organization_id = company.organization_id
  where company.id = decision_log.company_id and membership.user_id = auth.uid()
));

create policy "owners and operators can create companies"
on public.companies for insert
with check (exists (
  select 1 from public.organization_members membership
  where membership.organization_id = companies.organization_id
    and membership.user_id = auth.uid()
    and membership.role in ('owner', 'operator')
));

create policy "owners and operators can write company profiles"
on public.company_profiles for all
using (exists (
  select 1 from public.companies company join public.organization_members membership
    on membership.organization_id = company.organization_id
  where company.id = company_profiles.company_id
    and membership.user_id = auth.uid()
    and membership.role in ('owner', 'operator')
))
with check (exists (
  select 1 from public.companies company join public.organization_members membership
    on membership.organization_id = company.organization_id
  where company.id = company_profiles.company_id
    and membership.user_id = auth.uid()
    and membership.role in ('owner', 'operator')
));

create policy "owners and operators can write agent runs"
on public.agent_runs for all
using (exists (
  select 1 from public.companies company join public.organization_members membership
    on membership.organization_id = company.organization_id
  where company.id = agent_runs.company_id
    and membership.user_id = auth.uid()
    and membership.role in ('owner', 'operator')
))
with check (exists (
  select 1 from public.companies company join public.organization_members membership
    on membership.organization_id = company.organization_id
  where company.id = agent_runs.company_id
    and membership.user_id = auth.uid()
    and membership.role in ('owner', 'operator')
));

create policy "owners and operators can write metrics"
on public.metric_snapshots for all
using (exists (
  select 1 from public.companies company join public.organization_members membership
    on membership.organization_id = company.organization_id
  where company.id = metric_snapshots.company_id
    and membership.user_id = auth.uid()
    and membership.role in ('owner', 'operator')
))
with check (exists (
  select 1 from public.companies company join public.organization_members membership
    on membership.organization_id = company.organization_id
  where company.id = metric_snapshots.company_id
    and membership.user_id = auth.uid()
    and membership.role in ('owner', 'operator')
));

create policy "owners and operators can write experiments"
on public.experiments for all
using (exists (
  select 1 from public.companies company join public.organization_members membership
    on membership.organization_id = company.organization_id
  where company.id = experiments.company_id
    and membership.user_id = auth.uid()
    and membership.role in ('owner', 'operator')
))
with check (exists (
  select 1 from public.companies company join public.organization_members membership
    on membership.organization_id = company.organization_id
  where company.id = experiments.company_id
    and membership.user_id = auth.uid()
    and membership.role in ('owner', 'operator')
));

create policy "owners and operators can write decisions"
on public.decision_log for all
using (exists (
  select 1 from public.companies company join public.organization_members membership
    on membership.organization_id = company.organization_id
  where company.id = decision_log.company_id
    and membership.user_id = auth.uid()
    and membership.role in ('owner', 'operator')
))
with check (exists (
  select 1 from public.companies company join public.organization_members membership
    on membership.organization_id = company.organization_id
  where company.id = decision_log.company_id
    and membership.user_id = auth.uid()
    and membership.role in ('owner', 'operator')
));
