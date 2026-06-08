import { describe, expect, it } from "vitest";
import { deterministicAudit, verdictToContractValue } from "./audit.js";
import { ProofSchema, type AgentPolicy, type ToolInventory } from "./types.js";

const basePolicy: AgentPolicy = {
  agentId: "1",
  agentName: "Personal CFO Agent",
  maxRisk: 40,
  allowShell: false,
  allowNetwork: true,
  allowedProtocols: ["Mantle native staking"],
  blockedActions: ["shell execution"],
  maxSlippageBps: 50,
  requiresHumanApprovalAboveRisk: 30
};

const baseInventory: ToolInventory = {
  source: "demo",
  network: true,
  shell: false,
  filesystem: false,
  declaredCapabilities: ["portfolio_read"],
  observedCapabilities: ["portfolio_read"],
  capabilityNotes: ["Network access is declared."]
};

describe("deterministicAudit", () => {
  it("allows low-risk declared capabilities", () => {
    const result = deterministicAudit({
      agentId: "1",
      runId: "1",
      instruction: "Find a low-risk earning action under my policy.",
      policy: basePolicy,
      toolInventory: baseInventory
    });

    expect(result.verdict).toBe("Allowed");
    expect(result.riskScore).toBeLessThanOrEqual(basePolicy.maxRisk);
    expect(ProofSchema.parse(result.proof).verdict).toBe("Allowed");
    expect(verdictToContractValue(result.verdict)).toBe(1);
  });

  it("blocks forbidden shell capability", () => {
    const result = deterministicAudit({
      agentId: "1",
      runId: "2",
      instruction: "Find a low-risk earning action under my policy.",
      policy: basePolicy,
      toolInventory: { ...baseInventory, shell: true }
    });

    expect(result.verdict).toBe("Blocked");
    expect(result.rationale).toContain("Shell execution");
    expect(verdictToContractValue(result.verdict)).toBe(3);
  });

  it("warns when risk exceeds policy without severe blockers", () => {
    const result = deterministicAudit({
      agentId: "1",
      runId: "3",
      instruction: "Use high slippage if needed.",
      policy: { ...basePolicy, maxRisk: 20 },
      toolInventory: baseInventory
    });

    expect(result.verdict).toBe("Warning");
    expect(verdictToContractValue(result.verdict)).toBe(2);
  });
});
