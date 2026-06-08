import { useMemo, useState } from "react";
import { Bot, CircleAlert, CirclePlay, RadioTower, ReceiptText, RotateCcw, ShieldCheck, WalletCards } from "lucide-react";
import { AgentPolicyCard } from "./components/AgentPolicyCard";
import { AiVerdictPanel } from "./components/AiVerdictPanel";
import { RunTimeline } from "./components/RunTimeline";
import { Verdict, contractAddresses, demoInstruction, explorerBaseUrl, sampleTxs } from "./lib/demoData";
import { requestRunOnChain } from "./lib/contracts";

type Mode = "replay" | "wallet";

export default function App() {
  const [mode, setMode] = useState<Mode>("replay");
  const [instruction, setInstruction] = useState(demoInstruction);
  const [status, setStatus] = useState<Verdict>("idle");
  const [requestTx, setRequestTx] = useState<string | undefined>();
  const [auditTx, setAuditTx] = useState<string | undefined>();
  const [error, setError] = useState<string | undefined>();

  const canUseWallet = Boolean(contractAddresses.ledger);
  const assetBase = import.meta.env.BASE_URL;

  const statusLabel = useMemo(() => {
    if (status === "idle") return "Ready";
    if (status === "requesting") return "Requesting";
    if (status === "auditing") return "Auditing";
    if (status === "allowed") return "Allowed";
    if (status === "warning") return "Warning";
    if (status === "blocked") return "Blocked";
    return "Error";
  }, [status]);

  async function runTrustCheck() {
    setError(undefined);
    setRequestTx(undefined);
    setAuditTx(undefined);
    setStatus("requesting");

    if (mode === "wallet" && canUseWallet) {
      try {
        const receipt = await requestRunOnChain(instruction);
        setRequestTx(receipt?.hash);
        setStatus("auditing");
        window.setTimeout(() => {
          setStatus("allowed");
        }, 180);
      } catch (runError) {
        setStatus("error");
        setError(runError instanceof Error ? runError.message : "Wallet request failed.");
      }
      return;
    }

    window.setTimeout(() => {
      setStatus("auditing");
      window.setTimeout(() => {
        setRequestTx(sampleTxs.request);
        setAuditTx(sampleTxs.audit);
        setStatus(instruction.toLowerCase().includes("shell") ? "blocked" : "allowed");
      }, 180);
    }, 120);
  }

  function resetRun() {
    setStatus("idle");
    setRequestTx(undefined);
    setAuditTx(undefined);
    setError(undefined);
  }

  return (
    <main className="app-shell">
      <aside className="sidebar" aria-label="ClawGuard navigation">
        <div className="brand-mark">
          <ShieldCheck size={23} />
          <span>ClawGuard</span>
        </div>
        <nav className="side-nav">
          <button className="nav-button active" aria-label="Trust check">
            <WalletCards size={20} />
          </button>
          <button className="nav-button" aria-label="Receipts">
            <ReceiptText size={20} />
          </button>
          <button className="nav-button" aria-label="Agent network">
            <RadioTower size={20} />
          </button>
        </nav>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div>
            <p className="section-label">AI wallet trust receipt</p>
            <h1>Personal CFO Agent</h1>
          </div>
          <div className="topbar-actions">
            <div className="network-pill">Mantle Sepolia</div>
            <div className={`run-status ${status}`}>{statusLabel}</div>
          </div>
        </header>

        <section className="visual-band" aria-label="ClawGuard receipt concept">
          <img
            src={`${assetBase}clawguard-concept.png`}
            alt="ClawGuard dashboard concept showing policy, instruction, AI verdict, and Mantle receipt timeline"
          />
        </section>

        <div className="hero-grid">
          <AgentPolicyCard />

          <section className="panel composer-panel" aria-labelledby="composer-title">
            <div className="panel-heading">
              <div>
                <p className="section-label">Instruction</p>
                <h2 id="composer-title">Run trust check</h2>
              </div>
              <Bot size={22} />
            </div>

            <label className="instruction-label" htmlFor="instruction">
              Agent instruction
            </label>
            <textarea
              id="instruction"
              value={instruction}
              onChange={(event) => setInstruction(event.target.value)}
              rows={5}
            />

            <div className="mode-switch" role="group" aria-label="Run mode">
              <button className={mode === "replay" ? "selected" : ""} onClick={() => setMode("replay")} type="button">
                Replay mode
              </button>
              <button className={mode === "wallet" ? "selected" : ""} onClick={() => setMode("wallet")} type="button">
                Wallet mode
              </button>
            </div>

            <div className="composer-actions">
              <button className="primary-button" onClick={runTrustCheck} type="button">
                <CirclePlay size={18} />
                Run trust check
              </button>
              <button className="icon-button" onClick={resetRun} type="button" aria-label="Reset run">
                <RotateCcw size={18} />
              </button>
            </div>

            <p className="mode-note">
              {mode === "replay"
                ? "Replay mode is public-demo safe. It shows the exact receipt flow without requiring a wallet."
                : canUseWallet
                  ? "Wallet mode will call requestRun on the configured AgentRunLedger."
                  : "Wallet mode needs VITE_AGENT_RUN_LEDGER_ADDRESS before it can submit on-chain."}
            </p>

            {error && (
              <div className="error-box" role="alert">
                <CircleAlert size={16} />
                {error}
              </div>
            )}
          </section>

          <AiVerdictPanel status={status} />
        </div>

        <RunTimeline status={status} requestTx={requestTx} auditTx={auditTx} />

        <section className="receipt-strip" aria-label="Submission readiness">
          <div>
            <strong>Explorer base</strong>
            <span>{explorerBaseUrl}</span>
          </div>
          <div>
            <strong>Registry</strong>
            <span>{contractAddresses.registry || "pending deployment"}</span>
          </div>
          <div>
            <strong>Ledger</strong>
            <span>{contractAddresses.ledger || "pending deployment"}</span>
          </div>
          <div>
            <strong>Replay proof</strong>
            <a href={`${assetBase}proofs/sample-run-allowed.json`} target="_blank" rel="noreferrer">
              sample-run-allowed.json
            </a>
          </div>
        </section>
      </section>
    </main>
  );
}
