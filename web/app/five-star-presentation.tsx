"use client";

import { ArrowRight, BadgeCheck, CalendarDays, CheckCircle2, CircleDollarSign, ClipboardCheck, MapPin, MessagesSquare, ShieldCheck, Target, UsersRound } from "lucide-react";
import { useState } from "react";

const phases = [
  {
    id: "baseline",
    period: "Days 1-7",
    title: "Make quality visible",
    detail: "Map the current enquiry path, course dates, eligibility checks, HubSpot stages, and response timing. No budget changes until the baseline is clear.",
  },
  {
    id: "pilot",
    period: "Days 8-30",
    title: "Run two clear routes",
    detail: "Launch separate Brisbane and Gold Coast enquiry routes. Each route has local course context, an eligibility-first form, and a defined phone/SMS follow-up hand-off.",
  },
  {
    id: "improve",
    period: "Days 31-90",
    title: "Invest behind proof",
    detail: "Compare paid-student outcomes, not just cheap form fills. Keep what produces eligible leads and run one controlled improvement at a time.",
  },
];

export function FiveStarPresentation() {
  const [activePhase, setActivePhase] = useState(phases[0].id);
  const phase = phases.find((item) => item.id === activePhase) ?? phases[0];

  return (
    <main className="proposal-shell">
      <section className="proposal-hero" id="opportunity">
        <nav className="proposal-nav" aria-label="Presentation navigation">
          <a className="proposal-brand" href="#opportunity"><ShieldCheck size={21} /> Meta Ads Agent</a>
          <div className="proposal-nav-links"><a href="#approach">Approach</a><a href="#measurement">Measurement</a><a href="#next-steps">First steps</a></div>
        </nav>
        <div className="proposal-hero-content">
          <p className="proposal-kicker">A practical growth system for</p>
          <h1>Five Star Training Academy</h1>
          <p className="proposal-lede">Turn security-course enquiries into measurable, eligibility-checked leads and paid students across Brisbane and the Gold Coast.</p>
          <div className="proposal-hero-metrics" aria-label="Growth plan focus">
            <div><BadgeCheck size={19} /><span>Primary offer</span><strong>CPP20218 Security Operations</strong></div>
            <div><MapPin size={19} /><span>First focus</span><strong>Brisbane + Gold Coast</strong></div>
            <div><CircleDollarSign size={19} /><span>Success measure</span><strong>Paid student</strong></div>
          </div>
          <a className="proposal-primary" href="#approach">See the operating plan <ArrowRight size={17} /></a>
        </div>
      </section>

      <section className="proposal-section proposal-evidence" aria-labelledby="starting-point">
        <div className="proposal-section-heading"><p>Starting point</p><h2 id="starting-point">Five Star already has the ingredients. The missing piece is a quality feedback loop.</h2></div>
        <div className="evidence-grid">
          <article><CalendarDays size={22} /><h3>Real course demand</h3><p>CPP20218 is offered through public course and date journeys, with Brisbane and Gold Coast as strong first campaign routes.</p></article>
          <article><MessagesSquare size={22} /><h3>Follow-up can be measured</h3><p>Phone and SMS follow-up within one day becomes a visible service level, not a hopeful assumption.</p></article>
          <article><UsersRound size={22} /><h3>Proof can do the selling</h3><p>Existing trainer stories, student testimonials, location content, and video can be approved and turned into structured creative tests.</p></article>
        </div>
      </section>

      <section className="proposal-section proposal-approach" id="approach" aria-labelledby="approach-title">
        <div className="proposal-section-heading"><p>Approach</p><h2 id="approach-title">Stop optimizing for a form fill. Optimize for the next student who can genuinely enrol.</h2></div>
        <div className="quality-flow" aria-label="Lead quality flow">
          <div><span>01</span><strong>Course enquiry</strong><small>Person asks about the course</small></div>
          <ArrowRight size={18} />
          <div><span>02</span><strong>Eligibility checked</strong><small>Relevant location and course fit confirmed</small></div>
          <ArrowRight size={18} />
          <div><span>03</span><strong>Contacted quickly</strong><small>Phone and SMS hand-off recorded</small></div>
          <ArrowRight size={18} />
          <div><span>04</span><strong>Paid student</strong><small>Commercial result feeds back to ads</small></div>
        </div>
        <p className="proposal-note">The agent does not decide a person’s licence or funding eligibility. It records the approved qualification outcome from Five Star’s team and learns from it.</p>
      </section>

      <section className="proposal-section proposal-plan" aria-labelledby="plan-title">
        <div className="proposal-section-heading"><p>90-day pilot</p><h2 id="plan-title">A controlled path from uncertainty to evidence.</h2></div>
        <div className="phase-layout">
          <div className="phase-tabs" role="tablist" aria-label="Pilot phases">
            {phases.map((item) => <button aria-selected={activePhase === item.id} className={activePhase === item.id ? "active" : ""} key={item.id} onClick={() => setActivePhase(item.id)} role="tab" type="button"><span>{item.period}</span>{item.title}</button>)}
          </div>
          <article className="phase-detail" role="tabpanel"><p>{phase.period}</p><h3>{phase.title}</h3><div className="phase-rule"><Target size={19} /> One decision at a time. One accountable result.</div><p>{phase.detail}</p></article>
        </div>
      </section>

      <section className="proposal-section proposal-measurement" id="measurement" aria-labelledby="measurement-title">
        <div className="proposal-section-heading"><p>Measurement</p><h2 id="measurement-title">The weekly view answers the questions that actually matter.</h2></div>
        <div className="measurement-grid">
          <div><ClipboardCheck size={21} /><strong>Lead quality</strong><span>Which source and creative produce eligibility-checked enquiries?</span></div>
          <div><MessagesSquare size={21} /><strong>Sales hand-off</strong><span>Are leads contacted within the agreed one-day response window?</span></div>
          <div><CircleDollarSign size={21} /><strong>Commercial outcome</strong><span>Which route produces enrolments and paid students at a sustainable cost?</span></div>
        </div>
      </section>

      <section className="proposal-section proposal-guardrail">
        <CheckCircle2 size={24} /><div><h2>Evidence, not promises.</h2><p>We will use current, approved course, funding, licence, employment, and testimonial language. We will not promise a licence, a job, funding eligibility, a seat, or a result that Five Star cannot verify.</p></div>
      </section>

      <section className="proposal-section proposal-next" id="next-steps" aria-labelledby="next-title">
        <div><p>First steps</p><h2 id="next-title">What we need to begin the pilot</h2></div>
        <ol>
          <li>Confirm Brisbane and Gold Coast intake dates, seats, and enrolment cut-offs.</li>
          <li>Approve the course, funding, licence, employment, and testimonial wording.</li>
          <li>Map HubSpot stages from enquiry to paid student.</li>
          <li>Connect Meta as read-only, then review the first launch plan with a human.</li>
        </ol>
      </section>
    </main>
  );
}
