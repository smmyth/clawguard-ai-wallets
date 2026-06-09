import { ExternalLink } from "lucide-react";
import { Verdict, contractAddresses, makeTimeline, sampleTxs } from "../lib/demoData";
import { addressUrl, txUrl } from "../lib/contracts";

type Props = {
  status: Verdict;
  requestTx?: string;
  auditTx?: string;
  useSampleTxs?: boolean;
};

export function RunTimeline({ status, requestTx, auditTx, useSampleTxs = false }: Props) {
  const timeline = makeTimeline(status);
  const done = status === "allowed" || status === "warning" || status === "blocked";
  const useReplayFallback = useSampleTxs && done;
  const requestHash = requestTx ?? (useReplayFallback ? sampleTxs.request : undefined);
  const auditHash = auditTx ?? (useReplayFallback ? sampleTxs.audit : undefined);

  return (
    <section className="panel timeline-panel" aria-labelledby="timeline-title">
      <div className="panel-heading">
        <div>
          <p className="section-label">Mantle receipt</p>
          <h2 id="timeline-title">Trust timeline</h2>
        </div>
        <span className="status-chip">Sepolia 5003</span>
      </div>

      <div className="timeline">
        {timeline.map((step) => (
          <div className={`timeline-step ${step.status}`} key={step.label}>
            <span className="timeline-dot" />
            <div>
              <strong>{step.label}</strong>
              <p>{step.description}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="link-grid">
        <ExplorerLink label="Ledger contract" href={addressUrl(contractAddresses.ledger)} empty="Configure ledger address" />
        <ExplorerLink label="Request tx" href={txUrl(requestHash)} empty="Run request pending" />
        <ExplorerLink label="Audit tx" href={txUrl(auditHash)} empty="Audit tx pending" />
      </div>
    </section>
  );
}

function ExplorerLink({ label, href, empty }: { label: string; href: string; empty: string }) {
  if (!href) {
    return (
      <div className="explorer-link disabled">
        <span>{label}</span>
        <strong>{empty}</strong>
      </div>
    );
  }

  return (
    <a className="explorer-link" href={href} target="_blank" rel="noreferrer">
      <span>{label}</span>
      <strong>
        Open proof
        <ExternalLink size={14} />
      </strong>
    </a>
  );
}
