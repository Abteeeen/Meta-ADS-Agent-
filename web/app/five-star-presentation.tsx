"use client";

import {
  ArrowDown,
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  ClipboardCheck,
  Database,
  FileCheck2,
  MapPin,
  MessageCircle,
  ShieldCheck,
  Target,
  UserCheck,
  XCircle,
} from "lucide-react";
import { useState } from "react";

import "./five-star-presentation.css";

const phases = [
  {
    id: "baseline",
    period: "Days 1-7",
    title: "Make the real funnel visible",
    detail: "Map the current ad, form or chat route, HubSpot stages, course dates, available seats, and contact timing. We establish the baseline before recommending budget changes.",
    deliverable: "A verified lead-quality scorecard and first experiment brief.",
  },
  {
    id: "pilot",
    period: "Days 8-30",
    title: "Test two qualification routes",
    detail: "Keep the current lead path as a control. Test one approved alternative, such as a higher-intent form or a short supported message flow, for Brisbane and Gold Coast separately.",
    deliverable: "A launch-ready campaign pack, approved questions, and a human follow-up hand-off.",
  },
  {
    id: "learn",
    period: "Days 31-90",
    title: "Invest behind evidence",
    detail: "Compare eligible-lead, contact, enrolment, and paid-student outcomes. Change one material variable at a time and keep a decision record for every learning cycle.",
    deliverable: "A weekly decision view that connects ad activity to commercial outcomes.",
  },
];

const onboarding = [
  ["01", "Business truth", "Confirm the offer, approved claims, current dates, locations, capacity, and what counts as an eligible lead."],
  ["02", "Outcome map", "Map HubSpot from enquiry to paid student, including owner, phone/SMS hand-off, and response timing."],
  ["03", "Evidence check", "Audit active ads, forms, website, tracking, and public claims before any new campaign is prepared."],
  ["04", "Approval pack", "Review campaign drafts, creative concepts, questions, measurement, privacy, and compliance with named owners."],
  ["05", "Learn safely", "Connect Meta read-only first, then give people final control over every publish, budget, and audience change."],
];

