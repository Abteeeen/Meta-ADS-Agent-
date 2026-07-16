"use client";

import { Building2, Database, LogIn, LogOut, Plus, RefreshCw, UserRoundCheck } from "lucide-react";
import { FormEvent, useCallback, useEffect, useState } from "react";

import { getSupabaseBrowserClient } from "./supabase-browser";

type WorkspaceConnectionProps = {
  onCompanyReady: (name: string) => void;
};

const fiveStarProfile = {
  name: "Five Star Training Academy",
  vertical: "Security training and vocational education",
  business_model: "LEAD_GENERATION",
  market: "Queensland, Australia",
  offer: "CPP20218 Certificate II in Security Operations",
  primary_goal: "QUALIFIED_ENROLMENT_LEADS",
  conversion_event: "Qualified enrollment lead",
  landing_destination: "https://fivestartraining.edu.au/courses/certificate-ii-in-security-operations/",
  tracking_status: "unknown",
};

export function WorkspaceConnection({ onCompanyReady }: WorkspaceConnectionProps) {
  const [email, setEmail] = useState("");
  const [organizationName, setOrganizationName] = useState("Meta Ads Operations");
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [message, setMessage] = useState("Checking connection status.");
  const [busy, setBusy] = useState(false);
  const client = getSupabaseBrowserClient();

  const loadWorkspace = useCallback(async () => {
    if (!client) {
      setMessage("Demo mode. Add the Supabase public URL and publishable key to connect this workspace.");
      return;
    }

    const { data: sessionData } = await client.auth.getSession();
    const session = sessionData.session;
    setUserEmail(session?.user.email ?? null);
    if (!session) {
      setMessage("Sign in to create or open a secure company workspace.");
      return;
    }

    const { data: membership, error: membershipError } = await client
      .from("organization_members")
      .select("organization_id")
      .limit(1)
      .maybeSingle();
    if (membershipError) {
      setMessage(`Could not load your workspace: ${membershipError.message}`);
      return;
    }
    if (!membership) {
      setOrganizationId(null);
      setMessage("Create your agency workspace once. You can then add multiple client companies.");
      return;
    }

    setOrganizationId(membership.organization_id);
    const { data: company } = await client
      .from("companies")
      .select("name")
      .eq("organization_id", membership.organization_id)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();
    if (company?.name) {
      onCompanyReady(company.name);
      setMessage(`${company.name} is connected to this secure workspace.`);
    } else {
      setMessage("Your agency workspace is ready. Add the first company when its intake is approved.");
    }
  }, [client, onCompanyReady]);

  useEffect(() => {
    const initialLoad = window.setTimeout(() => void loadWorkspace(), 0);
    if (!client) return () => window.clearTimeout(initialLoad);
    const { data } = client.auth.onAuthStateChange(() => void loadWorkspace());
    return () => {
      window.clearTimeout(initialLoad);
      data.subscription.unsubscribe();
    };
  }, [client, loadWorkspace]);

  async function sendMagicLink(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!client) return;
    setBusy(true);
    const { error } = await client.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin },
    });
    setMessage(error ? error.message : "Check your inbox for the secure sign-in link.");
    setBusy(false);
  }

  async function createOrganization() {
    if (!client) return;
    setBusy(true);
    const { data, error } = await client.rpc("bootstrap_organization", {
      organization_name: organizationName,
    });
    if (error) {
      setMessage(error.message);
    } else {
      setOrganizationId(data);
      setMessage("Agency workspace created. You can now add Five Star Training Academy.");
    }
    setBusy(false);
  }

  async function createFiveStarWorkspace() {
    if (!client || !organizationId) return;
    setBusy(true);
    const { data: company, error: companyError } = await client
      .from("companies")
      .insert({
        organization_id: organizationId,
        name: fiveStarProfile.name,
        vertical: fiveStarProfile.vertical,
      })
      .select("id, name")
      .single();
    if (companyError || !company) {
      setMessage(companyError?.message ?? "Could not create the company workspace.");
      setBusy(false);
      return;
    }

    const { error: profileError } = await client.from("company_profiles").insert({
      company_id: company.id,
      business_model: fiveStarProfile.business_model,
      market: fiveStarProfile.market,
      offer: fiveStarProfile.offer,
      primary_goal: fiveStarProfile.primary_goal,
      conversion_event: fiveStarProfile.conversion_event,
      landing_destination: fiveStarProfile.landing_destination,
      tracking_status: fiveStarProfile.tracking_status,
    });
    if (profileError) {
      setMessage(`Company created, but the starter profile needs attention: ${profileError.message}`);
    } else {
      onCompanyReady(company.name);
      setMessage("Five Star Training Academy workspace created. Complete its intake before launch planning.");
    }
    setBusy(false);
  }

  async function signOut() {
    if (!client) return;
    await client.auth.signOut();
    setOrganizationId(null);
    setUserEmail(null);
    setMessage("Signed out of the secure workspace.");
  }

  if (!client) {
    return (
      <section className="connection-panel">
        <div className="connection-copy"><Database size={20} /><div><strong>Supabase is ready</strong><span>Database installed. Add public project variables to enable sign-in.</span></div></div>
        <span className="demo-badge">Demo mode</span>
      </section>
    );
  }

  if (!userEmail) {
    return (
      <section className="connection-panel">
        <div className="connection-copy"><LogIn size={20} /><div><strong>Secure sign-in required</strong><span>Company records remain private to your Supabase account.</span></div></div>
        <form className="signin-form" onSubmit={sendMagicLink}>
          <input aria-label="Email address" onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" required type="email" value={email} />
          <button className="command-button" disabled={busy} type="submit"><LogIn size={16} /> Send sign-in link</button>
        </form>
        <p className="connection-message" role="status">{message}</p>
      </section>
    );
  }

  if (!organizationId) {
    return (
      <section className="connection-panel">
        <div className="connection-copy"><Building2 size={20} /><div><strong>Create your agency workspace</strong><span>{userEmail}</span></div></div>
        <div className="signin-form"><input aria-label="Agency workspace name" onChange={(event) => setOrganizationName(event.target.value)} value={organizationName} /><button className="command-button" disabled={busy} onClick={createOrganization} type="button"><Plus size={16} /> Create workspace</button></div>
        <p className="connection-message" role="status">{message}</p>
      </section>
    );
  }

  return (
    <section className="connection-panel">
      <div className="connection-copy"><UserRoundCheck size={20} /><div><strong>Secure workspace connected</strong><span>{userEmail}</span></div></div>
      <div className="connection-actions">
        <button className="secondary-button" disabled={busy} onClick={() => void loadWorkspace()} type="button"><RefreshCw size={15} /> Refresh</button>
        <button className="secondary-button" onClick={signOut} type="button"><LogOut size={15} /> Sign out</button>
        <button className="command-button" disabled={busy} onClick={createFiveStarWorkspace} type="button"><Plus size={16} /> Add Five Star</button>
      </div>
      <p className="connection-message" role="status">{message}</p>
    </section>
  );
}
