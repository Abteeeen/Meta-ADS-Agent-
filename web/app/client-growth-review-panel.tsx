"use client";

import { ArrowRight, BadgeCheck, BarChart3, CheckCircle2, CircleAlert, ClipboardCheck, FileCheck2, FileSearch, MessageCircle, MousePointerClick, ShieldCheck, Sparkles, Target, UsersRound } from "lucide-react";
import { useState } from "react";

import { demoGrowthReviews } from "./client-growth-review-data";

type ReviewView = "review" | "drafts" | "qualification" | "handoff";

const views: Array<{ id: ReviewView; label: string; icon: typeof FileSearch }> = [
  { id: "review", label: "Growth review", icon: FileSearch },
  { id: "drafts", label: "Campaign drafts", icon: Target },
  { id: "qualification", label: "Lead quality", icon: MessageCircle },
  { id: "handoff", label: "Operator handoff", icon: ClipboardCheck },
];

export function ClientGrowthReviewPanel() {
  const [view, setView] = useState<ReviewView>("review");
  const [reviewIndex, setReviewIndex] = useState(0);
  const review = demoGrowthReviews[reviewIndex];

  return (
    <section className="growth-review-panel" aria-labelledby="growth-review-title">
      <div className="growth-review-heading">
        <div className="icon-tile review"><Sparkles size={19} /></div>
        <div>
          <p className="eyebrow">Client growth review</p>
          <h2 id="growth-review-title">{review.companyName}</h2>
        </div>
        <label className="review-company-select">Demo company<select aria-label="Choose client growth review" onChange={(event) => { setReviewIndex(Number(event.target.value)); setView("review"); }} value={reviewIndex}>{demoGrowthReviews.map((item, index) => <option key={item.companyName} value={index}>{item.companyName}</option>)}</select></label>
        <span className="review-status"><CircleAlert size={14} /> Client validation required</span>
      </div>
      <p className="growth-review-lede">{review.headline} This is the first reviewable operator pack: it separates known facts, working hypotheses and client decisions before any Meta account action.</p>

      <div className="review-tabs" role="tablist" aria-label="Client growth review views">
        {views.map((item) => {
          const Icon = item.icon;
          return <button aria-selected={view === item.id} className={view === item.id ? "active" : ""} key={item.id} onClick={() => setView(item.id)} role="tab" type="button"><Icon size={16} /> {item.label}</button>;
        })}
      </div>

      {view === "review" && <div className="review-view" role="tabpanel">
        <div className="review-summary">
          <div><span>Offer</span><strong>{review.offer}</strong></div>
          <div><span>Priority routes</span><strong>{review.primaryLocations.join(" + ")}</strong></div>
          <div><span>North-star outcome</span><strong>{review.primaryOutcome}</strong></div>
        </div>
        <div className="review-diagnosis-grid">
          {review.diagnosis.map((item) => <article key={item.title}><span>{item.label}</span><h3>{item.title}</h3><p>{item.detail}</p></article>)}
        </div>
        <div className="review-two-column">
          <article className="review-card"><BadgeCheck size={20} /><h3>Audience focus</h3><p>{review.audience}</p></article>
          <article className="review-card"><UsersRound size={20} /><h3>Follow-up rule</h3><p>{review.followUp} Every contact outcome belongs in {review.crm}.</p></article>
        </div>
      </div>}

      {view === "drafts" && <div className="review-view" role="tabpanel">
        <div className="review-section-heading"><div><p className="eyebrow">No-spend draft pack</p><h3>Location-specific campaign proposals</h3></div><span>Not connected to Meta</span></div>
        <div className="campaign-draft-list">
          {review.campaigns.map((campaign) => <article key={campaign.name}><div className="campaign-draft-top"><div><Target size={18} /><strong>{campaign.name}</strong></div><span>{campaign.status}</span></div><dl><div><dt>Objective</dt><dd>{campaign.objective}</dd></div><div><dt>Location</dt><dd>{campaign.location}</dd></div><div><dt>Lead route</dt><dd>{campaign.route}</dd></div></dl><p><ShieldCheck size={15} /> {campaign.guardrail}</p></article>)}
        </div>
        <div className="review-callout"><FileCheck2 size={19} /><span>Once Meta is authorised read-only, the account auditor compares these drafts against the live campaign structure, targeting, creative and Insights data. It does not publish anything.</span></div>
      </div>}

      {view === "qualification" && <div className="review-view" role="tabpanel">
        <div className="review-section-heading"><div><p className="eyebrow">Lead-quality flow</p><h3>Qualify with context, then hand off fast</h3></div><span>Approval required before use</span></div>
        <div className="qualification-flow">
          <article><MousePointerClick size={20} /><strong>Ad or landing route</strong><p>{review.qualificationIntro}</p></article><ArrowRight size={17} aria-hidden="true" /><article><MessageCircle size={20} /><strong>Approved questions</strong><p>Ask only the minimum questions that clarify fit.</p></article><ArrowRight size={17} aria-hidden="true" /><article><UsersRound size={20} /><strong>Human follow-up</strong><p>Contact ownership and timing recorded in {review.crm}.</p></article>
        </div>
        <ol className="review-question-list">{review.questions.map((question) => <li key={question}>{question}</li>)}</ol>
        <p className="review-warning"><CircleAlert size={16} /> Do not ask for criminal-history, licence, identity or other sensitive eligibility data in Meta forms or messaging. The client must approve final wording and privacy handling.</p>
      </div>}

      {view === "handoff" && <div className="review-view" role="tabpanel">
        <div className="review-section-heading"><div><p className="eyebrow">Agency engagement path</p><h3>What changes after the client approves</h3></div><span>Human-controlled</span></div>
        <div className="operator-path">
          <article><span>01</span><strong>Validate this review</strong><p>{review.companyName} confirms claims, capacity, budget, follow-up ownership and the definition of a qualified lead.</p></article>
          <article><span>02</span><strong>Authorise read-only connections</strong><p>Meta and HubSpot are connected with minimum access so the account auditor can establish the real baseline.</p></article>
          <article><span>03</span><strong>Approve draft pack</strong><p>The agency reviews the campaign, creative, qualification flow, locations and measurement plan with named owners.</p></article>
          <article><span>04</span><strong>Launch and learn</strong><p>A human publishes the approved build. Weekly reporting compares lead quality and {review.salesOutcome} before one controlled optimisation.</p></article>
        </div>
        <div className="review-proof-list"><h3>Evidence still needed before launch</h3>{review.proofNeeded.map((item) => <p key={item}><CircleAlert size={15} /> {item}</p>)}</div>
      </div>}

      <div className="review-metric-band">
        {review.measurement.map(([label, detail]) => <div key={label}><BarChart3 size={16} /><strong>{label}</strong><span>{detail}</span></div>)}
      </div>
      <div className="review-footer"><div><CheckCircle2 size={18} /><span>Next client decision: validate the discovery review, then authorise a read-only account audit.</span></div><button className="secondary-button" onClick={() => setView("handoff")} type="button">View engagement path <ArrowRight size={16} /></button></div>
    </section>
  );
}
