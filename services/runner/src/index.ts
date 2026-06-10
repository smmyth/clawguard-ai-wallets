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
  if (command === "model-run") {
    await runModelBackedLedgerRun();
    return;
  }
  throw new Error(`Unknown command "${command}". Use "demo", "watch", or "model-run".`);
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

async function runModelBackedLedgerRun() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is required for model-run. Refusing to publish a model-backed proof without a real model call.");
  }

  const contract = createLedgerContract();
  const policy = await loadPolicy();
  const toolInventory = await loadToolInventory();
  const instruction = process.env.RUNNER_INSTRUCTION ?? DEFAULT_INSTRUCTION;
  const proofURI = requestProofURI(instruction);
  const requestTx = await contract.requestRun(BigInt(policy.agentId), hashInstruction(instruction), proofURI);
  const requestReceipt = await requestTx.wait();
  const runId = extractRunId(contract, requestReceipt);

  const result = await auditWithOptionalOpenAI({
    agentId: policy.agentId,
    runId: runId.toString(),
    instruction,
    policy,
    toolInventory
  });

  if (result.proof.fallbackUsed || result.proof.engine !== "openai-responses") {
    throw new Error("OpenAI audit did not produce a model-backed proof. Check OPENAI_API_KEY, OPENAI_MODEL, and network access.");
  }

  const proofFile = await writeProof(result.proof);
  const auditTx = await contract.recordAuditResult(
    runId,
    verdictToContractValue(result.verdict),
    result.riskScore,
    proofFile.hash,
    proofFile.publicUri
  );
  await auditTx.wait();

  const actionPlan = buildActionPlan({
    verdict: result.verdict,
    recipient: process.env.AGENT_ACTION_RECIPIENT ?? requestReceipt.from,
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

  console.log(JSON.stringify({
    runId: runId.toString(),
    requestTx: requestTx.hash,
    auditTx: auditTx.hash,
    finalTx: finalTx.hash,
    proofHash: proofFile.hash,
    proofUri: proofFile.publicUri,
    finalProofHash: finalProof.hash,
    finalProofUri: finalProof.publicUri,
    actionHash: actionPlan.actionHash,
    engine: result.proof.engine,
    model: result.proof.model
  }, null, 2));
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

function requestProofURI(instruction: string) {
  return `data:application/json,${encodeURIComponent(JSON.stringify({
    instruction,
    timestamp: new Date().toISOString(),
    source: "clawguard-model-run"
  }))}`;
}

function extractRunId(contract: ReturnType<typeof createLedgerContract>, receipt: ethers.ContractTransactionReceipt | null) {
  if (!receipt) {
    throw new Error("requestRun transaction did not return a receipt.");
  }

  for (const log of receipt.logs) {
    try {
      const parsed = contract.interface.parseLog(log);
      if (parsed?.name === "RunRequested") {
        return parsed.args.runId as bigint;
      }
    } catch {
      // Ignore logs from other contracts in the same receipt.
    }
  }

  throw new Error("RunRequested event was not found in the requestRun receipt.");
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
