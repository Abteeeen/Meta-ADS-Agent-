"use client";

import {
  ArrowUpRight,
  BarChart3,
  Bell,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  CircleAlert,
  ClipboardCheck,
  FileSearch,
  MoreHorizontal,
  Play,
  ShieldCheck,
  Sparkles,
  Target,
  UsersRound,
} from "lucide-react";
import { useState } from "react";

const steps = [
  { id: "brief", label: "Business brief", detail: "Core offer and conversion goal", state: "complete" },
  { id: "strategy", label: "Strategy brief", detail: "Evidence-led recommendation", state: "ready" },
  { id: "qa", label: "Launch QA", detail: "Tracking, creative, policy", state: "blocked" },
  { id: "learn", label: "Learning loop", detail: "Baseline and experiment", state: "pending" },
];

const nav = [
  { label: "Workspace", icon: Target, active: true },
  { label: "Strategy", icon: FileSearch },
  { label: "Launch QA", icon: ClipboardCheck },
  { label: "Performance", icon: BarChart3 },
  { label: "Knowledge", icon: BookOpen },
];

export function AgencyWorkspace() {
  const [activeStep, setActiveStep] = useState("strategy");
  const [notice, setNotice] = useState("Strategy brief is ready for review.");

  function selectStep(id: string) {
    setActiveStep(id);
    const step = steps.find((item) => item.id === id);
    if (step) setNotice(`${step.label} selected.`);
  }

  return (
    <main className="app-shell">
      <aside className="sidebar" aria-label="Primary navigation">
        <div className="brand-mark" aria-label="Meta Ads Agent">
          <ShieldCheck size={22} strokeWidth={2.3} />
          <span>Meta Ads Agent</span>
        </div>
        <nav className="nav-list">
          {nav.map((item) => {
            const Icon = item.icon;
            return (
              <button className={`nav-item ${item.active ? "is-active" : ""}`} key={item.label} type="button">
                <Icon size={18} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
        <div className="sidebar-footer">
          <div className="operator-avatar">AK</div>
          <div>
            <strong>Operator</strong>
            <span>Single workspace</span>
          </div>
          <button aria-label="Open account menu" className="icon-button" title="Account menu" type="button">
            <MoreHorizontal size={18} />
          </button>
        </div>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div className="breadcrumb">
            <span>Workspaces</span>
            <ChevronRight size={15} />
            <strong>Security Course Agency</strong>
          </div>
          <div className="topbar-actions">
            <span className="demo-badge">Demo workspace</span>
            <button aria-label="View notifications" className="icon-button" title="Notifications" type="button">
              <Bell size={18} />
            </button>
          </div>
        </header>

        <div className="workspace-body">
          <section className="workspace-heading" aria-labelledby="workspace-title">
            <div>
              <p className="eyebrow">Lead generation / Security education</p>
              <h1 id="workspace-title">Security Course Agency</h1>
              <p className="subhead">Qualified enrollment leads for a professional security training program.</p>
            </div>
            {/* Remote demo imagery is intentionally not sent through an image-optimization service. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt="Professional working at a laptop in a technical training setting"
              className="heading-image"
              src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=720&q=80"
            />
          </section>

          <section className="signal-strip" aria-label="Workspace status">
            <div>
              <span>Primary conversion</span>
              <strong>Qualified enrollment lead</strong>
            </div>
            <div>
              <span>Tracking</span>
              <strong className="good">Verified</strong>
            </div>
            <div>
              <span>Current release</span>
              <strong className="warning">Launch QA blocked</strong>
            </div>
            <button className="command-button" onClick={() => setNotice("Launch QA review opened.")} type="button">
              <Play size={16} fill="currentColor" />
              Run launch QA
            </button>
          </section>

          <p className="notice" role="status">{notice}</p>

          <section className="content-grid">
            <div className="workflow-column">
              <div className="section-title">
                <div>
                  <p className="eyebrow">Main workflow</p>
                  <h2>Operating sequence</h2>
                </div>
                <span className="count-label">2 of 4 ready</span>
              </div>
              <div className="workflow-list">
                {steps.map((step, index) => (
                  <button
                    className={`workflow-step ${step.state} ${activeStep === step.id ? "selected" : ""}`}
                    key={step.id}
                    onClick={() => selectStep(step.id)}
                    type="button"
                  >
                    <span className="step-index">0{index + 1}</span>
                    <span className="step-copy">
                      <strong>{step.label}</strong>
                      <small>{step.detail}</small>
                    </span>
                    {step.state === "complete" && <CheckCircle2 size={19} />}
                    {step.state === "blocked" && <CircleAlert size={19} />}
                    {step.state === "ready" && <ArrowUpRight size={19} />}
                    {step.state === "pending" && <span className="pending-dot" />}
                  </button>
                ))}
              </div>
            </div>

            <div className="insight-column">
              <section className="insight-panel strategy-panel">
                <div className="panel-heading">
                  <div className="icon-tile mint"><Sparkles size={19} /></div>
                  <div>
                    <p className="eyebrow">Strategy brief</p>
                    <h2>Ready for review</h2>
                  </div>
                </div>
                <p>Focus the first campaign on one priority learner segment and a clear security-career outcome.</p>
                <div className="evidence-line">
                  <BookOpen size={15} />
                  <span>3 reviewed course-guidance claims cited</span>
                </div>
                <button className="text-command" onClick={() => setNotice("Strategy brief opened for review.")} type="button">
                  Review strategy <ArrowUpRight size={15} />
                </button>
              </section>

              <section className="insight-panel blocker-panel">
                <div className="panel-heading">
                  <div className="icon-tile coral"><CircleAlert size={19} /></div>
                  <div>
                    <p className="eyebrow">Launch blocker</p>
                    <h2>Creative approval missing</h2>
                  </div>
                </div>
                <p>Approved final creative is required before a human can approve a campaign for publishing.</p>
                <button className="text-command" onClick={() => setNotice("Creative approval is the current launch blocker.")} type="button">
                  View QA details <ArrowUpRight size={15} />
                </button>
              </section>
            </div>
          </section>

          <section className="decision-band">
            <div>
              <p className="eyebrow">Next decision</p>
              <h2>Approve the security-course creative direction</h2>
              <p>Keep targeting and budget unchanged until the creative review is complete.</p>
            </div>
            <div className="decision-meta">
              <UsersRound size={20} />
              <span>Human approval required</span>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