export function FiveStarPresentation() {
  const [activePhase, setActivePhase] = useState(phases[0].id);
  const phase = phases.find((item) => item.id === activePhase) ?? phases[0];

  return (
    <main className="client-proposal">
      <section className="client-hero" id="overview">
        <nav className="client-nav" aria-label="Presentation navigation">
          <a className="client-brand" href="#overview"><ShieldCheck size={21} /> Meta Ads Agent</a>
          <div className="client-nav-links"><a href="#diagnosis">Diagnosis</a><a href="#plan">30-day plan</a><a href="#onboarding">Onboarding</a></div>
        </nav>
        <div className="client-hero-content">
          <p className="client-kicker">Discovery proposal / Security-course lead quality</p>
          <h1>Five Star Training Academy</h1>
          <h2>From more enquiries to more eligible students.</h2>
          <p className="client-lede">A measured Meta Ads operating system for CPP20218 Security Operations, beginning with Brisbane and the Gold Coast. The goal is not cheaper form fills. It is a clearer path from enquiry to paid student.</p>
          <div className="client-hero-facts" aria-label="Proposal focus">
            <div><BadgeCheck size={18} /><span>First offer</span><strong>CPP20218 Security Operations</strong></div>
            <div><MapPin size={18} /><span>Priority markets</span><strong>Brisbane + Gold Coast</strong></div>
            <div><CircleDollarSign size={18} /><span>North-star outcome</span><strong>Paid student, not just a lead</strong></div>
          </div>
          <a className="client-primary" href="#diagnosis">See the opportunity <ArrowDown size={17} /></a>
        </div>
      </section>

      <section className="client-section client-diagnosis" id="diagnosis" aria-labelledby="diagnosis-title">
        <div className="client-heading"><p>What we see</p><h2 id="diagnosis-title">The likely constraint is not the number of enquiries. It is what happens after the click.</h2></div>
        <div className="diagnosis-grid">
          <article><span className="finding-state">Known direction</span><h3>Lead quality is the commercial problem</h3><p>Five Star wants eligible leads and paid students, while current enquiries can include people who are only asking broad questions or are not ready for the available course path.</p></article>
          <article><span className="finding-state">To verify in onboarding</span><h3>The funnel has no shared quality signal yet</h3><p>We need to confirm how HubSpot records location fit, contact attempts, enrolment, and payment, then connect those outcomes to each ad route.</p></article>
          <article><span className="finding-state">Working assumption</span><h3>Speed and clarity shape quality</h3><p>Phone and SMS follow-up within one day is a promising starting point. We will measure whether it happens consistently and whether the ad sets the right expectation before submission.</p></article>
        </div>
      </section>

      <section className="client-section client-system" aria-labelledby="system-title">
        <div className="client-heading"><p>The fix</p><h2 id="system-title">The agent creates one accountable learning loop.</h2></div>
        <div className="quality-system" aria-label="Lead quality operating loop">
          <article><span>01</span><Target size={21} /><strong>Attract with context</strong><small>Approved course, location, dates, cost context, and expectations in the right creative.</small></article>
          <ArrowRight aria-hidden="true" size={18} />
          <article><span>02</span><ClipboardCheck size={21} /><strong>Qualify safely</strong><small>Use concise, approved form or message questions. Do not collect sensitive licence or identity data.</small></article>
          <ArrowRight aria-hidden="true" size={18} />
          <article><span>03</span><MessageCircle size={21} /><strong>Hand off quickly</strong><small>Create a clear owner, phone/SMS action, and response-time record in HubSpot.</small></article>
          <ArrowRight aria-hidden="true" size={18} />
          <article><span>04</span><Database size={21} /><strong>Learn from outcomes</strong><small>Use approved CRM outcomes to compare routes by eligible lead, enrolment, and paid student.</small></article>
        </div>
        <p className="client-note">WhatsApp or another supported Meta messaging route can be tested later as a short intent-clarifying conversation. It is not an automatic solution, and the final journey must be approved for privacy, compliance, availability, and team capacity.</p>
      </section>

      <section className="client-section client-agent" aria-labelledby="agent-title">
        <div className="client-heading"><p>What the agent does</p><h2 id="agent-title">It turns marketing work into visible, reviewable decisions.</h2></div>
        <div className="agent-scope">
          <div className="agent-do"><CheckCircle2 size={22} /><h3>It will help us</h3><ul><li>Audit the enquiry path and identify missing evidence.</li><li>Draft campaign structures, creative briefs, approved question flows, and launch QA.</li><li>Compare current ads against a controlled alternative.</li><li>Show which route produces eligible leads, enrolments, and paid students.</li><li>Keep a source-linked record of why each recommendation was made.</li></ul></div>
          <div className="agent-not"><XCircle size={22} /><h3>It will not do</h3><ul><li>Promise a licence, job, funding eligibility, seat, or commercial result.</li><li>Make individual licence, funding, or legal eligibility decisions.</li><li>Publish ads, change budgets, or send lead data without named human approval.</li><li>Store passwords, raw lead identities, or sensitive information in the agent knowledge base.</li></ul></div>
        </div>
      </section>

      <section className="client-section client-plan" id="plan" aria-labelledby="plan-title">
        <div className="client-heading"><p>90-day operating path</p><h2 id="plan-title">Start with evidence, then earn the right to scale.</h2></div>
        <div className="phase-layout">
          <div className="phase-tabs" role="tablist" aria-label="Pilot phases">
            {phases.map((item) => <button aria-selected={activePhase === item.id} className={activePhase === item.id ? "active" : ""} key={item.id} onClick={() => setActivePhase(item.id)} role="tab" type="button"><span>{item.period}</span>{item.title}</button>)}
          </div>
          <article className="phase-detail" role="tabpanel"><p>{phase.period}</p><h3>{phase.title}</h3><div className="phase-rule"><Target size={19} /> One material change. One accountable outcome.</div><p>{phase.detail}</p><strong>{phase.deliverable}</strong></article>
        </div>
      </section>

      <section className="client-section client-metrics" aria-labelledby="metrics-title">
        <div className="client-heading"><p>How we judge progress</p><h2 id="metrics-title">A cheaper lead only matters if it reaches the right outcome.</h2></div>
        <div className="metrics-grid">
          <article><UserCheck size={22} /><strong>Eligible lead rate</strong><span>How many enquiries fit the approved course, location, and readiness criteria?</span></article>
          <article><MessageCircle size={22} /><strong>Contacted on time</strong><span>How consistently does the team meet the agreed phone/SMS response window?</span></article>
          <article><CalendarDays size={22} /><strong>Enrolment started</strong><span>Which ad route produces people who take the next meaningful enrolment step?</span></article>
          <article><CircleDollarSign size={22} /><strong>Paid student</strong><span>Which route creates a sustainable commercial result after the full journey is known?</span></article>
        </div>
      </section>

      <section className="client-section client-onboarding" id="onboarding" aria-labelledby="onboarding-title">
        <div className="client-heading"><p>Professional onboarding</p><h2 id="onboarding-title">How a new client becomes an active workspace.</h2></div>
        <ol className="onboarding-list">
          {onboarding.map(([number, title, detail]) => <li key={number}><span>{number}</span><div><strong>{title}</strong><p>{detail}</p></div></li>)}
        </ol>
        <aside className="onboarding-callout"><FileCheck2 size={23} /><div><strong>What Five Star will approve before launch</strong><p>Course and location availability, claims, testimonials, privacy language, response ownership, budget guardrails, and the first experiment. Meta access is not needed for this discovery presentation.</p></div></aside>
      </section>

      <section className="client-section client-evidence" aria-labelledby="evidence-title">
        <div><p>Built on evidence, not guesswork</p><h2 id="evidence-title">Every agent recommendation is tied to an approved source and a named owner.</h2></div>
        <div className="evidence-links"><a href="https://fivestartraining.edu.au/courses/certificate-ii-in-security-operations/" rel="noreferrer" target="_blank">Public course context <ArrowRight size={15} /></a><a href="https://www.facebook.com/business/ads/ad-objectives/lead-generation/lead-ads-with-forms" rel="noreferrer" target="_blank">Meta lead-quality guidance <ArrowRight size={15} /></a><a href="https://www.qld.gov.au/community/fair-trading/regulated-industries-licensing-and-legislation/security-industry-regulation/working-as-an-unarmed-security-officer/apply" rel="noreferrer" target="_blank">Queensland licence guidance <ArrowRight size={15} /></a></div>
      </section>

      <section className="client-next" aria-labelledby="next-title">
        <div><p>Next decision</p><h2 id="next-title">Approve a short discovery and measurement setup.</h2><span>Then the agent can produce the first evidence-led campaign and qualification test for human review.</span></div>
        <a className="client-primary" href="#onboarding">Review onboarding <ArrowRight size={17} /></a>
      </section>
    </main>
  );
}
