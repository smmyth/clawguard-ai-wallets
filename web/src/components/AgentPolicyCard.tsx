import { Check, LockKeyhole, Network, Shield, SlidersHorizontal, X } from "lucide-react";
import { demoPolicy } from "../lib/demoData";

export function AgentPolicyCard() {
  return (
    <section className="panel policy-panel" aria-labelledby="policy-title">
      <div className="panel-heading">
        <div>
          <p className="section-label">Active policy</p>
          <h2 id="policy-title">Personal CFO guardrails</h2>
        </div>
        <div className="status-chip success">
          <Shield size={15} />
          Verified
        </div>
      </div>

      <div className="policy-grid">
        <PolicyMetric icon={SlidersHorizontal} label="Max risk" value={`${demoPolicy.maxRisk}/100`} tone="neutral" />
        <PolicyMetric icon={Network} label="Network" value={demoPolicy.allowNetwork ? "Allowed" : "Blocked"} tone="success" />
        <PolicyMetric icon={LockKeyhole} label="Shell" value={demoPolicy.allowShell ? "Allowed" : "Blocked" } tone="danger" />
      </div>

      <div className="policy-list">
        <h3>Allowed routes</h3>
        {demoPolicy.allowedProtocols.map((item) => (
          <div className="policy-row" key={item}>
            <Check size={16} />
            <span>{item}</span>
          </div>
        ))}
      </div>

      <div className="policy-list blocked">
        <h3>Blocked actions</h3>
        {demoPolicy.blockedActions.map((item) => (
          <div className="policy-row" key={item}>
            <X size={16} />
            <span>{item}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function PolicyMetric({
  icon: Icon,
  label,
  value,
  tone
}: {
  icon: typeof Shield;
  label: string;
  value: string;
  tone: "neutral" | "success" | "danger";
}) {
  return (
    <div className={`policy-metric ${tone}`}>
      <Icon size={18} />
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
