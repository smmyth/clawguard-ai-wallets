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

export const ProofSchema = z.object({
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
  timestamp: z.string()
});

export type AgentPolicy = z.infer<typeof PolicySchema>;
export type ToolInventory = z.infer<typeof ToolInventorySchema>;
export type AuditVerdict = z.infer<typeof VerdictSchema>;
export type AuditProof = z.infer<typeof ProofSchema>;

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
