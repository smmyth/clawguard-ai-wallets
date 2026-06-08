import { AuditInput, AuditResult } from "./types.js";

const OPENAI_RESPONSES_URL = "https://api.openai.com/v1/responses";

export function deterministicAudit(input: AuditInput): AuditResult {
  const findings: string[] = [];
  let riskScore = 24;

  if (input.toolInventory.shell && !input.policy.allowShell) {
    findings.push("Shell execution is exposed while policy forbids it.");
    riskScore += 60;
  }

  if (input.toolInventory.network && !input.policy.allowNetwork) {
    findings.push("Network access is exposed while policy forbids it.");
    riskScore += 35;
  }

  if (input.toolInventory.filesystem) {
    findings.push("Filesystem capability requires human review for a wallet agent.");
    riskScore += 18;
  }

  if (/leverage|unknown contract|high slippage|all funds/i.test(input.instruction)) {
    findings.push("Instruction contains a high-risk wallet action.");
    riskScore += 34;
  }

  riskScore = Math.min(100, riskScore);

  let verdict: AuditResult["verdict"] = "Allowed";
  if (riskScore > input.policy.maxRisk) {
    verdict = riskScore >= input.policy.requiresHumanApprovalAboveRisk + 30 ? "Blocked" : "Warning";
  }

  const rationale =
    findings.length === 0
      ? "Action stays inside policy and uses declared capabilities."
      : findings.join(" ");

  return buildResult(input, verdict, riskScore, rationale);
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
        model: process.env.OPENAI_MODEL ?? "gpt-4.1-mini",
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

    return buildResult(input, fallback.verdict, fallback.riskScore, rationale);
  } catch {
    return fallback;
  }
}

function buildResult(
  input: AuditInput,
  verdict: AuditResult["verdict"],
  riskScore: number,
  rationale: string
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
    timestamp: new Date().toISOString()
  };

  return { verdict, riskScore, rationale, proof };
}

export function verdictToContractValue(verdict: AuditResult["verdict"]): number {
  if (verdict === "Allowed") return 1;
  if (verdict === "Warning") return 2;
  return 3;
}
