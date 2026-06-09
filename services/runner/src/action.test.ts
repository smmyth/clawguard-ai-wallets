import { ethers } from "ethers";
import { describe, expect, it } from "vitest";
import { buildActionPlan } from "./action.js";
import { ProofSchema } from "./types.js";

const recipient = "0x1111111111111111111111111111111111111111";
const amountWei = "1000000000000000";

function expectedActionHash(address: string, amount: string) {
  return ethers.keccak256(ethers.AbiCoder.defaultAbiCoder().encode(["address", "uint256"], [address, amount]));
}

describe("buildActionPlan", () => {
  it("finalizes allowed audit results with an ABI-encoded action hash", () => {
    const plan = buildActionPlan({
      verdict: "Allowed",
      recipient,
      amountWei
    });

    expect(plan).toEqual({
      status: "Finalized",
      statusValue: 2,
      recipient: ethers.getAddress(recipient),
      amountWei,
      actionHash: expectedActionHash(recipient, amountWei)
    });
  });

  it("cancels non-allowed audit results while preserving the action hash", () => {
    const warningPlan = buildActionPlan({
      verdict: "Warning",
      recipient,
      amountWei
    });
    const blockedPlan = buildActionPlan({
      verdict: "Blocked",
      recipient,
      amountWei
    });

    expect(warningPlan.status).toBe("Cancelled");
    expect(warningPlan.statusValue).toBe(3);
    expect(warningPlan.actionHash).toBe(expectedActionHash(recipient, amountWei));
    expect(blockedPlan.status).toBe("Cancelled");
    expect(blockedPlan.statusValue).toBe(3);
    expect(blockedPlan.actionHash).toBe(expectedActionHash(recipient, amountWei));
  });

  it("rejects invalid recipients", () => {
    expect(() =>
      buildActionPlan({
        verdict: "Allowed",
        recipient: "not-an-address",
        amountWei
      })
    ).toThrow("valid address");
  });

  it("rejects non-positive or non-integer amounts", () => {
    expect(() =>
      buildActionPlan({
        verdict: "Allowed",
        recipient,
        amountWei: "0"
      })
    ).toThrow("positive");

    expect(() =>
      buildActionPlan({
        verdict: "Allowed",
        recipient,
        amountWei: "1.5"
      })
    ).toThrow("integer");
  });
});

describe("ProofSchema actionPlan", () => {
  it("preserves an optional action plan on final proofs", () => {
    const actionPlan = buildActionPlan({
      verdict: "Allowed",
      recipient,
      amountWei
    });

    const parsed = ProofSchema.parse({
      agentId: "1",
      runId: "42",
      instruction: "Find a low-risk earning action under my policy.",
      policy: {
        maxRisk: 40,
        allowShell: false,
        allowNetwork: true
      },
      toolInventory: {
        network: true,
        shell: false,
        filesystem: false
      },
      verdict: "Allowed",
      riskScore: 24,
      rationale: "Action stays inside policy and uses declared capabilities.",
      engine: "deterministic-policy-engine",
      model: null,
      fallbackUsed: true,
      trace: [
        {
          label: "Verdict mapping",
          status: "pass",
          detail: "Deterministic policy mapping produced Allowed."
        }
      ],
      timestamp: "2026-06-08T00:00:00.000Z",
      actionPlan
    });

    expect(parsed.actionPlan).toEqual(actionPlan);
  });
});
