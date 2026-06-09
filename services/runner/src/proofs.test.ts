import { mkdtemp, readFile, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { describe, expect, it } from "vitest";
import { buildActionPlan } from "./action.js";
import { writeProof } from "./proofs.js";
import type { AuditProof } from "./types.js";

const baseProof: AuditProof = {
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
  timestamp: "2026-06-08T00:00:00.000Z"
};

describe("writeProof", () => {
  it("keeps the audit proof stable when writing a final proof", async () => {
    const dir = await mkdtemp(join(tmpdir(), "clawguard-proof-"));

    try {
      const auditProof = await writeProof(baseProof, dir);
      const auditBodyBefore = await readFile(auditProof.absolutePath, "utf8");
      const finalProof = await writeProof(
        {
          ...baseProof,
          actionPlan: buildActionPlan({
            verdict: "Allowed",
            recipient: "0x1111111111111111111111111111111111111111",
            amountWei: "1000000000000000"
          })
        },
        { baseDir: dir, suffix: "final" }
      );

      expect(auditProof.filename).toBe("run-42-allowed.json");
      expect(finalProof.filename).toBe("run-42-allowed-final.json");
      expect(await readFile(auditProof.absolutePath, "utf8")).toBe(auditBodyBefore);
      expect(finalProof.absolutePath).not.toBe(auditProof.absolutePath);
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });
});
