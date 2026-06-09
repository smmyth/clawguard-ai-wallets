import { readFile } from "node:fs/promises";
import path from "node:path";
import { config as loadEnv } from "dotenv";
import { ethers } from "ethers";
import { buildActionPlan } from "./action.js";
import { auditWithOptionalOpenAI, deterministicAudit, verdictToContractValue } from "./audit.js";
import { createLedgerContract } from "./contract.js";
import { writeProof } from "./proofs.js";
import { AgentPolicy, PolicySchema, ToolInventory, ToolInventorySchema } from "./types.js";

loadEnv({ path: "../../.env" });
loadEnv();

const DEFAULT_INSTRUCTION = "Find a low-risk earning action under my policy.";

async function main() {
  const command = process.argv[2] ?? "demo";
  if (command === "demo") {
    await runDemo();
    return;
  }
  if (command === "watch") {
    await watchLedger();
    return;
  }
  throw new Error(`Unknown command "${command}". Use "demo" or "watch".`);
}

async function runDemo() {
  const policy = await loadPolicy();
  const toolInventory = await loadToolInventory();
  const result = deterministicAudit({
    agentId: policy.agentId,
    runId: "1",
    instruction: DEFAULT_INSTRUCTION,
    policy,
    toolInventory
  });
  const proofFile = await writeProof(result.proof);

  console.log(JSON.stringify({ ...result, proofFile }, null, 2));
}

async function watchLedger() {
  const contract = createLedgerContract();
  const policy = await loadPolicy();
  const toolInventory = await loadToolInventory();
  const provider = contract.runner?.provider;

  if (!provider) {
    throw new Error("Ledger contract runner does not expose a provider.");
  }

  let cursorBlock =
    process.env.RUNNER_FROM_BLOCK !== undefined
      ? Number(process.env.RUNNER_FROM_BLOCK)
      : (await provider.getBlockNumber()) + 1;
  const pollingMs = Number(process.env.RUNNER_POLLING_MS ?? "5000");

  console.log(`Watching AgentRunLedger from block ${cursorBlock} with getLogs polling...`);

  while (true) {
    const latestBlock = await provider.getBlockNumber();
    if (latestBlock >= cursorBlock) {
      const events = await contract.queryFilter(contract.filters.RunRequested(), cursorBlock, latestBlock);
      for (const event of events) {
        await processRunRequested(contract, event, policy, toolInventory);
      }
      cursorBlock = latestBlock + 1;
    }
    await sleep(pollingMs);
  }
}

async function processRunRequested(
  contract: ReturnType<typeof createLedgerContract>,
  event: ethers.EventLog | ethers.Log,
  policy: AgentPolicy,
  toolInventory: ToolInventory
) {
  const parsedEvent = "args" in event ? event : contract.interface.parseLog(event);
  if (!parsedEvent) {
    throw new Error(`Unable to parse RunRequested event at log index ${event.index}`);
  }

  const [runId, agentId, requester, , proofURI] = parsedEvent.args as unknown as [
    bigint,
    bigint,
    string,
    string,
    string
  ];

  try {
    const run = await contract.getRun(runId);
    if (Number(run.status) !== 0) {
      console.log(`Skipping runId=${runId}; current status=${run.status}`);
      return;
    }

    console.log(`RunRequested runId=${runId} agentId=${agentId} requester=${requester}`);
    const instruction = instructionFromProofURI(proofURI);
    const result = await auditWithOptionalOpenAI({
      agentId: agentId.toString(),
      runId: runId.toString(),
      instruction,
      policy,
      toolInventory
    });
    const proofFile = await writeProof(result.proof);
    const tx = await contract.recordAuditResult(
      runId,
      verdictToContractValue(result.verdict),
      result.riskScore,
      proofFile.hash,
      proofFile.publicUri
    );
    console.log(`Audit recorded: ${tx.hash}`);
    await tx.wait();

    if (process.env.RUNNER_FINALIZE_ACTION === "true") {
      const actionPlan = buildActionPlan({
        verdict: result.verdict,
        recipient: process.env.AGENT_ACTION_RECIPIENT ?? requester,
        amountWei: process.env.AGENT_ACTION_AMOUNT_WEI ?? "1000000000000000"
      });
      const finalProof = await writeProof({ ...result.proof, actionPlan }, { suffix: "final" });
      const finalTx = await contract.finalizeRun(
        runId,
        actionPlan.statusValue,
        actionPlan.actionHash,
        finalProof.publicUri
      );
      await finalTx.wait();
      console.log(`Action plan recorded: ${finalTx.hash}`);
    }
  } catch (error) {
    console.error(`Failed to process RunRequested runId=${runId}`, error);
  }
}

async function loadPolicy(): Promise<AgentPolicy> {
  const file = path.resolve("fixtures/sample-agent-policy.json");
  return PolicySchema.parse(JSON.parse(await readFile(file, "utf8")));
}

async function loadToolInventory(): Promise<ToolInventory> {
  const file = path.resolve("fixtures/sample-tool-inventory.json");
  return ToolInventorySchema.parse(JSON.parse(await readFile(file, "utf8")));
}

export function hashInstruction(instruction: string) {
  return ethers.keccak256(ethers.toUtf8Bytes(instruction));
}

export function instructionFromProofURI(proofURI: string) {
  if (!proofURI) return DEFAULT_INSTRUCTION;

  if (proofURI.startsWith("data:application/json,")) {
    try {
      const json = decodeURIComponent(proofURI.slice("data:application/json,".length));
      const parsed = JSON.parse(json) as { instruction?: unknown };
      return typeof parsed.instruction === "string" && parsed.instruction.length > 0
        ? parsed.instruction
        : DEFAULT_INSTRUCTION;
    } catch {
      return DEFAULT_INSTRUCTION;
    }
  }

  if (/^(https?:|ipfs:|\/)/i.test(proofURI)) {
    return DEFAULT_INSTRUCTION;
  }

  return proofURI;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
