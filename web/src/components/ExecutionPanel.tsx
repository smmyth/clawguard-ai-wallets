import { ExternalLink, LockKeyhole, WalletCards } from "lucide-react";
import { agentExecutionConfig } from "../lib/demoData";
import { addressUrl, executionExplorerUrl, txUrl } from "../lib/contracts";

export function ExecutionPanel() {
  const { walletAddress, actionHash, executionTx } = agentExecutionConfig;
  const walletHref = addressUrl(walletAddress);
  const executionHref = txUrl(executionTx);
  const explorerHref = executionExplorerUrl({ walletAddress, executionTx });
  const readiness = !walletAddress
    ? "Not deployed"
    : executionTx
      ? "Execution recorded"
      : "Waiting for finalized receipt";

  return (
    <section className="panel execution-panel" aria-labelledby="execution-title">
      <div className="panel-heading">
        <div>
          <p className="section-label">Gated execution</p>
          <h2 id="execution-title">AgentWallet</h2>
        </div>
        <div className={`status-chip ${executionTx ? "success" : ""}`}>
          <LockKeyhole size={15} />
          {readiness}
        </div>
      </div>

      <div className="execution-grid">
        <ExecutionFact label="AgentWallet address" value={walletAddress || "Not deployed"} href={walletHref} />
        <ExecutionFact label="Planned action hash" value={actionHash || "Waiting for finalized receipt"} />
        <ExecutionFact label="Execution tx" value={executionTx || "Waiting for finalized receipt"} href={executionHref} />
        <ExecutionFact
          label="Explorer link"
          value={explorerHref ? (executionTx ? "Open execution tx" : "Open AgentWallet") : "Not deployed"}
          href={explorerHref}
        />
      </div>

      <p className="mode-note">
        Live execution evidence from Mantle Sepolia. The browser replay links to the recorded AgentWallet action; new
        wallet submissions can create fresh run requests when a visitor connects a wallet.
      </p>
    </section>
  );
}

function ExecutionFact({ label, value, href }: { label: string; value: string; href?: string }) {
  const content = (
    <>
      <span>{label}</span>
      <strong>
        {value}
        {href && <ExternalLink size={14} />}
      </strong>
    </>
  );

  if (href) {
    return (
      <a className="execution-fact link" href={href} target="_blank" rel="noreferrer">
        {content}
      </a>
    );
  }

  return (
    <div className="execution-fact">
      <WalletCards size={16} />
      <div>{content}</div>
    </div>
  );
}
