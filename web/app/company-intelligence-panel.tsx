"use client";

import { Bot, ClipboardList, Database, RefreshCw, Sparkles } from "lucide-react";
import { type ReactNode, useCallback, useEffect, useState } from "react";

import { getSupabaseBrowserClient } from "./supabase-browser";

type SpecialistJob = { id: string; purpose: string; status: string };
type Gap = { key: string; label: string; route: string; priority: string; reason: string };
type IntelligencePlan = {
  overallStatus: "NEEDS_EVIDENCE" | "READY_FOR_SYNTHESIS";
  specialistJobs: SpecialistJob[];
  autoDiscoveryGaps: Gap[];
  questionQueue: Gap[];
  integrationRequests: Gap[];
  strategySynthesis: { status: string };
};

type CompanySnapshot = {
  id: string;
  name: string;
  profile: Record<string, unknown> | null;
  connections: Record<string, string>;
  approvedMemory: Array<{ category: string; item_key: string; value: unknown }>;
};

const clientConfirmations = [
  ["monthlyBudget", "Monthly budget", "Budget is a commercial constraint and cannot be inferred safely from public research."],
  ["capacityAndCourseDates", "Capacity and course dates", "Availability changes and must be confirmed by the company before campaign recommendations."],
  ["leadQualityDefinition", "Lead-quality definition", "The sales team must define the approved criteria for an eligible lead."],
  ["approvedClaims", "Approved claims", "Only the company and compliance owner can approve course, funding, outcome, and testimonial wording."],
] as const;

