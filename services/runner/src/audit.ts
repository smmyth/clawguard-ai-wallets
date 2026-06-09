import { AuditEngine, AuditInput, AuditResult, AuditTraceStep } from "./types.js";

const OPENAI_RESPONSES_URL = "https://api.openai.com/v1/responses";
const DEFAULT_OPENAI_MODEL = "gpt-4.1-mini";
const SHELL_INSTRUCTION_REGEX =
  /\b(?:shell execution|shell command|command execution|execute(?:s|d|ing)?\s+(?:a\s+)?(?:shell\s+)?command|run(?:s|ning)?\s+(?:a\s+)?(?:shell\s+)?command|use\s+(?:the\s+)?shell|open\s+(?:a\s+)?terminal|terminal command|bash|powershell|cmd\.exe|child_process|execa|shelljs)\b/i;

export function deterministicAudit(input: AuditInput): AuditResult {
  const findings: string[] = [];
  let riskScore = 24;
  const policyBlocksShellExecution = input.policy.blockedActions.some(isShellExecutionBlock);
  const shellForbiddenByPolicy = !input.policy.allowShell || policyBlocksShellExecution;
  const shellInstructionRequested = SHELL_INSTRUCTION_REGEX.test(input.instruction);
  const shellForbidden = input.toolInventory.shell && shellForbiddenByPolicy;
  const shellInstructionForbidden = shellInstructionRequested && shellForbiddenByPolicy;
  const networkForbidden = input.toolInventory.network && !input.policy.allowNetwork;
  const hasFilesystem = input.toolInventory.filesystem;
  const highRiskInstruction = /leverage|unknown contract|high slippage|all funds/i.test(input.instruction);

  if (shellForbidden) {
    findings.push("Shell execution is exposed while policy forbids it.");
    riskScore += 60;
  }

  if (shellInstructionForbidden) {
    findings.push(shellInstructionFinding(input.policy.allowShell, policyBlocksShellExecution));
    riskScore += 60;
  }

  if (networkForbidden) {
    findings.push("Network access is exposed while policy forbids it.");
    riskScore += 35;
  }

  if (hasFilesystem) {
    findings.push("Filesystem capability requires human review for a wallet agent.");
    riskScore += 18;
  }

  if (highRiskInstruction) {
    findings.push("Instruction contains a high-risk wallet action.");
    riskScore += 34;
  }

  if (shellForbidden || shellInstructionForbidden) {
    riskScore = Math.max(riskScore, input.policy.maxRisk + 1);
  }

  riskScore = Math.min(100, riskScore);

  let verdict: AuditResult["verdict"] = "Allowed";
  if (shellForbidden || shellInstructionForbidden) {
    verdict = "Blocked";
  } else if (riskScore > input.policy.maxRisk) {
    verdict = riskScore >= input.policy.requiresHumanApprovalAboveRisk + 30 ? "Blocked" : "Warning";
  }

  const rationale =
    findings.length === 0
      ? "Action stays inside policy and uses declared capabilities."
      : findings.join(" ");

  const trace = buildTrace(input, {
    verdict,
    riskScore,
    shellForbidden,
    shellInstructionForbidden,
    networkForbidden,
    hasFilesystem,
    highRiskInstruction
  });

  return buildResult(input, verdict, riskScore, rationale, {
    engine: "deterministic-policy-engine",
    model: null,
    fallbackUsed: true,
    trace
  });
}

export async function auditWithOptionalOpenAI(input: AuditInput): Promise<AuditResult> {
  const fallback = deterministicAudit(input);
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return fallback;
  }

  try {
    const response = await fetch(OPENAI_RESPONSES_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL ?? DEFAULT_OPENAI_MODEL,
        input: [
          {
            role: "system",
            content:
              "You write concise audit rationales for AI wallet agent safety. Keep the deterministic verdict and risk score unchanged."
          },
          {
            role: "user",
            content: JSON.stringify({
              instruction: input.instruction,
              policy: input.policy,
              toolInventory: input.toolInventory,
              deterministicVerdict: fallback.verdict,
              deterministicRiskScore: fallback.riskScore,
              deterministicRationale: fallback.rationale
            })
          }
        ]
      })
    });

    if (!response.ok) {
      return fallback;
    }

    const data = (await response.json()) as { output_text?: string };
    const rationale = data.output_text?.trim();
    if (!rationale) {
      return fallback;
    }

    return buildResult(input, fallback.verdict, fallback.riskScore, rationale, {
      engine: "openai-responses",
      model: process.env.OPENAI_MODEL ?? DEFAULT_OPENAI_MODEL,
      fallbackUsed: false,
      trace: fallback.proof.trace
    });
  } catch {
    return fallback;
  }
}

