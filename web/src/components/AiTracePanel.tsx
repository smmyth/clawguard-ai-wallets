import { AlertTriangle, Ban, CheckCircle2, Cpu } from "lucide-react";

export type AiTraceStep = { label: string; status: "pass" | "warn" | "fail"; detail: string };

type Props = {
  engine: "deterministic-policy-engine" | "openai-responses";
  model: string | null;
  fallbackUsed: boolean;
  trace: AiTraceStep[];
};

export function AiTracePanel({ engine, model, fallbackUsed, trace }: Props) {
  return (
    <section className="panel ai-trace-panel" aria-labelledby="trace-title">
      <div className="panel-heading">
        <div>
          <p className="section-label">Audit trace</p>
          <h2 id="trace-title">{fallbackUsed ? "Deterministic guardrail audit" : "Model-backed audit"}</h2>
        </div>
        <Cpu size={22} />
      </div>

      <div className="engine-row">
        <div>
          <span>Engine</span>
          <strong>{engine}</strong>
        </div>
        <div>
          <span>Model status</span>
          <strong>{model ?? "Model-backed upgrade available"}</strong>
        </div>
      </div>

      <ol className="trace-list">
        {trace.map((step) => {
          const Icon = step.status === "fail" ? Ban : step.status === "warn" ? AlertTriangle : CheckCircle2;

          return (
            <li className={`trace-step ${step.status}`} key={step.label}>
              <Icon size={18} />
              <div>
                <strong>{step.label}</strong>
                <p>{step.detail}</p>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