export function CompanyIntelligencePanel() {
  const [snapshot, setSnapshot] = useState<CompanySnapshot | null>(null);
  const [plan, setPlan] = useState<IntelligencePlan | null>(null);
  const [message, setMessage] = useState("Sign in and add a company to begin an intelligence run.");
  const [busy, setBusy] = useState(false);
  const client = getSupabaseBrowserClient();

  const load = useCallback(async () => {
    if (!client) {
      setSnapshot(null);
      setPlan(null);
      setMessage("Supabase connection is required to create company intelligence runs.");
      return;
    }
    const { data: sessionData } = await client.auth.getSession();
    if (!sessionData.session) {
      setSnapshot(null);
      setPlan(null);
      setMessage("Sign in, create your agency workspace, then add the company.");
      return;
    }

    const { data: company, error: companyError } = await client
      .from("companies")
      .select("id, name")
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();
    if (companyError || !company) {
      setSnapshot(null);
      setPlan(null);
      setMessage(companyError?.message ?? "Add a company workspace before running intelligence.");
      return;
    }

    const [profileResult, connectionResult, memoryResult, qualityResult] = await Promise.all([
      client.from("company_profiles").select("*").eq("company_id", company.id).maybeSingle(),
      client.from("integration_connections").select("provider, status").eq("company_id", company.id),
      client.from("company_memory_items").select("category, item_key, value").eq("company_id", company.id).eq("status", "approved"),
      client.from("lead_quality_definitions").select("definition, status").eq("company_id", company.id).eq("status", "approved").maybeSingle(),
    ]);
    if (profileResult.error || connectionResult.error || memoryResult.error || qualityResult.error) {
      setMessage("Could not load all company intelligence records. Refresh and review the workspace permissions.");
      return;
    }

    const nextSnapshot = {
      id: company.id,
      name: company.name,
      profile: profileResult.data,
      connections: Object.fromEntries((connectionResult.data ?? []).map((item) => [item.provider, item.status])),
      approvedMemory: memoryResult.data ?? [],
    };
    setSnapshot(nextSnapshot);
    setPlan(buildPlan(nextSnapshot, qualityResult.data?.definition));
    setMessage("Company intelligence is ready to plan. Review the evidence queue before running it.");
  }, [client]);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  async function createRun() {
    if (!client || !snapshot || !plan) return;
    setBusy(true);
    const runStatus = plan.overallStatus === "READY_FOR_SYNTHESIS" ? "ready_for_synthesis" : "waiting_for_input";
    const { data: run, error: runError } = await client
      .from("intelligence_runs")
      .insert({ company_id: snapshot.id, status: runStatus, trigger: "new_company", input_snapshot: plan })
      .select("id")
      .single();
    if (runError || !run) {
      setMessage(runError?.message ?? "Could not create the intelligence run.");
      setBusy(false);
      return;
    }

    const tasks = plan.specialistJobs.map((job) => ({
      run_id: run.id,
      specialist: specialistDatabaseValue(job.id),
      status: taskDatabaseStatus(job.status),
      input_payload: { purpose: job.purpose },
    }));
    const gaps = [...plan.autoDiscoveryGaps, ...plan.questionQueue, ...plan.integrationRequests].map((gap) => ({
      run_id: run.id,
      gap_key: gap.key,
      route: databaseRoute(gap.route),
      priority: gap.priority.toLowerCase(),
      reason: gap.reason,
    }));
    const [taskResult, gapResult] = await Promise.all([
      client.from("intelligence_tasks").insert(tasks),
      gaps.length ? client.from("evidence_gaps").insert(gaps) : Promise.resolve({ error: null }),
    ]);
    if (taskResult.error || gapResult.error) {
      setMessage(taskResult.error?.message ?? gapResult.error?.message ?? "The run was created but needs attention.");
    } else {
      setMessage("Intelligence run created. Research jobs, client confirmations, and connection requests are now recorded separately.");
    }
    setBusy(false);
  }

  return (
    <section className="intelligence-panel" aria-labelledby="intelligence-title">
      <div className="intelligence-heading">
        <div className="icon-tile mint"><Bot size={19} /></div>
        <div><p className="eyebrow">Company intelligence</p><h2 id="intelligence-title">Research before asking</h2></div>
      </div>
      <p className="intelligence-copy">The agent routes public research, client confirmations, and approved read-only connections into separate jobs before strategy synthesis.</p>
      {plan ? (
        <>
          <div className="intelligence-summary"><span>{plan.specialistJobs.filter((job) => job.status === "READY").length} specialist jobs ready</span><strong>{plan.strategySynthesis.status.replaceAll("_", " ")}</strong></div>
          <div className="intelligence-list" aria-label="Specialist jobs">
            {plan.specialistJobs.map((job) => <div key={job.id}><span className={job.status === "READY" ? "ready-dot" : "waiting-dot"} /><strong>{job.id.replaceAll("_", " ")}</strong><small>{job.status.replaceAll("_", " ")}</small></div>)}
          </div>
          <div className="intelligence-queues">
            <Queue title="Research" gaps={plan.autoDiscoveryGaps} icon={<Sparkles size={15} />} empty="No public discovery gaps." />
            <Queue title="Confirm" gaps={plan.questionQueue} icon={<ClipboardList size={15} />} empty="No client confirmations required." />
            <Queue title="Connect" gaps={plan.integrationRequests} icon={<Database size={15} />} empty="No read-only connections required." />
          </div>
          <button className="command-button intelligence-run" disabled={busy} onClick={() => void createRun()} type="button"><Bot size={16} /> {busy ? "Creating run" : "Create intelligence run"}</button>
        </>
      ) : null}
      <div className="intelligence-footer"><button className="secondary-button" disabled={busy} onClick={() => void load()} type="button"><RefreshCw size={15} /> Refresh</button><p role="status">{message}</p></div>
    </section>
  );
}

function Queue({ title, gaps, icon, empty }: { title: string; gaps: Gap[]; icon: ReactNode; empty: string }) {
  return <div className="intelligence-queue"><div><span>{icon}</span><strong>{title}</strong></div>{gaps.length ? <ul>{gaps.map((gap) => <li key={gap.key}>{gap.label}</li>)}</ul> : <small>{empty}</small>}</div>;
}