function buildResult(
  input: AuditInput,
  verdict: AuditResult["verdict"],
  riskScore: number,
  rationale: string,
  metadata: {
    engine: AuditEngine;
    model: string | null;
    fallbackUsed: boolean;
    trace: AuditTraceStep[];
  }
): AuditResult {
  const proof = {
    agentId: input.agentId,
    runId: input.runId,
    instruction: input.instruction,
    policy: {
      maxRisk: input.policy.maxRisk,
      allowShell: input.policy.allowShell,
      allowNetwork: input.policy.allowNetwork
    },
    toolInventory: {
      network: input.toolInventory.network,
      shell: input.toolInventory.shell,
      filesystem: input.toolInventory.filesystem
    },
    verdict,
    riskScore,
    rationale,
    engine: metadata.engine,
    model: metadata.model,
    fallbackUsed: metadata.fallbackUsed,
    trace: metadata.trace,
    timestamp: new Date().toISOString()
  };

  return { verdict, riskScore, rationale, proof };
}

function buildTrace(
  input: AuditInput,
  state: {
    verdict: AuditResult["verdict"];
    riskScore: number;
    shellForbidden: boolean;
    shellInstructionForbidden: boolean;
    networkForbidden: boolean;
    hasFilesystem: boolean;
    highRiskInstruction: boolean;
  }
): AuditTraceStep[] {
  const policyExceeded = state.riskScore > input.policy.maxRisk;
  const toolBlocked = state.shellForbidden || state.shellInstructionForbidden || state.networkForbidden;
  const instructionRisk = state.highRiskInstruction || state.shellInstructionForbidden;
  const instructionStatus = instructionRisk ? (state.verdict === "Blocked" || toolBlocked ? "fail" : "warn") : "pass";

  return [
    {
      label: "Instruction risk",
      status: instructionStatus,
      detail: state.shellInstructionForbidden
        ? "Instruction requested shell or command execution forbidden by policy."
        : state.highRiskInstruction
        ? "Instruction matched high-risk wallet action terms."
        : "Instruction did not match high-risk wallet action terms."
    },
    {
      label: "Policy bounds",
      status: policyExceeded ? (state.verdict === "Blocked" ? "fail" : "warn") : "pass",
      detail: policyExceeded
        ? `Risk score ${state.riskScore} exceeds max policy risk ${input.policy.maxRisk}.`
        : `Risk score ${state.riskScore} is within max policy risk ${input.policy.maxRisk}.`
    },
    {
      label: "Tool inventory",
      status: toolBlocked ? "fail" : state.hasFilesystem ? "warn" : "pass",
      detail: state.shellForbidden && state.shellInstructionForbidden
        ? "Shell tool exposure and requested shell execution violate policy."
        : state.shellForbidden
          ? "Declared tools expose shell execution forbidden by policy."
          : state.shellInstructionForbidden
            ? "Instruction requested a shell or command tool forbidden by policy."
            : state.networkForbidden
              ? "Declared tools expose a capability forbidden by policy."
              : state.hasFilesystem
                ? "Filesystem capability is present and requires review."
                : "Declared tools stay inside policy capability bounds."
    },
    {
      label: "Verdict mapping",
      status: state.verdict === "Blocked" ? "fail" : state.verdict === "Warning" ? "warn" : "pass",
      detail: `Deterministic policy mapping produced ${state.verdict}.`
    }
  ];
}

function isShellExecutionBlock(action: string): boolean {
  return /\b(?:shell execution|shell command|command execution)\b/i.test(normalizePolicyTerm(action));
}

function normalizePolicyTerm(action: string): string {
  return action.replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim();
}

function shellInstructionFinding(allowShell: boolean, policyBlocksShellExecution: boolean): string {
  if (!allowShell && policyBlocksShellExecution) {
    return "Instruction requests shell execution while policy.allowShell is false and blockedActions includes shell execution.";
  }

  if (!allowShell) {
    return "Instruction requests shell execution while policy.allowShell is false.";
  }

  return "Instruction requests shell execution blocked by policy.blockedActions.";
}

export function verdictToContractValue(verdict: AuditResult["verdict"]): number {
  if (verdict === "Allowed") return 1;
  if (verdict === "Warning") return 2;
  return 3;
}
