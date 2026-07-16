"use client";

import { Building2, CheckCircle2, CircleAlert, LoaderCircle, Save } from "lucide-react";
import { FormEvent, useCallback, useEffect, useState } from "react";

import { getSupabaseBrowserClient } from "./supabase-browser";

type Company = { id: string; name: string; status: string };
type OnboardingRecord = {
  status: "draft" | "in_progress" | "ready_for_review" | "complete";
  business_details: Record<string, unknown>;
  offer_catalog: Array<Record<string, unknown>>;
  audience_definition: Record<string, unknown>;
  locations: string[];
  goals_and_budget: Record<string, unknown>;
  capacity_and_availability: Record<string, unknown>;
  claims_and_compliance: Record<string, unknown>;
  crm_process: Record<string, unknown>;
  follow_up_process: Record<string, unknown>;
};

type FormState = {
  businessDescription: string;
  primaryOffer: string;
  audience: string;
  locations: string;
  goal: string;
  monthlyBudget: string;
  capacity: string;
  approvedClaims: string;
  crm: string;
  followUp: string;
};

const emptyForm: FormState = {
  businessDescription: "",
  primaryOffer: "",
  audience: "",
  locations: "",
  goal: "",
  monthlyBudget: "",
  capacity: "",
  approvedClaims: "",
  crm: "",
  followUp: "",
};

function fromRecord(record: OnboardingRecord | null, profile: Record<string, unknown> | null): FormState {
  if (!record) {
    return {
      ...emptyForm,
      primaryOffer: typeof profile?.offer === "string" && profile.offer !== "Not yet confirmed" ? profile.offer : "",
      goal: typeof profile?.primary_goal === "string" && profile.primary_goal !== "Not yet confirmed" ? profile.primary_goal : "",
      monthlyBudget: typeof profile?.monthly_budget === "number" ? String(profile.monthly_budget) : "",
    };
  }
  return {
    businessDescription: String(record.business_details.description ?? ""),
    primaryOffer: String(record.offer_catalog[0]?.name ?? profile?.offer ?? ""),
    audience: String(record.audience_definition.summary ?? ""),
    locations: record.locations.join(", "),
    goal: String(record.goals_and_budget.primaryGoal ?? profile?.primary_goal ?? ""),
    monthlyBudget: record.goals_and_budget.monthlyBudget ? String(record.goals_and_budget.monthlyBudget) : "",
    capacity: String(record.capacity_and_availability.summary ?? ""),
    approvedClaims: String(record.claims_and_compliance.approvedClaims ?? ""),
    crm: String(record.crm_process.summary ?? ""),
    followUp: String(record.follow_up_process.summary ?? ""),
  };
}

