-- Governed retrieval for agent answers. Store reviewed claims and citations, not
-- copies of third-party documentation or unapproved client data.
create table public.knowledge_documents (
  id uuid primary key default gen_random_uuid(),
  source_key text not null unique check (char_length(source_key) between 3 and 120),
  owner_organization_id uuid references public.organizations(id) on delete cascade,
  company_id uuid references public.companies(id) on delete cascade,
  scope text not null check (scope in ('platform', 'regulatory', 'agency', 'company')),
  title text not null check (char_length(title) between 3 and 300),
  publisher text not null check (char_length(publisher) between 2 and 200),
  source_url text not null check (source_url ~ '^https?://'),
  source_kind text not null check (source_kind in ('official_documentation', 'official_policy', 'company_site', 'approved_internal')),
  status text not null default 'draft' check (status in ('draft', 'approved', 'retired')),
  source_published_at date,
  retrieved_at timestamptz not null default now(),
  reviewed_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (
    (scope in ('platform', 'regulatory', 'agency') and owner_organization_id is null and company_id is null)
    or (scope = 'company' and owner_organization_id is not null and company_id is not null)
  )
);

create table public.knowledge_claims (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.knowledge_documents(id) on delete cascade,
  claim_key text not null unique check (char_length(claim_key) between 3 and 160),
  statement text not null check (char_length(statement) between 12 and 1200),
  classification text not null check (classification in ('platform_fact', 'policy_requirement', 'company_fact', 'agency_rule')),
  confidence numeric(3,2) not null check (confidence >= 0 and confidence <= 1),
  status text not null default 'draft' check (status in ('draft', 'approved', 'needs_review', 'retired')),
  conditions jsonb not null default '[]'::jsonb,
  conflicts_with jsonb not null default '[]'::jsonb,
  last_verified_at timestamptz not null default now(),
  review_due_at timestamptz,
  search_vector tsvector generated always as (
    setweight(to_tsvector('english', coalesce(statement, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(classification, '')), 'B')
  ) stored,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index knowledge_documents_company_id_idx on public.knowledge_documents(company_id);
create index knowledge_claims_document_id_idx on public.knowledge_claims(document_id);
create index knowledge_claims_search_vector_idx on public.knowledge_claims using gin(search_vector);

alter table public.knowledge_documents enable row level security;
alter table public.knowledge_claims enable row level security;

create policy "authenticated users can read approved global knowledge"
on public.knowledge_documents for select
using (owner_organization_id is null and status = 'approved' and auth.uid() is not null);

create policy "members can read their company knowledge documents"
on public.knowledge_documents for select
using (exists (
  select 1 from public.organization_members membership
  where membership.organization_id = knowledge_documents.owner_organization_id
    and membership.user_id = auth.uid()
));

create policy "operators can create company knowledge documents"
on public.knowledge_documents for insert
with check (owner_organization_id is not null and exists (
  select 1 from public.organization_members membership
  where membership.organization_id = knowledge_documents.owner_organization_id
    and membership.user_id = auth.uid()
    and membership.role in ('owner', 'operator')
));

create policy "operators can update their company knowledge documents"
on public.knowledge_documents for update
using (exists (
  select 1 from public.organization_members membership
  where membership.organization_id = knowledge_documents.owner_organization_id
    and membership.user_id = auth.uid()
    and membership.role in ('owner', 'operator')
))
with check (owner_organization_id is not null and exists (
  select 1 from public.organization_members membership
  where membership.organization_id = knowledge_documents.owner_organization_id
    and membership.user_id = auth.uid()
    and membership.role in ('owner', 'operator')
));

create policy "members can read claims from visible knowledge documents"
on public.knowledge_claims for select
using (exists (
  select 1 from public.knowledge_documents document
  where document.id = knowledge_claims.document_id
));

create policy "operators can create company knowledge claims"
on public.knowledge_claims for insert
with check (exists (
  select 1 from public.knowledge_documents document
  join public.organization_members membership on membership.organization_id = document.owner_organization_id
  where document.id = knowledge_claims.document_id
    and membership.user_id = auth.uid()
    and membership.role in ('owner', 'operator')
));

create policy "operators can update their company knowledge claims"
on public.knowledge_claims for update
using (exists (
  select 1 from public.knowledge_documents document
  join public.organization_members membership on membership.organization_id = document.owner_organization_id
  where document.id = knowledge_claims.document_id
    and membership.user_id = auth.uid()
    and membership.role in ('owner', 'operator')
))
with check (exists (
  select 1 from public.knowledge_documents document
  join public.organization_members membership on membership.organization_id = document.owner_organization_id
  where document.id = knowledge_claims.document_id
    and membership.user_id = auth.uid()
    and membership.role in ('owner', 'operator')
));

create or replace function public.search_knowledge(
  search_query text,
  target_company_id uuid default null,
  maximum_results integer default 8
)
returns table (
  claim_id uuid,
  claim_key text,
  statement text,
  classification text,
  confidence numeric,
  source_title text,
  source_url text,
  publisher text,
  last_verified_at timestamptz,
  review_due_at timestamptz,
  relevance real
)
language sql
stable
security invoker
set search_path = public
as $$
  select
    claim.id,
    claim.claim_key,
    claim.statement,
    claim.classification,
    claim.confidence,
    document.title,
    document.source_url,
    document.publisher,
    claim.last_verified_at,
    claim.review_due_at,
    ts_rank(claim.search_vector, websearch_to_tsquery('english', trim(search_query)))::real
  from public.knowledge_claims claim
  join public.knowledge_documents document on document.id = claim.document_id
  where trim(search_query) <> ''
    and claim.status = 'approved'
    and document.status = 'approved'
    and (claim.review_due_at is null or claim.review_due_at >= now())
    and (target_company_id is null or document.company_id is null or document.company_id = target_company_id)
    and claim.search_vector @@ websearch_to_tsquery('english', trim(search_query))
  order by ts_rank(claim.search_vector, websearch_to_tsquery('english', trim(search_query))) desc,
    claim.last_verified_at desc
  limit greatest(1, least(maximum_results, 20));
$$;

-- Seed source records and short paraphrased claims. Full third-party content is
-- intentionally not copied into the database.
insert into public.knowledge_documents (source_key, scope, title, publisher, source_url, source_kind, status, reviewed_at, metadata)
values
  ('meta-lead-ads-forms', 'platform', 'Lead ads with forms', 'Meta', 'https://www.facebook.com/business/ads/ad-objectives/lead-generation/lead-ads-with-forms', 'official_documentation', 'approved', now(), '{"topic":"lead quality"}'),
  ('meta-lead-ads-messaging', 'platform', 'Lead ads that click to message', 'Meta', 'https://www.facebook.com/business/ads/ad-objectives/lead-generation/lead-ads-with-messaging', 'official_documentation', 'approved', now(), '{"topic":"messaging qualification"}'),
  ('meta-conversions-api', 'platform', 'About Conversions API', 'Meta', 'https://www.facebook.com/business/help/AboutConversionsAPI', 'official_documentation', 'approved', now(), '{"topic":"measurement"}'),
  ('meta-ad-review', 'platform', 'Advertising review process', 'Meta', 'https://www.facebook.com/business/ads/review-policy-guidelines', 'official_policy', 'approved', now(), '{"topic":"ad approval"}'),
  ('meta-marketing-api', 'platform', 'Marketing API documentation', 'Meta', 'https://developers.facebook.com/docs/marketing-api/', 'official_documentation', 'approved', now(), '{"topic":"read only integration"}'),
  ('asqa-information-transparency', 'regulatory', 'Information and transparency practice guide', 'Australian Skills Quality Authority', 'https://legacy.asqa.gov.au/rtos/2025-standards-rtos/practice-guides/practice-guide-information-and-transparency', 'official_policy', 'approved', now(), '{"topic":"RTO marketing"}'),
  ('qld-unarmed-security-licence', 'regulatory', 'Apply for an unarmed security officer licence', 'Queensland Government', 'https://www.qld.gov.au/community/fair-trading/regulated-industries-licensing-and-legislation/security-industry-regulation/working-as-an-unarmed-security-officer/apply', 'official_documentation', 'approved', now(), '{"topic":"licence context"}'),
  ('oaic-direct-marketing', 'regulatory', 'Direct marketing', 'Office of the Australian Information Commissioner', 'https://www.oaic.gov.au/privacy/privacy-guidance-for-organisations-and-government-agencies/organisations/direct-marketing', 'official_policy', 'approved', now(), '{"topic":"privacy and follow-up"}'),
  ('accc-advertising-claims', 'regulatory', 'False or misleading claims', 'Australian Competition and Consumer Commission', 'https://www.accc.gov.au/business/advertising-and-promotions/false-or-misleading-claims', 'official_policy', 'approved', now(), '{"topic":"claim substantiation"}')
on conflict (source_key) do update set
  title = excluded.title,
  publisher = excluded.publisher,
  source_url = excluded.source_url,
  source_kind = excluded.source_kind,
  status = excluded.status,
  reviewed_at = excluded.reviewed_at,
  metadata = excluded.metadata,
  updated_at = now();

insert into public.knowledge_claims (document_id, claim_key, statement, classification, confidence, status, conditions, review_due_at)
select document.id, seeded.claim_key, seeded.statement, seeded.classification, seeded.confidence, 'approved', seeded.conditions::jsonb, now() + interval '90 days'
from (
  values
    ('meta-lead-ads-forms', 'meta-form-route-fit', 'Instant forms and website forms suit different lead journeys; use the destination that gives the prospect enough context to make an informed enquiry.', 'platform_fact', 0.90, '["Validate the journey with the client and test it against the current route."]'),
    ('meta-lead-ads-forms', 'meta-conversion-leads-feedback', 'For instant-form lead quality optimisation, downstream CRM outcomes need to be sent back through the appropriate Conversions API integration; selecting a goal alone does not create that feedback loop.', 'platform_fact', 0.92, '["Availability and setup must be checked in the client account."]'),
    ('meta-lead-ads-messaging', 'meta-message-lead-route', 'Lead campaigns can route people into supported Meta messaging destinations, including WhatsApp where available, so a short approved conversation can clarify intent before a sales hand-off.', 'platform_fact', 0.88, '["Do not collect sensitive licence, identity, health, or criminal-history information in chat."]'),
    ('meta-conversions-api', 'meta-capi-crm-outcomes', 'Conversions API can receive events from CRM, offline, website, and business-message sources to improve measurement and support later-stage optimisation.', 'platform_fact', 0.94, '["Use only approved event data and complete privacy review before implementation."]'),
    ('meta-conversions-api', 'meta-capi-not-privacy-bypass', 'Conversions API is not a way to bypass privacy obligations or Meta data-sharing controls.', 'policy_requirement', 0.95, '["Apply the client privacy policy and applicable law."]'),
    ('meta-ad-review', 'meta-ad-review-scope', 'Meta reviews ad creative, targeting, and the destination experience, and an ad may be reviewed again after it begins delivery.', 'platform_fact', 0.90, '["Final approval remains Meta''s decision."]'),
    ('meta-marketing-api', 'agency-read-only-first', 'The first agency integration should be read-only and preserve account scope, date range, attribution setting, and source lineage for every metric used in an agent recommendation.', 'agency_rule', 0.92, '["Publishing, budget changes, and audience changes require separate human approval."]'),
    ('asqa-information-transparency', 'asqa-rto-claim-verification', 'RTO marketing should be accurate, factual, and supported by evidence; employment, funding, course, and outcome statements require approved wording.', 'policy_requirement', 0.94, '["Use the RTO compliance owner''s approved claims library."]'),
    ('qld-unarmed-security-licence', 'qld-course-not-licence', 'Security-course advertising must not imply that completing training alone grants a Queensland security licence; licence requirements must be confirmed with the official regulator.', 'policy_requirement', 0.95, '["Do not make individual eligibility decisions in the agent."]'),
    ('oaic-direct-marketing', 'oaic-follow-up-consent', 'Phone and SMS follow-up needs an approved consent, privacy, and opt-out process; record the agreed workflow rather than relying on informal practice.', 'policy_requirement', 0.90, '["Obtain legal or compliance advice for the client''s implementation."]'),
    ('accc-advertising-claims', 'accc-claims-need-substantiation', 'Advertising claims and testimonials should be accurate, not misleading, and supported by reasonable grounds before they are used in a campaign.', 'policy_requirement', 0.94, '["Keep substantiation and testimonial approval with the client record."]')
) as seeded(source_key, claim_key, statement, classification, confidence, conditions)
join public.knowledge_documents document on document.source_key = seeded.source_key
on conflict (claim_key) do update set
  statement = excluded.statement,
  classification = excluded.classification,
  confidence = excluded.confidence,
  status = excluded.status,
  conditions = excluded.conditions,
  last_verified_at = now(),
  review_due_at = excluded.review_due_at,
  updated_at = now();
