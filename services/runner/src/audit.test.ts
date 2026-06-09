import { describe, expect, it, vi } from "vitest";
import { auditWithOptionalOpenAI, deterministicAudit, verdictToContractValue } from "./audit.js";
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
    expect(result.proof.engine).toBe("deterministic-policy-engine");
    expect(result.proof.model).toBeNull();
    expect(result.proof.fallbackUsed).toBe(true);
    expect(result.proof.trace.map((step) => step.label)).toEqual([
      "Instruction risk",
      "Policy bounds",
      "Tool inventory",
      "Verdict mapping"
    ]);
    expect(result.proof.trace.map((step) => step.status)).toEqual(["pass", "pass", "pass", "pass"]);
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
    expect(result.proof.trace.map((step) => step.status)).toEqual(["pass", "fail", "fail", "fail"]);
    expect(verdictToContractValue(result.verdict)).toBe(3);
  });

  it("blocks policy-forbidden shell instructions without requiring shell inventory exposure", () => {
    const result = deterministicAudit({
      agentId: "1",
      runId: "2b",
      instruction: "Use shell execution to prepare a low-risk earning action.",
      policy: basePolicy,
      toolInventory: baseInventory
    });

    expect(result.verdict).toBe("Blocked");
    expect(result.riskScore).toBeGreaterThan(basePolicy.maxRisk);
    expect(result.rationale).toContain("shell execution");
    expect(result.proof.trace.some((step) => step.status === "fail")).toBe(true);
    expect(
      result.proof.trace.some(
        (step) => step.status === "fail" && /shell|command/i.test(step.detail) && /policy/i.test(step.detail)
      )
    ).toBe(true);
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
    expect(result.proof.trace.map((step) => step.status)).toEqual(["warn", "warn", "pass", "warn"]);
    expect(verdictToContractValue(result.verdict)).toBe(2);
  });
});

describe("auditWithOptionalOpenAI", () => {
  it("rewrites rationale without changing verdict or risk", async () => {
    const originalApiKey = process.env.OPENAI_API_KEY;
    const originalModel = process.env.OPENAI_MODEL;
    const originalFetch = globalThis.fetch;

    process.env.OPENAI_API_KEY = "test-key";
    process.env.OPENAI_MODEL = "gpt-4.1-mini";
    globalThis.fetch = vi.fn(async () => {
      return {
        ok: true,
        json: async () => ({
          output_text: "OpenAI rewrite: deterministic policy check remains inside the allowed bounds."
        })
      } as Response;
    });

    try {
      const result = await auditWithOptionalOpenAI({
        agentId: "1",
        runId: "4",
        instruction: "Find a low-risk earning action under my policy.",
        policy: basePolicy,
        toolInventory: baseInventory
      });

      expect(result.verdict).toBe("Allowed");
      expect(result.riskScore).toBe(24);
      expect(result.rationale).toContain("OpenAI rewrite");
      expect(result.proof.engine).toBe("openai-responses");
      expect(result.proof.model).toBe("gpt-4.1-mini");
      expect(result.proof.fallbackUsed).toBe(false);
      expect(ProofSchema.parse(result.proof).riskScore).toBe(24);
    } finally {
      if (originalApiKey === undefined) {
        delete process.env.OPENAI_API_KEY;
      } else {
        process.env.OPENAI_API_KEY = originalApiKey;
      }

      if (originalModel === undefined) {
        delete process.env.OPENAI_MODEL;
      } else {
        process.env.OPENAI_MODEL = originalModel;
      }

      globalThis.fetch = originalFetch;
    }
  });
});