export function CompanyOnboardingPanel() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [companyId, setCompanyId] = useState("");
  const [form, setForm] = useState<FormState>(emptyForm);
  const [status, setStatus] = useState<OnboardingRecord["status"]>("draft");
  const [message, setMessage] = useState("Sign in to load your company onboarding workspace.");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const client = getSupabaseBrowserClient();

  const loadCompany = useCallback(async (nextCompanyId: string) => {
    if (!client || !nextCompanyId) return;
    setLoading(true);
    const [onboardingResult, profileResult] = await Promise.all([
      client.from("company_onboarding").select("*").eq("company_id", nextCompanyId).maybeSingle(),
      client.from("company_profiles").select("*").eq("company_id", nextCompanyId).maybeSingle(),
    ]);
    if (onboardingResult.error || profileResult.error) {
      setMessage("Could not load this company intake. Check the workspace permission and refresh.");
      setLoading(false);
      return;
    }
    const onboarding = onboardingResult.data as OnboardingRecord | null;
    setStatus(onboarding?.status ?? "draft");
    setForm(fromRecord(onboarding, profileResult.data));
    setMessage(onboarding ? "Continue the intake, then send it for review." : "Start with known facts. Unavailable information can stay blank and be routed as an evidence gap.");
    setLoading(false);
  }, [client]);

  const loadCompanies = useCallback(async () => {
    if (!client) {
      setLoading(false);
      return;
    }
    const { data: sessionData } = await client.auth.getSession();
    if (!sessionData.session) {
      setCompanies([]);
      setLoading(false);
      return;
    }
    const { data, error } = await client.from("companies").select("id, name, status").order("created_at", { ascending: true });
    if (error) {
      setMessage(`Could not load companies: ${error.message}`);
      setLoading(false);
      return;
    }
    const nextCompanies = (data ?? []) as Company[];
    setCompanies(nextCompanies);
    const nextCompanyId = companyId && nextCompanies.some((company) => company.id === companyId) ? companyId : nextCompanies[0]?.id ?? "";
    setCompanyId(nextCompanyId);
    if (!nextCompanyId) {
      setMessage("An agency operator needs to create a company before onboarding can begin.");
      setLoading(false);
      return;
    }
    await loadCompany(nextCompanyId);
  }, [client, companyId, loadCompany]);

  useEffect(() => {
    const initialLoad = window.setTimeout(() => void loadCompanies(), 0);
    const reload = () => window.setTimeout(() => void loadCompanies(), 0);
    window.addEventListener("company-workspace-created", reload);
    return () => {
      window.clearTimeout(initialLoad);
      window.removeEventListener("company-workspace-created", reload);
    };
  }, [loadCompanies]);

  function update(key: keyof FormState, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function save(event: FormEvent<HTMLFormElement>, nextStatus: OnboardingRecord["status"]) {
    event.preventDefault();
    if (!client || !companyId) return;
    setSaving(true);
    const locations = form.locations.split(",").map((location) => location.trim()).filter(Boolean);
    const monthlyBudget = Number(form.monthlyBudget);
    const payload = {
      company_id: companyId,
      status: nextStatus,
      business_details: { description: form.businessDescription },
      offer_catalog: form.primaryOffer ? [{ name: form.primaryOffer }] : [],
      audience_definition: { summary: form.audience },
      locations,
      goals_and_budget: { primaryGoal: form.goal, monthlyBudget: Number.isFinite(monthlyBudget) && monthlyBudget > 0 ? monthlyBudget : null },
      capacity_and_availability: { summary: form.capacity },
      claims_and_compliance: { approvedClaims: form.approvedClaims },
      crm_process: { summary: form.crm },
      follow_up_process: { summary: form.followUp },
      completed_steps: ["business", "offer", "audience", "locations", "goals", "operations"].filter((step) => {
        const requirements: Record<string, string> = { business: form.businessDescription, offer: form.primaryOffer, audience: form.audience, locations: form.locations, goals: form.goal, operations: form.followUp };
        return Boolean(requirements[step]);
      }),
    };
    const { error: onboardingError } = await client.from("company_onboarding").upsert(payload, { onConflict: "company_id" });
    const { error: profileError } = await client.from("company_profiles").update({
      offer: form.primaryOffer || "Not yet confirmed",
      market: locations.join(", ") || "Not yet confirmed",
      primary_goal: form.goal || "Not yet confirmed",
      monthly_budget: Number.isFinite(monthlyBudget) && monthlyBudget > 0 ? monthlyBudget : null,
    }).eq("company_id", companyId);
    if (onboardingError || profileError) {
      setMessage(onboardingError?.message ?? profileError?.message ?? "Could not save onboarding.");
    } else {
      setStatus(nextStatus);
      setMessage(nextStatus === "ready_for_review" ? "Intake is ready for agency review. Missing facts remain visible to the intelligence run." : "Onboarding draft saved privately to this company workspace.");
    }
    setSaving(false);
  }

  return (
    <section className="onboarding-panel" aria-labelledby="onboarding-title">
      <div className="onboarding-heading">
        <div className="icon-tile mint"><Building2 size={19} /></div>
        <div><p className="eyebrow">Company onboarding</p><h2 id="onboarding-title">Build the company context</h2></div>
        <span className={`status-chip ${status}`}>{status.replaceAll("_", " ")}</span>
      </div>
      <p className="onboarding-copy">Only company members can view this intake. The agent uses approved and confirmed information; it keeps missing information visible instead of filling gaps with guesses.</p>
      <div className="company-select-row">
        <label htmlFor="company-selector">Company</label>
        {companies.length > 0 ? (
          <select disabled={loading} id="company-selector" onChange={(event) => { setCompanyId(event.target.value); void loadCompany(event.target.value); }} value={companyId}>
            {companies.map((company) => <option key={company.id} value={company.id}>{company.name}</option>)}
          </select>
        ) : <span className="empty-company-note">Sign in above, then create your first company workspace.</span>}
      </div>
      {loading ? <p className="onboarding-message"><LoaderCircle size={15} /> Loading private intake...</p> : (
        <form className="onboarding-form" onSubmit={(event) => void save(event, "in_progress")}>
          <label>Business description<textarea onChange={(event) => update("businessDescription", event.target.value)} placeholder="What does the company do, and for whom?" value={form.businessDescription} /></label>
          <label>Primary offer<input onChange={(event) => update("primaryOffer", event.target.value)} placeholder="Course, product, or service" value={form.primaryOffer} /></label>
          <label>Audience<input onChange={(event) => update("audience", event.target.value)} placeholder="Who should this reach?" value={form.audience} /></label>
          <label>Locations<input onChange={(event) => update("locations", event.target.value)} placeholder="Brisbane, Gold Coast" value={form.locations} /></label>
          <label>Business goal<input onChange={(event) => update("goal", event.target.value)} placeholder="Eligible leads and paid students" value={form.goal} /></label>
          <label>Monthly budget<input inputMode="decimal" onChange={(event) => update("monthlyBudget", event.target.value)} placeholder="Optional until confirmed" value={form.monthlyBudget} /></label>
          <label>Capacity and availability<textarea onChange={(event) => update("capacity", event.target.value)} placeholder="Course dates, seats, stock, or delivery constraints" value={form.capacity} /></label>
          <label>Approved claims<textarea onChange={(event) => update("approvedClaims", event.target.value)} placeholder="Only wording approved by the company or compliance owner" value={form.approvedClaims} /></label>
          <label>CRM process<textarea onChange={(event) => update("crm", event.target.value)} placeholder="Where leads are recorded and how outcomes are tracked" value={form.crm} /></label>
          <label>Follow-up process<textarea onChange={(event) => update("followUp", event.target.value)} placeholder="Owner, channel, and expected response time" value={form.followUp} /></label>
          <div className="onboarding-actions"><button className="secondary-button" disabled={saving || !companyId} type="submit"><Save size={16} /> Save draft</button><button className="command-button" disabled={saving || !companyId} onClick={(event) => void save(event as unknown as FormEvent<HTMLFormElement>, "ready_for_review")} type="button"><CheckCircle2 size={16} /> Send for review</button></div>
        </form>
      )}
      <p className="onboarding-message" role="status"><CircleAlert size={15} /> {message}</p>
    </section>
  );
}
