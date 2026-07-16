"use client";

import { Check, ClipboardCheck, LoaderCircle, Send, X } from "lucide-react";
import { FormEvent, useCallback, useEffect, useState } from "react";

import { getSupabaseBrowserClient } from "./supabase-browser";

type Approval = { id: string; approval_type: string; status: "pending" | "approved" | "rejected" | "superseded"; decision_note: string | null; created_at: string };
type Company = { id: string; name: string };

export function ApprovalCenterPanel() {
  const [company, setCompany] = useState<Company | null>(null);
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [type, setType] = useState("company_facts");
  const [note, setNote] = useState("");
  const [message, setMessage] = useState("Sign in and choose a company to review approvals.");
  const [busy, setBusy] = useState(false);
  const client = getSupabaseBrowserClient();

  const load = useCallback(async () => {
    if (!client) return;
    const { data: sessionData } = await client.auth.getSession();
    if (!sessionData.session) return;
    const { data: nextCompany, error: companyError } = await client.from("companies").select("id, name").order("created_at", { ascending: true }).limit(1).maybeSingle();
    if (companyError || !nextCompany) {
      setCompany(null);
      setApprovals([]);
      setMessage(companyError?.message ?? "Add a company before requesting approval.");
      return;
    }
    setCompany(nextCompany as Company);
    const { data, error } = await client.from("approval_requests").select("id, approval_type, status, decision_note, created_at").eq("company_id", nextCompany.id).order("created_at", { ascending: false });
    if (error) {
      setMessage(`Could not load approvals: ${error.message}`);
      return;
    }
    setApprovals((data ?? []) as Approval[]);
    setMessage(data?.length ? "Every change that matters has a named decision state." : "No approvals yet. Request review when company facts, claims, strategy, creative, or launch material is ready.");
  }, [client]);

  useEffect(() => {
    const initialLoad = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(initialLoad);
  }, [load]);

  async function requestApproval(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!client || !company) return;
    setBusy(true);
    const { data: sessionData } = await client.auth.getSession();
    const { error } = await client.from("approval_requests").insert({ company_id: company.id, approval_type: type, requested_by: sessionData.session?.user.id ?? null });
    setMessage(error ? error.message : `Requested ${type.replaceAll("_", " ")} review.`);
    setNote("");
    setBusy(false);
    if (!error) await load();
  }

  async function decide(approval: Approval, status: "approved" | "rejected") {
    if (!client) return;
    setBusy(true);
    const { data: sessionData } = await client.auth.getSession();
    const { error } = await client.from("approval_requests").update({ status, decision_note: note || null, decided_by: sessionData.session?.user.id ?? null, decided_at: new Date().toISOString() }).eq("id", approval.id).eq("status", "pending");
    setMessage(error ? error.message : `${approval.approval_type.replaceAll("_", " ")} ${status}.`);
    setNote("");
    setBusy(false);
    if (!error) await load();
  }

  return (
    <section className="approval-panel" aria-labelledby="approval-title">
      <div className="approval-heading"><div className="icon-tile coral"><ClipboardCheck size={19} /></div><div><p className="eyebrow">Approval center</p><h2 id="approval-title">Human decisions stay explicit</h2></div></div>
      <p className="approval-copy">No agent output, mock account result, or future Meta draft becomes a live action without a named approval. There is no publish control here.</p>
      {company && <form className="approval-request" onSubmit={(event) => void requestApproval(event)}><select aria-label="Approval type" onChange={(event) => setType(event.target.value)} value={type}><option value="company_facts">Company facts</option><option value="claims">Claims</option><option value="strategy">Strategy</option><option value="creative">Creative</option><option value="launch">Launch</option><option value="experiment">Experiment</option><option value="connection_scope">Connection scope</option></select><button className="secondary-button" disabled={busy} type="submit"><Send size={15} /> Request review</button></form>}
      {approvals.length > 0 && <div className="approval-list">{approvals.map((approval) => <div key={approval.id}><div><strong>{approval.approval_type.replaceAll("_", " ")}</strong><small>{new Date(approval.created_at).toLocaleString()}</small></div><span className={`approval-state ${approval.status}`}>{approval.status}</span>{approval.status === "pending" && <div className="approval-actions"><button aria-label="Approve request" className="icon-button" disabled={busy} onClick={() => void decide(approval, "approved")} title="Approve"><Check size={15} /></button><button aria-label="Reject request" className="icon-button" disabled={busy} onClick={() => void decide(approval, "rejected")} title="Reject"><X size={15} /></button></div>}</div>)}</div>}
      {approvals.some((approval) => approval.status === "pending") && <label className="approval-note">Decision note<input onChange={(event) => setNote(event.target.value)} placeholder="Optional rationale recorded with the decision" value={note} /></label>}
      <p className="approval-message" role="status">{busy && <LoaderCircle size={15} />} {message}</p>
    </section>
  );
}
