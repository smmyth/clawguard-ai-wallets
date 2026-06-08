import { ShieldCheck, AlertTriangle, Ban } from "lucide-react";
import type { LucideIcon } from "lucide-react";

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

export const sampleTxs = {
  request: "0x1c0ea9e90c9910152b6815a3e9e79b82fef29cf939ea80a020c24fe30fe26118",
  audit: "0x8888ee04c7d527982390b5b6237c4ccf3dd6b1d26a28de28cf4b356291be35d4"
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
    { label: "Audit", description: done ? "AI verdict recorded" : "Checking policy and capabilities", status: done ? "done" : "active" },
    { label: "Receipt", description: done ? "Receipt proof is ready" : "Receipt pending", status: done ? "done" : "waiting" },
    { label: "Explorer", description: done ? "Explorer links available" : "Awaiting audit transaction", status: done ? "done" : "waiting" }
  ];
}
