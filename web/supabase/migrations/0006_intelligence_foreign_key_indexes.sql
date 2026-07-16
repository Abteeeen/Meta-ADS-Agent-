-- Cover optional foreign keys used by approvals, audit trails, and intelligence artifacts.
create index approval_requests_artifact_id_idx on public.approval_requests(artifact_id);
create index approval_requests_decided_by_idx on public.approval_requests(decided_by);
create index approval_requests_requested_by_idx on public.approval_requests(requested_by);
create index approval_requests_run_id_idx on public.approval_requests(run_id);
create index company_memory_items_created_by_idx on public.company_memory_items(created_by);
create index evidence_gaps_resolved_by_idx on public.evidence_gaps(resolved_by);
create index intelligence_artifacts_task_id_idx on public.intelligence_artifacts(task_id);
create index intelligence_runs_created_by_idx on public.intelligence_runs(created_by);
create index knowledge_documents_owner_organization_id_idx on public.knowledge_documents(owner_organization_id);
create index lead_quality_definitions_approved_by_idx on public.lead_quality_definitions(approved_by);
