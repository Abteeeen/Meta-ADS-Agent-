-- Durable company memory and bounded specialist-work orchestration.
-- Do not store raw lead identities, credentials, or unredacted sensitive data here.
create or replace function public.is_company_member(target_company_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.companies company
    join public.organization_members membership on membership.organization_id = company.organization_id
    where company.id = target_company_id
      and membership.user_id = (select auth.uid())
  );
$$;

create or replace function public.can_operate_company(target_company_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
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

revoke all on function public.is_company_member(uuid) from public;
revoke all on function public.can_operate_company(uuid) from public;
grant execute on function public.is_company_member(uuid) to authenticated;
grant execute on function public.can_operate_company(uuid) to authenticated;

create table public.company_memory_items (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  category text not null check (category in ('offer', 'location', 'audience', 'approved_claim', 'creative_asset', 'capacity', 'customer_objection', 'market_finding', 'campaign_learning', 'operating_rule')),
  item_key text not null check (char_length(item_key) between 2 and 160),
  value jsonb not null,
  status text not null default 'draft' check (status in ('draft', 'approved', 'needs_review', 'retired')),
  provenance jsonb not null default '[]'::jsonb,
  last_verified_at timestamptz,
  review_due_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (company_id, category, item_key)
);

create table public.lead_quality_definitions (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null unique references public.companies(id) on delete cascade,
  definition jsonb not null,
  status text not null default 'draft' check (status in ('draft', 'approved', 'retired')),
  approved_by uuid references auth.users(id) on delete set null,
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.integration_connections (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  provider text not null check (provider in ('meta', 'hubspot', 'ga4', 'search_console')),
  status text not null default 'not_connected' check (status in ('not_connected', 'pending', 'read_only_connected', 'error', 'revoked')),
  external_account_reference text,
  granted_scopes jsonb not null default '[]'::jsonb,
  secret_reference text,
  last_synced_at timestamptz,
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (company_id, provider),
  check (secret_reference is null or secret_reference !~ '(?i)(token|secret|password)')
);

create table public.intelligence_runs (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  status text not null default 'draft' check (status in ('draft', 'researching', 'waiting_for_input', 'ready_for_synthesis', 'completed', 'rejected')),
  trigger text not null check (trigger in ('new_company', 'weekly_review', 'performance_alert', 'operator_request')),
  input_snapshot jsonb not null default '{}'::jsonb,
  summary jsonb,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create table public.intelligence_tasks (
  id uuid primary key default gen_random_uuid(),
  run_id uuid not null references public.intelligence_runs(id) on delete cascade,
  specialist text not null check (specialist in ('public_company_research', 'market_and_audience_research', 'compliance_and_claim_review', 'funnel_and_landing_audit', 'meta_account_audit', 'crm_outcome_audit', 'strategy_synthesis', 'strategy_critic')),
  status text not null default 'queued' check (status in ('queued', 'running', 'waiting_for_research', 'waiting_for_connection', 'waiting_for_client_input', 'completed', 'blocked', 'failed')),
  input_payload jsonb not null default '{}'::jsonb,
  output_payload jsonb,
  error_message text,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  unique (run_id, specialist)
);

create table public.intelligence_artifacts (
  id uuid primary key default gen_random_uuid(),
  run_id uuid not null references public.intelligence_runs(id) on delete cascade,
  task_id uuid references public.intelligence_tasks(id) on delete set null,
  artifact_type text not null check (artifact_type in ('company_research', 'market_map', 'claim_review', 'funnel_audit', 'account_audit', 'crm_audit', 'strategy_brief', 'creative_brief', 'critic_review')),
  status text not null default 'draft' check (status in ('draft', 'approved', 'needs_review', 'retired')),
  payload jsonb not null,
  citations jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.evidence_gaps (
  id uuid primary key default gen_random_uuid(),
  run_id uuid not null references public.intelligence_runs(id) on delete cascade,
  gap_key text not null check (char_length(gap_key) between 2 and 160),
  route text not null check (route in ('auto_discover', 'client_confirm', 'connect_read')),
  priority text not null check (priority in ('high', 'medium', 'low')),
  reason text not null,
  status text not null default 'open' check (status in ('open', 'resolved', 'waived')),
  resolved_value jsonb,
  resolved_by uuid references auth.users(id) on delete set null,
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  unique (run_id, gap_key)
);

create table public.approval_requests (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  run_id uuid references public.intelligence_runs(id) on delete set null,
  artifact_id uuid references public.intelligence_artifacts(id) on delete set null,
  approval_type text not null check (approval_type in ('company_facts', 'claims', 'creative', 'strategy', 'launch', 'experiment', 'connection_scope')),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'superseded')),
  requested_by uuid references auth.users(id) on delete set null,
  decided_by uuid references auth.users(id) on delete set null,
  decision_note text,
  created_at timestamptz not null default now(),
  decided_at timestamptz
);

create index company_memory_items_company_category_idx on public.company_memory_items(company_id, category, status);
create index intelligence_runs_company_created_at_idx on public.intelligence_runs(company_id, created_at desc);
create index intelligence_tasks_run_status_idx on public.intelligence_tasks(run_id, status);
create index intelligence_artifacts_run_type_idx on public.intelligence_artifacts(run_id, artifact_type);
create index evidence_gaps_run_status_idx on public.evidence_gaps(run_id, status, priority);
create index approval_requests_company_status_idx on public.approval_requests(company_id, status, created_at desc);
create index organization_members_user_id_idx on public.organization_members(user_id);
create index agent_runs_created_by_idx on public.agent_runs(created_by);
create index experiments_created_by_idx on public.experiments(created_by);
create index decision_log_created_by_idx on public.decision_log(created_by);

alter table public.company_memory_items enable row level security;
alter table public.lead_quality_definitions enable row level security;
alter table public.integration_connections enable row level security;
alter table public.intelligence_runs enable row level security;
alter table public.intelligence_tasks enable row level security;
alter table public.intelligence_artifacts enable row level security;
alter table public.evidence_gaps enable row level security;
alter table public.approval_requests enable row level security;

create policy "members can read company memory" on public.company_memory_items for select using (public.is_company_member(company_id));
create policy "operators can manage company memory" on public.company_memory_items for all using (public.can_operate_company(company_id)) with check (public.can_operate_company(company_id));
create policy "members can read lead-quality definitions" on public.lead_quality_definitions for select using (public.is_company_member(company_id));
create policy "operators can manage lead-quality definitions" on public.lead_quality_definitions for all using (public.can_operate_company(company_id)) with check (public.can_operate_company(company_id));
create policy "members can read connections" on public.integration_connections for select using (public.is_company_member(company_id));
create policy "owners and operators can manage connections" on public.integration_connections for all using (public.can_operate_company(company_id)) with check (public.can_operate_company(company_id));
create policy "members can read intelligence runs" on public.intelligence_runs for select using (public.is_company_member(company_id));
create policy "operators can manage intelligence runs" on public.intelligence_runs for all using (public.can_operate_company(company_id)) with check (public.can_operate_company(company_id));
create policy "members can read intelligence tasks" on public.intelligence_tasks for select using (exists (select 1 from public.intelligence_runs run where run.id = intelligence_tasks.run_id));
create policy "operators can manage intelligence tasks" on public.intelligence_tasks for all using (exists (select 1 from public.intelligence_runs run where run.id = intelligence_tasks.run_id and public.can_operate_company(run.company_id))) with check (exists (select 1 from public.intelligence_runs run where run.id = intelligence_tasks.run_id and public.can_operate_company(run.company_id)));
create policy "members can read intelligence artifacts" on public.intelligence_artifacts for select using (exists (select 1 from public.intelligence_runs run where run.id = intelligence_artifacts.run_id));
create policy "operators can manage intelligence artifacts" on public.intelligence_artifacts for all using (exists (select 1 from public.intelligence_runs run where run.id = intelligence_artifacts.run_id and public.can_operate_company(run.company_id))) with check (exists (select 1 from public.intelligence_runs run where run.id = intelligence_artifacts.run_id and public.can_operate_company(run.company_id)));
create policy "members can read evidence gaps" on public.evidence_gaps for select using (exists (select 1 from public.intelligence_runs run where run.id = evidence_gaps.run_id));
create policy "operators can manage evidence gaps" on public.evidence_gaps for all using (exists (select 1 from public.intelligence_runs run where run.id = evidence_gaps.run_id and public.can_operate_company(run.company_id))) with check (exists (select 1 from public.intelligence_runs run where run.id = evidence_gaps.run_id and public.can_operate_company(run.company_id)));
create policy "members can read approval requests" on public.approval_requests for select using (public.is_company_member(company_id));
create policy "operators can manage approval requests" on public.approval_requests for all using (public.can_operate_company(company_id)) with check (public.can_operate_company(company_id));
