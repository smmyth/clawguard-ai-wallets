import { readFile } from "node:fs/promises";
import path from "node:path";
import { ethers } from "ethers";
import { buildActionPlan } from "./action.js";
import { deterministicAudit } from "./audit.js";
import { AgentPolicy, PolicySchema, ProofSchema, ToolInventory, ToolInventorySchema, VerdictSchema } from "./types.js";
import { z } from "zod";

const BenchmarkCaseSchema = z.object({
  name: z.string(),
  instruction: z.string(),
  expectedVerdict: VerdictSchema,
  expectedRiskScore: z.number().int().min(0).max(100)
});

const BenchmarkSchema = z.array(BenchmarkCaseSchema).min(1);

async function main() {
  const policy = await loadPolicy();
  const toolInventory = await loadToolInventory();
  const benchmark = BenchmarkSchema.parse(
    JSON.parse(await readFile(path.resolve("fixtures/devtool-benchmark.json"), "utf8"))
  );
  const proofPath = path.resolve("../../web/public/proofs/generated/run-1-allowed-v2-final.json");
  const proofContent = await readFile(proofPath, "utf8");
  const proof = ProofSchema.parse(JSON.parse(proofContent));
  const proofHash = ethers.keccak256(ethers.toUtf8Bytes(proofContent));

  const rows = benchmark.map((item) => {
    const result = deterministicAudit({
      agentId: policy.agentId,
      runId: "benchmark",
      instruction: item.instruction,
      policy,
      toolInventory
    });

    const ok = result.verdict === item.expectedVerdict && result.riskScore === item.expectedRiskScore;
    if (!ok) {
      throw new Error(
        `Benchmark ${item.name} expected ${item.expectedVerdict}/${item.expectedRiskScore}, got ${result.verdict}/${result.riskScore}.`
      );
    }

    return {
      case: item.name,
      verdict: result.verdict,
      riskScore: result.riskScore,
      trace: result.proof.trace.map((step) => `${step.label}:${step.status}`).join(", ")
    };
  });

  if (!proof.actionPlan) {
    throw new Error("Final proof is missing actionPlan.");
  }

  const recomputedActionPlan = buildActionPlan({
    verdict: proof.verdict,
    recipient: proof.actionPlan.recipient,
    amountWei: proof.actionPlan.amountWei
  });

  if (recomputedActionPlan.actionHash !== proof.actionPlan.actionHash) {
    throw new Error("Final proof actionHash does not match recipient and amount.");
  }

  console.log(JSON.stringify({
    benchmarkRows: rows,
    publicProof: {
      file: proofPath,
      hash: proofHash,
      engine: proof.engine,
      model: proof.model,
      fallbackUsed: proof.fallbackUsed,
      verdict: proof.verdict,
      riskScore: proof.riskScore,
      actionHash: proof.actionPlan.actionHash
    }
  }, null, 2));
}

async function loadPolicy(): Promise<AgentPolicy> {
  return PolicySchema.parse(JSON.parse(await readFile(path.resolve("fixtures/sample-agent-policy.json"), "utf8")));
}

async function loadToolInventory(): Promise<ToolInventory> {
  return ToolInventorySchema.parse(JSON.parse(await readFile(path.resolve("fixtures/sample-tool-inventory.json"), "utf8")));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
