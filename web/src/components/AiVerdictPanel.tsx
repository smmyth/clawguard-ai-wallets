import { Activity, Gauge } from "lucide-react";
import type { CSSProperties } from "react";
import { Verdict, verdictCopy } from "../lib/demoData";

type Props = {
  status: Verdict;
  riskScore?: number;
};

export function AiVerdictPanel({ status, riskScore }: Props) {
  const visibleStatus = status === "idle" || status === "requesting" || status === "auditing" ? "allowed" : status;
  const copy = verdictCopy[visibleStatus];
  const Icon = copy.icon;
  const pending = status === "idle" || status === "requesting" || status === "auditing";
  const visibleRiskScore = pending ? 0 : (riskScore ?? copy.riskScore);

  return (
    <section className={`panel verdict-panel ${pending ? "pending" : visibleStatus}`} aria-labelledby="verdict-title">
      <div className="panel-heading">
        <div>
          <p className="section-label">Policy audit verdict</p>
          <h2 id="verdict-title">{pending ? "Waiting for trust check" : copy.label}</h2>
        </div>
        <div className="verdict-icon">
          {pending ? <Activity size={22} /> : <Icon size={22} />}
        </div>
      </div>

      <div className="risk-gauge" aria-label={`Risk score ${visibleRiskScore}`}>
        <div className="risk-ring" style={{ "--score": visibleRiskScore } as CSSProperties}>
          <span>{pending ? "--" : visibleRiskScore}</span>
        </div>
        <div>
          <div className="risk-label">
            <Gauge size={16} />
            Risk score
          </div>
          <p>{pending ? "Run the check to produce an auditable score." : copy.summary}</p>
        </div>
      </div>

      <p className="verdict-detail">
        {pending ? "The runner will compare the instruction, policy, and tool inventory before writing a receipt." : copy.detail}
      </p>
    </section>
  );
}
