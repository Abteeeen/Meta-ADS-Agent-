"use client";

import { Building2, CheckCircle2, Clock3, LoaderCircle, MailPlus, ShieldCheck, UsersRound } from "lucide-react";
import { FormEvent, useCallback, useEffect, useState } from "react";

import { getSupabaseBrowserClient } from "./supabase-browser";

type Company = { id: string; name: string };
type AccessRecord = {
  access_id: string;
  email: string;
  role: string;
  access_scope: "agency" | "client" | "invitation";
  status: string;
  created_at: string;
  expires_at: string | null;
};
type InvitationResult = { invitation_id: string; invite_token: string; expires_at: string };

function roleLabel(role: string) {
  return role.replaceAll("_", " ");
}

export function TeamAccessPanel() {
  const client = getSupabaseBrowserClient();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [companyId, setCompanyId] = useState("");
  const [access, setAccess] = useState<AccessRecord[]>([]);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("client_viewer");
  const [message, setMessage] = useState("Sign in to manage company access.");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const loadAccess = useCallback(async (nextCompanyId: string) => {
    if (!client || !nextCompanyId) return;
    const { data, error } = await client.rpc("list_company_access", { target_company_id: nextCompanyId });
    if (error) {
      setAccess([]);
      setMessage("You can use this company workspace, but only an agency operator or client admin can manage access.");
      return;
    }
    setAccess((data ?? []) as AccessRecord[]);
    setMessage("Access is isolated to this company. Invitations expire after 24 hours.");
  }, [client]);

  const loadCompanies = useCallback(async (preferredCompanyId?: string) => {
    if (!client) {
      setLoading(false);
      return;
    }
    const { data: sessionData } = await client.auth.getSession();
    if (!sessionData.session) {
      setCompanies([]);
      setAccess([]);
      setLoading(false);
      return;
    }
    const { data, error } = await client.from("companies").select("id, name").order("created_at", { ascending: true });
    if (error) {
      setMessage(`Could not load company access: ${error.message}`);
      setLoading(false);
      return;
    }
    const nextCompanies = (data ?? []) as Company[];
    const nextCompanyId = preferredCompanyId && nextCompanies.some((company) => company.id === preferredCompanyId)
      ? preferredCompanyId
      : nextCompanies.some((company) => company.id === companyId) ? companyId : nextCompanies[0]?.id ?? "";
    setCompanies(nextCompanies);
    setCompanyId(nextCompanyId);
    if (nextCompanyId) await loadAccess(nextCompanyId);
    setLoading(false);
  }, [client, companyId, loadAccess]);

  const acceptInvitation = useCallback(async () => {
    if (!client) return;
    const inviteToken = new URLSearchParams(window.location.search).get("invite");
    if (!inviteToken) return;
    const { data: sessionData } = await client.auth.getSession();
    if (!sessionData.session) {
      setMessage("Open the secure sign-in email sent to the invited address to accept this invitation.");
      return;
    }
    setLoading(true);
    const { data, error } = await client.rpc("accept_company_invitation", { invite_token: inviteToken });
    window.history.replaceState({}, "", `${window.location.pathname}${window.location.hash}` || "/");
    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }
    setMessage("Invitation accepted. This company workspace is now available to your account.");
    window.dispatchEvent(new Event("company-workspace-created"));
    await loadCompanies(data as string);
  }, [client, loadCompanies]);

  useEffect(() => {
    const initialLoad = window.setTimeout(async () => {
      await acceptInvitation();
      await loadCompanies();
    }, 0);
    if (!client) return () => window.clearTimeout(initialLoad);
    const { data } = client.auth.onAuthStateChange(() => window.setTimeout(async () => {
      await acceptInvitation();
      await loadCompanies();
    }, 0));
    const reload = () => void loadCompanies();
    window.addEventListener("company-workspace-created", reload);
    return () => {
      window.clearTimeout(initialLoad);
      data.subscription.unsubscribe();
      window.removeEventListener("company-workspace-created", reload);
    };
  }, [acceptInvitation, client, loadCompanies]);

  async function sendInvitation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!client || !companyId) return;
    setSending(true);
    const { data, error } = await client.rpc("create_company_invitation", {
      target_company_id: companyId,
      invite_email: email,
      invite_role: role,
      validity_hours: 24,
    });
    const invitation = (Array.isArray(data) ? data[0] : data) as InvitationResult | null;
    if (error || !invitation) {
      setMessage(error?.message ?? "Could not create the invitation.");
      setSending(false);
      return;
    }
    const redirectTo = `${window.location.origin}/?invite=${encodeURIComponent(invitation.invite_token)}`;
    const { error: deliveryError } = await client.auth.signInWithOtp({ email: email.trim(), options: { emailRedirectTo: redirectTo } });
    if (deliveryError) {
      setMessage(`Invitation recorded, but the sign-in email could not be sent: ${deliveryError.message}`);
    } else {
      setEmail("");
      setMessage("Secure invitation sent. The client must use the same email address to accept it.");
    }
    await loadAccess(companyId);
    setSending(false);
  }

  const canInvite = access.length > 0;

  return (
    <section className="team-panel" aria-labelledby="team-access-title">
      <div className="team-heading">
        <div className="icon-tile mint"><UsersRound size={19} /></div>
        <div><p className="eyebrow">Team and access</p><h2 id="team-access-title">Company permissions</h2></div>
        <span className="status-chip">{access.filter((item) => item.status === "active").length} active</span>
      </div>
      <p className="team-copy">Agency members can work across assigned companies. Client members receive access only to the selected company and never to another client workspace.</p>
      <div className="company-select-row">
        <label htmlFor="access-company-selector">Company</label>
        {companies.length > 0 ? (
          <select disabled={loading} id="access-company-selector" onChange={(event) => { setCompanyId(event.target.value); void loadAccess(event.target.value); }} value={companyId}>
            {companies.map((company) => <option key={company.id} value={company.id}>{company.name}</option>)}
          </select>
        ) : <span className="empty-company-note">Sign in above, then create your first company workspace.</span>}
      </div>
      {loading ? <p className="team-message"><LoaderCircle size={15} /> Loading access...</p> : (
        <>
          {canInvite && (
            <form className="invite-form" onSubmit={sendInvitation}>
              <label>Email<input onChange={(event) => setEmail(event.target.value)} placeholder="client@company.com" required type="email" value={email} /></label>
              <label>Role<select onChange={(event) => setRole(event.target.value)} value={role}><option value="client_viewer">Client viewer</option><option value="client_admin">Client admin</option></select></label>
              <button className="command-button" disabled={sending} type="submit"><MailPlus size={16} /> Send invite</button>
            </form>
          )}
          <div className="access-list">
            {access.map((item) => (
              <div key={`${item.access_scope}-${item.access_id}`}>
                <span className={`access-icon ${item.status}`} aria-hidden="true">{item.status === "active" ? <ShieldCheck size={16} /> : item.status === "accepted" ? <CheckCircle2 size={16} /> : <Clock3 size={16} />}</span>
                <div><strong>{item.email}</strong><small>{item.access_scope === "invitation" ? "Client invitation" : `${item.access_scope} access`}</small></div>
                <span className="access-role">{roleLabel(item.role)}</span>
                <span className={`access-state ${item.status}`}>{item.status}</span>
              </div>
            ))}
            {!access.length && <div className="access-empty"><Building2 size={17} /><span>No manageable company access is available for this account.</span></div>}
          </div>
        </>
      )}
      <p className="team-message" role="status">{message}</p>
    </section>
  );
}
