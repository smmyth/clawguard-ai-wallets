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

const Uint256Max = 2n ** 256n - 1n;
const DecimalIntegerStringRegex = /^\d+$/;
const PositiveUint256StringSchema = z
  .string()
  .regex(DecimalIntegerStringRegex, "Amount must be a positive integer wei amount.")
  .refine(
    (value) => !DecimalIntegerStringRegex.test(value) || BigInt(value) > 0n,
    "Amount must be positive."
  )
  .refine(
    (value) => !DecimalIntegerStringRegex.test(value) || BigInt(value) <= Uint256Max,
    "Amount must fit inside uint256."
  );

export const ActionPlanSchema = z.discriminatedUnion("status", [
  z.object({
    status: z.literal("Finalized"),
    statusValue: z.literal(2),
    recipient: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Recipient must be a valid address."),
    amountWei: PositiveUint256StringSchema,
    actionHash: z.string().regex(/^0x[a-fA-F0-9]{64}$/, "Action hash must be bytes32.")
  }),
  z.object({
    status: z.literal("Cancelled"),
    statusValue: z.literal(3),
    recipient: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Recipient must be a valid address."),
    amountWei: PositiveUint256StringSchema,
    actionHash: z.string().regex(/^0x[a-fA-F0-9]{64}$/, "Action hash must be bytes32.")
  })
]);

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
  timestamp: z.string(),
  actionPlan: ActionPlanSchema.optional()
});

export const ProofSchema = AuditProofSchema;

export type AgentPolicy = z.infer<typeof PolicySchema>;
export type ToolInventory = z.infer<typeof ToolInventorySchema>;
export type AuditVerdict = z.infer<typeof VerdictSchema>;
export type AuditEngine = z.infer<typeof AuditEngineSchema>;
export type ActionPlan = z.infer<typeof ActionPlanSchema>;
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
