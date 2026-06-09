import { ShieldCheck, AlertTriangle, Ban } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { AiTraceStep } from "../components/AiTracePanel";

export type Verdict = "idle" | "requesting" | "auditing" | "allowed" | "warning" | "blocked" | "error";

export type ReceiptStep = {
  label: string;
  description: string;
  status: "waiting" | "active" | "done" | "error";
};

export type AgentPolicy = {
  maxRisk: number;
  allowShell: boolean;
  allowNetwork: boolean;
  allowedProtocols: string[];
  blockedActions: string[];
  maxSlippageBps: number;
};

export const explorerBaseUrl = import.meta.env.VITE_EXPLORER_BASE_URL ?? "https://explorer.sepolia.mantle.xyz";

export const contractAddresses = {
  registry: import.meta.env.VITE_AGENT_REGISTRY_ADDRESS ?? "",
  ledger: import.meta.env.VITE_AGENT_RUN_LEDGER_ADDRESS ?? ""
};

export const demoPolicy: AgentPolicy = {
  maxRisk: 40,
  allowShell: false,
  allowNetwork: true,
  allowedProtocols: ["Mantle native staking", "mETH low-risk routing", "USDY observation only"],
  blockedActions: ["Unknown contracts", "High slippage swaps", "Shell execution", "Unbounded leverage"],
  maxSlippageBps: 50
};

export const demoInstruction = "Find a low-risk earning action under my policy.";

export type ReplayAuditProof = {
  verdict: "Allowed" | "Warning" | "Blocked";
  riskScore: number;
  engine: "deterministic-policy-engine";
  model: null;
  fallbackUsed: true;
  trace: AiTraceStep[];
};

export function makeReplayAuditProof(instruction: string): ReplayAuditProof {
  const shellRequested = /shell/i.test(instruction);
  const highRiskInstruction = /leverage|unknown contract|high slippage|all funds/i.test(instruction);
  let riskScore = 24;

  if (shellRequested) {
    riskScore += 60;
  }

  if (highRiskInstruction) {
    riskScore += 34;
  }

  riskScore = Math.min(100, riskScore);

  let verdict: ReplayAuditProof["verdict"] = "Allowed";
  if (riskScore > demoPolicy.maxRisk) {
    verdict = shellRequested || riskScore >= 60 ? "Blocked" : "Warning";
  }

  const instructionStatus: AiTraceStep["status"] = highRiskInstruction
    ? verdict === "Blocked" || shellRequested
      ? "fail"
      : "warn"
    : "pass";

  return {
    verdict,
    riskScore,
    engine: "deterministic-policy-engine",
    model: null,
    fallbackUsed: true,
    trace: [
      {
        label: "Instruction risk",
        status: instructionStatus,
        detail: highRiskInstruction
          ? "Instruction matched high-risk wallet action terms."
          : "Instruction did not match high-risk wallet action terms."
      },
      {
        label: "Policy bounds",
        status: riskScore > demoPolicy.maxRisk ? (verdict === "Blocked" ? "fail" : "warn") : "pass",
        detail:
          riskScore > demoPolicy.maxRisk
            ? `Risk score ${riskScore} exceeds max policy risk ${demoPolicy.maxRisk}.`
            : `Risk score ${riskScore} is within max policy risk ${demoPolicy.maxRisk}.`
      },
      {
        label: "Tool inventory",
        status: shellRequested ? "fail" : "pass",
        detail: shellRequested
          ? "Shell execution is requested while policy forbids shell actions."
          : "Declared tools stay inside policy capability bounds."
      },
      {
        label: "Verdict mapping",
        status: verdict === "Blocked" ? "fail" : verdict === "Warning" ? "warn" : "pass",
        detail: `Deterministic policy mapping produced ${verdict}.`
      }
    ]
  };
}

export const replayAuditProof = makeReplayAuditProof(demoInstruction);

export const replayAuditProofJson = {
  agentId: "1",
  runId: "1",
  instruction: demoInstruction,
  policy: {
    maxRisk: demoPolicy.maxRisk,
    allowShell: demoPolicy.allowShell,
    allowNetwork: demoPolicy.allowNetwork
  },
  toolInventory: {
    network: true,
    shell: false,
    filesystem: false
  },
  verdict: replayAuditProof.verdict,
  riskScore: replayAuditProof.riskScore,
  rationale: "Action stays inside policy and uses declared capabilities.",
  engine: "deterministic-policy-engine" as const,
  model: null,
  fallbackUsed: true,
  trace: replayAuditProof.trace,
  timestamp: "2026-06-08T00:00:00.000Z"
};

export const sampleTxs = {
  request: "0x856a67915f7457e9d822b9338ee6f8ea8d64838a43813d81c100ac68f044e83f",
  audit: "0x10a4bf4c55f578b254c0b1fd8b0a906cd42937cfd3f6ddd5ec179304af57adbf"
};

export const verdictCopy: Record<Exclude<Verdict, "idle" | "requesting" | "auditing">, {
  label: string;
  summary: string;
  detail: string;
  riskScore: number;
  icon: LucideIcon;
}> = {
  allowed: {
    label: "Allowed",
    summary: "Policy-safe action",
    detail: "Action stays inside policy and uses declared capabilities.",
    riskScore: 24,
    icon: ShieldCheck
  },
  warning: {
    label: "Warning",
    summary: "Human review recommended",
    detail: "Risk exceeds the preferred threshold, but no severe blocker was detected.",
    riskScore: 48,
    icon: AlertTriangle
  },
  blocked: {
    label: "Blocked",
    summary: "Policy violation",
    detail: "Shell execution or high-risk wallet behavior violates the active policy.",
    riskScore: 82,
    icon: Ban
  },
  error: {
    label: "Error",
    summary: "Run failed",
    detail: "The trust check could not complete. Replay mode remains available.",
    riskScore: 0,
    icon: AlertTriangle
  }
};

export function makeTimeline(status: Verdict): ReceiptStep[] {
  if (status === "idle") {
    return [
      { label: "Request", description: "No run requested yet", status: "waiting" },
      { label: "Audit", description: "Waiting for AI policy check", status: "waiting" },
      { label: "Receipt", description: "No receipt written", status: "waiting" },
      { label: "Explorer", description: "No transaction available", status: "waiting" }
    ];
  }

  const done = status === "allowed" || status === "warning" || status === "blocked";
  return [
    { label: "Request", description: "RunRequested emitted on Mantle", status: "done" },
    { label: "Audit", description: done ? "Policy audit verdict recorded" : "Checking policy and capabilities", status: done ? "done" : "active" },
    { label: "Receipt", description: done ? "Receipt proof is ready" : "Receipt pending", status: done ? "done" : "waiting" },
    { label: "Explorer", description: done ? "Explorer links available" : "Awaiting audit transaction", status: done ? "done" : "waiting" }
  ];
}
