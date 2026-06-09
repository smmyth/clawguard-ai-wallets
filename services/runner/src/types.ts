import { z } from "zod";

export const PolicySchema = z.object({
  agentId: z.string(),
  agentName: z.string(),
  maxRisk: z.number().int().min(0).max(100),
  allowShell: z.boolean(),
  allowNetwork: z.boolean(),
  allowedProtocols: z.array(z.string()),
  blockedActions: z.array(z.string()),
  maxSlippageBps: z.number().int().min(0),
  requiresHumanApprovalAboveRisk: z.number().int().min(0).max(100)
});

export const ToolInventorySchema = z.object({
  source: z.string(),
  network: z.boolean(),
  shell: z.boolean(),
  filesystem: z.boolean(),
  declaredCapabilities: z.array(z.string()),
  observedCapabilities: z.array(z.string()),
  capabilityNotes: z.array(z.string())
});

export const VerdictSchema = z.enum(["Allowed", "Warning", "Blocked"]);

export const AuditEngineSchema = z.enum(["deterministic-policy-engine", "openai-responses"]);

export const AuditTraceStepSchema = z.object({
  label: z.string(),
  status: z.enum(["pass", "warn", "fail"]),
  detail: z.string()
});

export const AuditProofSchema = z.object({
  agentId: z.string(),
  runId: z.string(),
  instruction: z.string(),
  policy: PolicySchema.pick({
    maxRisk: true,
    allowShell: true,
    allowNetwork: true
  }),
  toolInventory: ToolInventorySchema.pick({
    network: true,
    shell: true,
    filesystem: true
  }),
  verdict: VerdictSchema,
  riskScore: z.number().int().min(0).max(100),
  rationale: z.string(),
  engine: AuditEngineSchema,
  model: z.string().nullable(),
  fallbackUsed: z.boolean(),
  trace: z.array(AuditTraceStepSchema).min(1),
  timestamp: z.string()
});

export const ProofSchema = AuditProofSchema;

export type AgentPolicy = z.infer<typeof PolicySchema>;
export type ToolInventory = z.infer<typeof ToolInventorySchema>;
export type AuditVerdict = z.infer<typeof VerdictSchema>;
export type AuditEngine = z.infer<typeof AuditEngineSchema>;
export type AuditTraceStep = z.infer<typeof AuditTraceStepSchema>;
export type AuditProof = z.infer<typeof AuditProofSchema>;

export type AuditInput = {
  agentId: string;
  runId: string;
  instruction: string;
  policy: AgentPolicy;
  toolInventory: ToolInventory;
};

export type AuditResult = {
  verdict: AuditVerdict;
  riskScore: number;
  rationale: string;
  proof: AuditProof;
};