function buildPlan(snapshot: CompanySnapshot, qualityDefinition: unknown): IntelligencePlan {
  const profile = snapshot.profile ?? {};
  const memory = (category: string) => snapshot.approvedMemory.find((item) => item.category === category)?.value;
  const known = {
    offer: profile.offer,
    market: profile.market,
    landingDestination: profile.landing_destination,
    primaryGoal: profile.primary_goal,
    conversionEvent: profile.conversion_event,
    monthlyBudget: profile.monthly_budget,
    capacityAndCourseDates: memory("capacity"),
    leadQualityDefinition: qualityDefinition,
    approvedClaims: memory("approved_claim"),
    trackingStatus: profile.tracking_status === "verified" ? "VERIFIED" : null,
  };
  const publicKeys = ["offer", "market", "landingDestination", "primaryGoal", "conversionEvent"] as const;
  const publicGaps = publicKeys.filter((key) => missing(known[key])).map((key) => gap(key, label(key), "AUTO_DISCOVER", "HIGH", "Run the relevant research specialist."));
  const questions = clientConfirmations.filter(([key]) => missing(known[key])).map(([key, labelText, reason]) => gap(key, labelText, "CLIENT_CONFIRM", "HIGH", reason));
  const integrations: Gap[] = [];
  if (profile.account_maturity === "EXISTING_ACCOUNT" && snapshot.connections.meta !== "read_only_connected") integrations.push(gap("metaAccountHistory", "Meta account history", "CONNECT_READ", "MEDIUM", "Connect Meta in read-only mode to audit campaigns and delivery history."));
  if (snapshot.connections.hubspot !== "read_only_connected") integrations.push(gap("crmOutcomeData", "CRM outcome data", "CONNECT_READ", "MEDIUM", "Connect HubSpot in read-only mode to compare lead quality with paid outcomes."));
  if (missing(known.trackingStatus)) integrations.push(gap("trackingStatus", "Tracking status", "CONNECT_READ", "HIGH", "Verify the current tracking setup through an approved technical audit."));
  const ready = !publicGaps.length && !questions.length && !integrations.length;
  return {
    overallStatus: ready ? "READY_FOR_SYNTHESIS" : "NEEDS_EVIDENCE",
    specialistJobs: [
      job("PUBLIC_COMPANY_RESEARCH", "Research public offer, locations, proof, and journey.", "READY"),
      job("MARKET_AND_AUDIENCE_RESEARCH", "Research buyer tension, alternatives, and market language.", "READY"),
      job("COMPLIANCE_AND_CLAIM_REVIEW", "Review claims against approved company and regulatory evidence.", publicGaps.length ? "WAITING_FOR_RESEARCH" : "READY"),
      job("FUNNEL_AND_LANDING_AUDIT", "Audit the enquiry destination and qualification hand-off.", missing(known.landingDestination) ? "WAITING_FOR_RESEARCH" : "READY"),
      job("META_ACCOUNT_AUDIT", "Inspect account history in read-only mode.", snapshot.connections.meta === "read_only_connected" ? "READY" : "WAITING_FOR_CONNECTION"),
      job("CRM_OUTCOME_AUDIT", "Inspect aggregated CRM outcomes in read-only mode.", snapshot.connections.hubspot === "read_only_connected" ? "READY" : "WAITING_FOR_CONNECTION"),
    ],
    autoDiscoveryGaps: publicGaps,
    questionQueue: questions,
    integrationRequests: integrations,
    strategySynthesis: { status: ready ? "READY_FOR_SYNTHESIS" : publicGaps.length ? "WAITING_FOR_RESEARCH" : questions.length ? "WAITING_FOR_CLIENT_INPUT" : "WAITING_FOR_CONNECTION" },
  };
}

function job(id: string, purpose: string, status: string): SpecialistJob { return { id, purpose, status }; }
function gap(key: string, labelText: string, route: string, priority: string, reason: string): Gap { return { key, label: labelText, route, priority, reason }; }
function missing(value: unknown): boolean { return value === null || value === undefined || value === "" || value === false || value === 0; }
function label(key: string): string { return ({ offer: "Offer", market: "Market", landingDestination: "Landing destination", primaryGoal: "Primary goal", conversionEvent: "Conversion event" } as Record<string, string>)[key] ?? key; }
function databaseRoute(route: string): string { return route.toLowerCase(); }
function taskDatabaseStatus(status: string): string { return ({ READY: "queued", WAITING_FOR_RESEARCH: "waiting_for_research", WAITING_FOR_CONNECTION: "waiting_for_connection" } as Record<string, string>)[status] ?? "waiting_for_client_input"; }
function specialistDatabaseValue(id: string): string { return id.toLowerCase(); }
