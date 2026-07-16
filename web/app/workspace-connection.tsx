"use client";

import { Building2, Database, LogIn, LogOut, Plus, RefreshCw, UserRoundCheck } from "lucide-react";
import { FormEvent, useCallback, useEffect, useState } from "react";

import { getSupabaseBrowserClient } from "./supabase-browser";

type WorkspaceConnectionProps = {
  onCompanyReady: (name: string) => void;
};

export function WorkspaceConnection({ onCompanyReady }: WorkspaceConnectionProps) {
  const [email, setEmail] = useState("");
  const [organizationName, setOrganizationName] = useState("Meta Ads Operations");
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [clientWorkspaceOnly, setClientWorkspaceOnly] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [companyVertical, setCompanyVertical] = useState("");
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

    const [{ data: membership, error: membershipError }, { data: companies, error: companyError }] = await Promise.all([
      client
      .from("organization_members")
      .select("organization_id")
      .limit(1)
      .maybeSingle(),
      client.from("companies").select("name").order("created_at", { ascending: true }).limit(1),
    ]);
    if (membershipError || companyError) {
      setMessage(`Could not load your workspace: ${membershipError?.message ?? companyError?.message}`);
      return;
    }
    if (!membership) {
      setOrganizationId(null);
      if (companies?.[0]?.name) {
        setClientWorkspaceOnly(true);
        onCompanyReady(companies[0].name);
        setMessage(`${companies[0].name} is connected to your private client workspace.`);
        return;
      }
      setClientWorkspaceOnly(false);
      setMessage("Create your agency workspace once. You can then add multiple client companies.");
      return;
    }

    setClientWorkspaceOnly(false);
    setOrganizationId(membership.organization_id);
    if (companies?.[0]?.name) {
      onCompanyReady(companies[0].name);
      setMessage(`${companies[0].name} is connected to this secure workspace.`);
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
      setMessage("Agency workspace created. Add the first client company when you are ready.");
    }
    setBusy(false);
  }

  async function createCompanyWorkspace() {
    if (!client || !organizationId) return;
    if (!companyName.trim() || !companyVertical.trim()) {
      setMessage("Enter a company name and industry before creating its private workspace.");
      return;
    }
    setBusy(true);
    const { data: company, error: companyError } = await client
      .from("companies")
      .insert({
        organization_id: organizationId,
        name: companyName.trim(),
        vertical: companyVertical.trim(),
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
      business_model: "UNSPECIFIED",
      market: "Not yet confirmed",
      offer: "Not yet confirmed",
      primary_goal: "Not yet confirmed",
      conversion_event: "Not yet confirmed",
      tracking_status: "unknown",
    });
    if (profileError) {
      setMessage(`Company created, but the starter profile needs attention: ${profileError.message}`);
    } else {
      onCompanyReady(company.name);
      setCompanyName("");
      setCompanyVertical("");
      window.dispatchEvent(new Event("company-workspace-created"));
      setMessage(`${company.name} workspace created. Complete its intake before launch planning.`);
    }
    setBusy(false);
  }

  async function signOut() {
    if (!client) return;
    await client.auth.signOut();
    setOrganizationId(null);
    setClientWorkspaceOnly(false);
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
    if (clientWorkspaceOnly) {
      return (
        <section className="connection-panel">
          <div className="connection-copy"><UserRoundCheck size={20} /><div><strong>Private client workspace connected</strong><span>{userEmail}</span></div></div>
          <div className="connection-actions"><button className="secondary-button" disabled={busy} onClick={() => void loadWorkspace()} type="button"><RefreshCw size={15} /> Refresh</button><button className="secondary-button" onClick={signOut} type="button"><LogOut size={15} /> Sign out</button></div>
          <p className="connection-message" role="status">{message}</p>
        </section>
      );
    }
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
        <div className="company-create"><input aria-label="Company name" onChange={(event) => setCompanyName(event.target.value)} placeholder="Client company name" value={companyName} /><input aria-label="Company industry" onChange={(event) => setCompanyVertical(event.target.value)} placeholder="Industry" value={companyVertical} /><button className="command-button" disabled={busy} onClick={createCompanyWorkspace} type="button"><Plus size={16} /> Add company</button></div>
      </div>
      <p className="connection-message" role="status">{message}</p>
    </section>
  );
}
