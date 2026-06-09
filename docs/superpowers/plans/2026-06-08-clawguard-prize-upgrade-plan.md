# ClawGuard Prize Upgrade Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn ClawGuard from a deployment-award-ready demo into the strongest honest submission package possible: preserve the 20 Project Deployment Award path, fix the AI/UX credibility gap, add on-chain execution, add ERC-8004-aligned agent identity, and integrate Byreal only if a real Byreal capability can be executed and evidenced.

**Architecture:** Keep the current monorepo (`contracts`, `services/runner`, `web`) and evolve it in layers. The existing deployed Registry/Ledger remains valid evidence for the immediate Deployment Award; upgrades deploy as a V2 stack so we do not break the current receipt while improving the final public story.

**Tech Stack:** Hardhat, Solidity `0.8.24`, ethers v6, Node/TypeScript, Vite React, Vitest, lucide-react, zod, OpenZeppelin ERC-721, Mantle Sepolia chain `5003`, optional OpenAI runner key, optional Byreal CLI/Agent Skills.

---

## Source Inputs

- DoraHacks requirements PDF: `C:\Users\smmyt\Downloads\The Turing Test Hackathon 2026 _ Hackathon _ DoraHacks3.pdf`
- Current app root: `C:\Users\smmyt\Documents\Teste\turing-test-hackathon-2026\app`
- ERC-8004 reference: https://eips.ethereum.org/EIPS/eip-8004
- Byreal Agent Skills reference: https://github.com/byreal-git/byreal-agent-skills

## Problem Inventory

1. **Deployment Award is already the strongest immediate target.**
   - Current evidence satisfies the objective bars: public frontend, open-source repo, verified Mantle Sepolia contracts, live audit receipt, public proof JSON, video over 2 minutes.
   - Risk: delaying submission for upgrades could lose a first-come slot.

2. **Agentic Economy is not honestly satisfied yet.**
   - PDF requires core capabilities of Byreal Agent Skills, Byreal Perps CLI, or RealClaw.
   - Current project is RealClaw-style only. That is good narrative, but not enough for the sponsor track.

3. **The visible AI experience is too simulated.**
   - `web/src/App.tsx` uses `setTimeout`.
   - `web/src/lib/demoData.ts` hardcodes verdict copy and tx hashes.
   - `services/runner/src/audit.ts` has deterministic audit and optional OpenAI rationale, but the public UI does not expose whether the proof came from deterministic fallback or model-backed review.

4. **`AgentWallet` exists locally but is not deployed or visible.**
   - `contracts/contracts/AgentWallet.sol` and `contracts/test/AgentWallet.test.ts` are strong.
   - Missing: deploy script, Mantle Sepolia deployment, explorer verification, runner finalization, frontend execution panel, docs/video evidence.
   - Fresh check on 2026-06-08: `npm run test -w contracts` fails in one `AgentWallet` test because Hardhat matchers do not allow chaining `emit(...).and.to.changeEtherBalances(...)`. This is a test bug, not a contract compile failure, but it must be fixed before any V2 claim.

5. **Agent identity is custom, not ERC-8004-aligned.**
   - `AgentRegistry` is a clean custom registry.
   - ERC-8004 proposes an ERC-721 identity registry where the ERC-721 `tokenId` is the `agentId` and token URI is the agent URI. This is a high-ROI Grand Champion/Mantle ecosystem upgrade, not a PDF blocker.

6. **UI/UX is competent but not prize-grade.**
   - Current UI is visually tidy but generic.
   - Sidebar buttons do not navigate.
   - The AI audit is not presented as a natural process.
   - Accessibility can improve through contrast, focus, status announcements, and clearer beginner language.

7. **Community Voting needs a separate X campaign.**
   - PDF says voting is on the X platform.
   - Current repo has no campaign copy, share image plan, or community call-to-action package.

---

## File Structure Map

### Contracts

- Modify: `C:\Users\smmyt\Documents\Teste\turing-test-hackathon-2026\app\contracts\package.json`
  - Add OpenZeppelin dependency.
- Create: `C:\Users\smmyt\Documents\Teste\turing-test-hackathon-2026\app\contracts\contracts\AgentIdentityRegistry.sol`
  - ERC-8004-aligned ERC-721 identity registry.
- Keep: `C:\Users\smmyt\Documents\Teste\turing-test-hackathon-2026\app\contracts\contracts\AgentRegistry.sol`
  - Existing V1 registry remains historical evidence.
- Keep/modify: `C:\Users\smmyt\Documents\Teste\turing-test-hackathon-2026\app\contracts\contracts\AgentRunLedger.sol`
  - Reuse with `AgentIdentityRegistry` because it only requires `isAgentActive`.
- Keep: `C:\Users\smmyt\Documents\Teste\turing-test-hackathon-2026\app\contracts\contracts\AgentWallet.sol`
  - Already implemented; wire into deployment and demo.
- Create: `C:\Users\smmyt\Documents\Teste\turing-test-hackathon-2026\app\contracts\test\AgentIdentityRegistry.test.ts`
- Modify: `C:\Users\smmyt\Documents\Teste\turing-test-hackathon-2026\app\contracts\test\AgentWallet.test.ts`
  - Add finalization/execution evidence cases if missing after V2 deployment wiring.
- Create: `C:\Users\smmyt\Documents\Teste\turing-test-hackathon-2026\app\contracts\scripts\deploy-v2.ts`
  - Deploy identity registry, ledger, wallet.
- Create: `C:\Users\smmyt\Documents\Teste\turing-test-hackathon-2026\app\contracts\scripts\verify-v2.ts`

### Runner

- Modify: `C:\Users\smmyt\Documents\Teste\turing-test-hackathon-2026\app\services\runner\src\types.ts`
  - Add audit engine metadata, reasoning steps, action plan, optional Byreal evidence.
- Modify: `C:\Users\smmyt\Documents\Teste\turing-test-hackathon-2026\app\services\runner\src\audit.ts`
  - Return transparent deterministic/model engine metadata.
- Create: `C:\Users\smmyt\Documents\Teste\turing-test-hackathon-2026\app\services\runner\src\action.ts`
  - Convert an allowed audit into a small testnet action commitment.
- Create: `C:\Users\smmyt\Documents\Teste\turing-test-hackathon-2026\app\services\runner\src\byreal.ts`
  - Optional Byreal CLI adapter with JSON parsing and hard failure when the command cannot produce evidence.
- Modify: `C:\Users\smmyt\Documents\Teste\turing-test-hackathon-2026\app\services\runner\src\index.ts`
  - After `recordAuditResult`, call `finalizeRun` with a real `actionHash` when enabled.
- Modify: `C:\Users\smmyt\Documents\Teste\turing-test-hackathon-2026\app\services\runner\src\contract.ts`
  - Add `finalizeRun` ABI and optional `AgentWallet` ABI.
- Modify/Create tests:
  - `services\runner\src\audit.test.ts`
  - `services\runner\src\action.test.ts`
  - `services\runner\src\byreal.test.ts`

### Web

- Modify: `C:\Users\smmyt\Documents\Teste\turing-test-hackathon-2026\app\web\src\App.tsx`
  - Replace timeout-only flow with an explicit run state object.
- Create: `C:\Users\smmyt\Documents\Teste\turing-test-hackathon-2026\app\web\src\lib\trustRun.ts`
  - Pure state helpers for replay/live transitions.
- Modify: `C:\Users\smmyt\Documents\Teste\turing-test-hackathon-2026\app\web\src\lib\contracts.ts`
  - Add `getRun`, event polling, `executeAction`, and chain switch helper.
- Modify: `C:\Users\smmyt\Documents\Teste\turing-test-hackathon-2026\app\web\src\lib\demoData.ts`
  - Move static txs/proof into explicit replay receipt object and include V2 addresses.
- Create: `C:\Users\smmyt\Documents\Teste\turing-test-hackathon-2026\app\web\src\components\AiTracePanel.tsx`
  - Show model/fallback engine, reasoning steps, policy checks, proof hash.
- Create: `C:\Users\smmyt\Documents\Teste\turing-test-hackathon-2026\app\web\src\components\AgentIdentityCard.tsx`
  - Show ERC-8004-aligned identity NFT info.
- Create: `C:\Users\smmyt\Documents\Teste\turing-test-hackathon-2026\app\web\src\components\ExecutionPanel.tsx`
  - Show AgentWallet balance, action commitment, execute button, execution tx.
- Create: `C:\Users\smmyt\Documents\Teste\turing-test-hackathon-2026\app\web\src\components\ByrealCapabilityPanel.tsx`
  - Show Byreal evidence only if real JSON evidence exists.
- Modify: `C:\Users\smmyt\Documents\Teste\turing-test-hackathon-2026\app\web\src\styles.css`
  - Improve interaction, contrast, and responsive behavior.
- Modify: `C:\Users\smmyt\Documents\Teste\turing-test-hackathon-2026\app\web\src\App.test.tsx`
  - Cover replay, visible AI trace, identity, execution, and honest Byreal absence/presence.

### Submission

- Modify: `C:\Users\smmyt\Documents\Teste\turing-test-hackathon-2026\app\README.md`
- Modify: `C:\Users\smmyt\Documents\Teste\turing-test-hackathon-2026\app\docs\deployment_evidence.md`
- Modify: `C:\Users\smmyt\Documents\Teste\turing-test-hackathon-2026\app\submission\dorahacks_final_checklist.md`
- Modify: `C:\Users\smmyt\Documents\Teste\turing-test-hackathon-2026\app\submission\pitch_pack.md`
- Modify: `C:\Users\smmyt\Documents\Teste\turing-test-hackathon-2026\app\submission\demo_script.md`
- Create: `C:\Users\smmyt\Documents\Teste\turing-test-hackathon-2026\app\submission\byreal_evidence.md`
- Create: `C:\Users\smmyt\Documents\Teste\turing-test-hackathon-2026\app\submission\community_pack.md`
- Replace after new recording: `C:\Users\smmyt\Documents\Teste\turing-test-hackathon-2026\app\submission\clawguard-demo.webm`

---

## Task -1: Fix the Current AgentWallet Test Gate

**Purpose:** Restore a green contracts suite before adding V2 deployment work.

**Files:**
- Modify: `C:\Users\smmyt\Documents\Teste\turing-test-hackathon-2026\app\contracts\test\AgentWallet.test.ts`

- [ ] **Step 1: Replace invalid matcher chaining**

In `contracts\test\AgentWallet.test.ts`, replace this assertion:

```ts
await expect(wallet.executeAction(runId, recipient.address, amount))
  .to.emit(wallet, "ActionExecuted")
  .withArgs(runId, recipient.address, amount, 24)
  .and.to.changeEtherBalances([wallet, recipient], [-amount, amount]);
```

with manual balance checks plus a separate event assertion:

```ts
const walletAddress = await wallet.getAddress();
const beforeWallet = await ethers.provider.getBalance(walletAddress);
const beforeRecipient = await ethers.provider.getBalance(recipient.address);

const tx = await wallet.executeAction(runId, recipient.address, amount);

await expect(tx)
  .to.emit(wallet, "ActionExecuted")
  .withArgs(runId, recipient.address, amount, 24);

expect(await ethers.provider.getBalance(walletAddress)).to.equal(beforeWallet - amount);
expect(await ethers.provider.getBalance(recipient.address)).to.equal(beforeRecipient + amount);
```

- [ ] **Step 2: Run the failing file**

Run:

```powershell
npx hardhat test test/AgentWallet.test.ts
```

Expected: all `AgentWallet` tests pass.

- [ ] **Step 3: Run the full contracts suite**

Run:

```powershell
npm run test -w contracts
```

Expected: all contract tests pass.

- [ ] **Step 4: Commit**

Run:

```powershell
git add contracts/test/AgentWallet.test.ts
git commit -m "test: fix agent wallet balance assertion"
```

---

## Task 0: Lock the Current Deployment Award Submission

**Purpose:** Do not risk the first-come Deployment Award while building higher-ceiling upgrades.

**Files:**
- Create: `C:\Users\smmyt\Documents\Teste\turing-test-hackathon-2026\app\submission\dorahacks_form_payload.md`
- Modify: `C:\Users\smmyt\Documents\Teste\turing-test-hackathon-2026\app\submission\dorahacks_final_checklist.md`

- [ ] **Step 1: Create the exact form payload file**

Create `submission/dorahacks_form_payload.md` with:

```markdown
# DoraHacks Form Payload

## Project Name

ClawGuard for AI Wallets

## One-Line Pitch

ClawGuard turns AI wallet decisions into Mantle Sepolia trust receipts: policy in, policy audit verdict out, proof anchored on-chain.

## Public Demo

https://smmyth.github.io/clawguard-ai-wallets-demo/

## Open-Source Repository

https://github.com/smmyth/clawguard-ai-wallets

## Demo Video

https://smmyth.github.io/clawguard-ai-wallets-demo/submission/clawguard-demo.webm

## Deployed Contracts

- AgentRegistry: `0x12c186925ab7f8ad88a322ee057E4A68e22c88A8`
- AgentRunLedger: `0x6b349c752661Fdf085e48053E3186742b3a0D4d2`

## Mantle Explorer Links

- Registry: https://explorer.sepolia.mantle.xyz/address/0x12c186925ab7f8ad88a322ee057E4A68e22c88A8
- Ledger: https://explorer.sepolia.mantle.xyz/address/0x6b349c752661Fdf085e48053E3186742b3a0D4d2
- Live request tx: https://explorer.sepolia.mantle.xyz/tx/0x856a67915f7457e9d822b9338ee6f8ea8d64838a43813d81c100ac68f044e83f
- Live audit tx: https://explorer.sepolia.mantle.xyz/tx/0x10a4bf4c55f578b254c0b1fd8b0a906cd42937cfd3f6ddd5ec179304af57adbf

## Prize Selection

Primary: 20 Project Deployment Award

Secondary: Best UI/UX, AI DevTools, Community Voting

Do not select Agentic Economy unless the Byreal integration evidence file exists and contains a successful command output from Byreal Agent Skills, Byreal Perps CLI, or RealClaw.
```

- [ ] **Step 2: Verify public links**

Run:

```powershell
$urls = @(
  'https://smmyth.github.io/clawguard-ai-wallets-demo/',
  'https://github.com/smmyth/clawguard-ai-wallets',
  'https://smmyth.github.io/clawguard-ai-wallets-demo/submission/clawguard-demo.webm',
  'https://explorer.sepolia.mantle.xyz/address/0x12c186925ab7f8ad88a322ee057E4A68e22c88A8',
  'https://explorer.sepolia.mantle.xyz/address/0x6b349c752661Fdf085e48053E3186742b3a0D4d2'
)
foreach ($u in $urls) {
  $out = curl.exe -I -L --max-time 20 -s $u
  $status = ($out | Select-String -Pattern '^HTTP/' | Select-Object -Last 1).Line
  Write-Output "$status | $u"
}
```

Expected: every line ends with `200 OK`.

- [ ] **Step 3: Commit the form payload**

Run:

```powershell
git add submission/dorahacks_form_payload.md submission/dorahacks_final_checklist.md
git commit -m "docs: add dorahacks submission payload"
```

Expected: one docs-only commit.

- [ ] **Step 4: Submit before any upgrade deploy**

Use the DoraHacks UI and paste the payload. Record the final submitted URL or screenshot path in `submission/dorahacks_final_checklist.md` under:

```markdown
## DoraHacks Submission Status

- Submitted in DoraHacks UI: yes
- Submission URL: not submitted yet - replace this value only after the DoraHacks UI returns the public project URL
- Submitted at: not submitted yet - replace this value only after the DoraHacks UI confirms submission
```

This is the only step that cannot be done purely from the repo if the DoraHacks UI requires a logged-in browser session.

---

## Task 1: Harden Honest Claims and Track Strategy

**Purpose:** Prevent accidental false claims while the project evolves.

**Files:**
- Modify: `README.md`
- Modify: `submission\pitch_pack.md`
- Modify: `submission\dorahacks_final_checklist.md`

- [ ] **Step 1: Add a `Claim Matrix` section to README**

Add this exact section near the deployment evidence:

```markdown
## Claim Matrix

Safe today:

- Deployed on Mantle Sepolia chain `5003`.
- Current V2 contracts are Sourcify full-match verified; do not claim successful Etherscan-style API verification unless it is rerun and succeeds.
- A live runner wrote a policy audit verdict on-chain through `recordAuditResult`.
- Public frontend, video, proof JSON, and open-source repo are available.

Safe only after V2 evidence exists:

- Agent action execution is gated by a ClawGuard receipt through `AgentWallet`.
- Agent identity is ERC-8004-aligned through an ERC-721 identity registry.
- The audit proof includes model-backed reasoning rather than deterministic fallback.
- The project uses Byreal Agent Skills, Byreal Perps CLI, or RealClaw core capabilities.

Not claimed:

- Mainnet custody.
- Production Byreal or RealClaw integration before evidence exists.
- RWA functionality.
- Alpha/Data track fit based on Mantle on-chain data as a core source.
```

- [ ] **Step 2: Run a claim scan**

Run:

```powershell
rg -n "production Byreal|RealClaw integration|ERC-8004 compliant|mainnet custody|RWA|Alpha & Data|guaranteed|winner|won" README.md submission docs web services contracts
```

Expected:

- Any `production Byreal` or `RealClaw integration` mention is inside a "do not claim" or "safe only after" section.
- No file says the project has already won.

- [ ] **Step 3: Commit**

Run:

```powershell
git add README.md submission/pitch_pack.md submission/dorahacks_final_checklist.md
git commit -m "docs: harden prize claim matrix"
```

---

## Task 2: Make the Policy Audit Transparent Instead of Simulated

**Purpose:** Fix the biggest UI/UX and credibility gap: the demo must show what the audit engine did and whether it used deterministic fallback or a model-backed rationale.

**Files:**
- Modify: `services\runner\src\types.ts`
- Modify: `services\runner\src\audit.ts`
- Modify: `services\runner\src\audit.test.ts`
- Modify: `services\runner\src\proofs.ts`
- Create: `web\src\components\AiTracePanel.tsx`
- Modify: `web\src\App.tsx`
- Modify: `web\src\App.test.tsx`

- [x] **Step 1: Extend runner types**

In `services\runner\src\types.ts`, extend `AuditResult` and proof schema with:

```ts
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
  policy: z.object({
    maxRisk: z.number(),
    allowShell: z.boolean(),
    allowNetwork: z.boolean()
  }),
  toolInventory: z.object({
    network: z.boolean(),
    shell: z.boolean(),
    filesystem: z.boolean()
  }),
  verdict: z.enum(["Allowed", "Warning", "Blocked"]),
  riskScore: z.number().int().min(0).max(100),
  rationale: z.string(),
  engine: AuditEngineSchema,
  model: z.string().nullable(),
  fallbackUsed: z.boolean(),
  trace: z.array(AuditTraceStepSchema).min(1),
  timestamp: z.string()
});
```

Expected compatibility rule: old generated proofs can be kept as historical proofs, but new generated proofs must include `engine`, `model`, `fallbackUsed`, and `trace`.

- [x] **Step 2: Write runner tests first**

Add tests to `services\runner\src\audit.test.ts`:

```ts
it("marks deterministic fallback explicitly", () => {
  const result = deterministicAudit(baseInput());

  expect(result.proof.engine).to.equal("deterministic-policy-engine");
  expect(result.proof.model).to.equal(null);
  expect(result.proof.fallbackUsed).to.equal(true);
  expect(result.proof.trace.map((step) => step.label)).to.deep.equal([
    "Instruction risk",
    "Policy bounds",
    "Tool inventory",
    "Verdict mapping"
  ]);
});

it("does not change verdict or risk when OpenAI rewrites rationale", async () => {
  const originalFetch = globalThis.fetch;
  process.env.OPENAI_API_KEY = "test-key";
  process.env.OPENAI_MODEL = "gpt-4.1-mini";
  globalThis.fetch = async () =>
    new Response(JSON.stringify({ output_text: "Model-written rationale that keeps the deterministic decision." }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });

  try {
    const result = await auditWithOptionalOpenAI(baseInput());
    expect(result.verdict).to.equal("Allowed");
    expect(result.riskScore).to.equal(24);
    expect(result.proof.engine).to.equal("openai-responses");
    expect(result.proof.model).to.equal("gpt-4.1-mini");
    expect(result.proof.fallbackUsed).to.equal(false);
  } finally {
    globalThis.fetch = originalFetch;
    delete process.env.OPENAI_API_KEY;
    delete process.env.OPENAI_MODEL;
  }
});
```

- [x] **Step 3: Implement trace construction**

In `services\runner\src\audit.ts`, add a helper:

```ts
function buildTrace(input: AuditInput, findings: string[], riskScore: number, verdict: AuditResult["verdict"]) {
  return [
    {
      label: "Instruction risk",
      status: /leverage|unknown contract|high slippage|all funds/i.test(input.instruction) ? "warn" : "pass",
      detail: /leverage|unknown contract|high slippage|all funds/i.test(input.instruction)
        ? "Instruction contains a high-risk wallet phrase."
        : "Instruction does not request leverage, unknown contracts, high slippage, or all-funds movement."
    },
    {
      label: "Policy bounds",
      status: riskScore > input.policy.maxRisk ? "warn" : "pass",
      detail: `Risk ${riskScore} checked against maxRisk ${input.policy.maxRisk}.`
    },
    {
      label: "Tool inventory",
      status: findings.some((finding) => finding.includes("Shell")) ? "fail" : "pass",
      detail: `Network=${input.toolInventory.network}, shell=${input.toolInventory.shell}, filesystem=${input.toolInventory.filesystem}.`
    },
    {
      label: "Verdict mapping",
      status: verdict === "Blocked" ? "fail" : verdict === "Warning" ? "warn" : "pass",
      detail: `Mapped score and policy findings to ${verdict}.`
    }
  ] as const;
}
```

Update `buildResult` to accept `engine`, `model`, `fallbackUsed`, and `trace`.

- [x] **Step 4: Add `AiTracePanel`**

Create `web\src\components\AiTracePanel.tsx`:

```tsx
import { BrainCircuit, CheckCircle2, CircleAlert, XCircle } from "lucide-react";

export type AiTraceStep = {
  label: string;
  status: "pass" | "warn" | "fail";
  detail: string;
};

type Props = {
  engine: "deterministic-policy-engine" | "openai-responses";
  model: string | null;
  fallbackUsed: boolean;
  trace: AiTraceStep[];
};

const iconByStatus = {
  pass: CheckCircle2,
  warn: CircleAlert,
  fail: XCircle
};

export function AiTracePanel({ engine, model, fallbackUsed, trace }: Props) {
  return (
    <section className="panel ai-trace-panel" aria-labelledby="ai-trace-title">
      <div className="panel-heading">
        <div>
          <p className="section-label">AI audit trace</p>
          <h2 id="ai-trace-title">{fallbackUsed ? "Policy engine fallback" : "Model-backed audit"}</h2>
        </div>
        <BrainCircuit size={22} />
      </div>
      <div className="engine-row">
        <span>{engine}</span>
        <strong>{model ?? "No model key used"}</strong>
      </div>
      <div className="trace-list">
        {trace.map((step) => {
          const Icon = iconByStatus[step.status];
          return (
            <div className={`trace-step ${step.status}`} key={step.label}>
              <Icon size={18} />
              <div>
                <strong>{step.label}</strong>
                <p>{step.detail}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
```

- [x] **Step 5: Update App replay to use proof-like data**

Replace timeout-only verdict copy with a replay receipt object that includes trace:

```ts
const replayReceipt = {
  engine: "deterministic-policy-engine" as const,
  model: null,
  fallbackUsed: true,
  trace: [
    { label: "Instruction risk", status: "pass" as const, detail: "Instruction asks for a low-risk earning action." },
    { label: "Policy bounds", status: "pass" as const, detail: "Risk 24 checked against maxRisk 40." },
    { label: "Tool inventory", status: "pass" as const, detail: "Network allowed, shell disabled, filesystem disabled." },
    { label: "Verdict mapping", status: "pass" as const, detail: "Mapped score and findings to Allowed." }
  ]
};
```

Render:

```tsx
<AiTracePanel
  engine={replayReceipt.engine}
  model={replayReceipt.model}
  fallbackUsed={replayReceipt.fallbackUsed}
  trace={replayReceipt.trace}
/>
```

- [x] **Step 6: Run tests**

Run:

```powershell
npm run test -w runner
npm run test -w web
```

Expected: all runner and web tests pass.

- [x] **Step 7: Commit**

Execution note: Task 2 was implemented and then tightened after review. The public proof now advertises `runId=4`, the public URL returns `200`, the downloaded proof hash is `0x1d8c356529b185fa064176dedfe393ae007f7d17197067bfddb77d5cdefecfd3`, runner blocks shell-instruction policy violations, wallet mode no longer fabricates a completed audit, and replay score/trace are consistent.

---

## Task 3: Deploy and Demonstrate AgentWallet Execution

**Purpose:** Turn the receipt from a log into a gate that controls testnet value.

**Files:**
- Modify: `contracts\scripts\deploy-v2.ts`
- Create: `services\runner\src\action.ts`
- Create: `services\runner\src\action.test.ts`
- Modify: `services\runner\src\index.ts`
- Modify: `services\runner\src\contract.ts`
- Create: `web\src\components\ExecutionPanel.tsx`
- Modify: `web\src\lib\contracts.ts`

- [x] **Step 1: Add action planning tests**

Create `services\runner\src\action.test.ts`:

```ts
import { expect, it } from "vitest";
import { ethers } from "ethers";
import { buildActionPlan } from "./action.js";

it("builds a tiny testnet action only for Allowed verdicts", () => {
  const plan = buildActionPlan({
    verdict: "Allowed",
    riskScore: 24,
    recipient: "0x000000000000000000000000000000000000dEaD",
    amountWei: "1000000000000000"
  });

  expect(plan.status).to.equal("Finalized");
  expect(plan.actionHash).to.equal(
    ethers.keccak256(
      ethers.AbiCoder.defaultAbiCoder().encode(
        ["address", "uint256"],
        ["0x000000000000000000000000000000000000dEaD", 1000000000000000n]
      )
    )
  );
});

it("cancels non-Allowed verdicts", () => {
  const plan = buildActionPlan({
    verdict: "Blocked",
    riskScore: 82,
    recipient: "0x000000000000000000000000000000000000dEaD",
    amountWei: "1000000000000000"
  });

  expect(plan.status).to.equal("Cancelled");
  expect(plan.actionHash).to.match(/^0x[0-9a-f]{64}$/);
});
```

- [x] **Step 2: Implement action planner**

Create `services\runner\src\action.ts`:

```ts
import { ethers } from "ethers";

type Verdict = "Allowed" | "Warning" | "Blocked";

export type ActionPlan = {
  status: "Finalized" | "Cancelled";
  statusValue: 2 | 3;
  recipient: string;
  amountWei: string;
  actionHash: string;
  rationale: string;
};

export function buildActionPlan(input: {
  verdict: Verdict;
  riskScore: number;
  recipient: string;
  amountWei: string;
}): ActionPlan {
  const actionHash = ethers.keccak256(
    ethers.AbiCoder.defaultAbiCoder().encode(["address", "uint256"], [input.recipient, BigInt(input.amountWei)])
  );

  if (input.verdict !== "Allowed") {
    return {
      status: "Cancelled",
      statusValue: 3,
      recipient: input.recipient,
      amountWei: input.amountWei,
      actionHash,
      rationale: `Receipt was ${input.verdict}; wallet action is cancelled.`
    };
  }

  return {
    status: "Finalized",
    statusValue: 2,
    recipient: input.recipient,
    amountWei: input.amountWei,
    actionHash,
    rationale: `Receipt allowed risk ${input.riskScore}; wallet action is finalized for the committed recipient and amount.`
  };
}
```

- [x] **Step 3: Extend contract ABI**

In `services\runner\src\contract.ts`, add:

```ts
"function finalizeRun(uint256 runId,uint8 status,bytes32 actionHash,string proofURI)"
```

- [x] **Step 4: Finalize after audit when enabled**

In `services\runner\src\index.ts`, after `recordAuditResult` and `await tx.wait()`, add:

```ts
if (process.env.RUNNER_FINALIZE_ACTION === "true") {
  const actionPlan = buildActionPlan({
    verdict: result.verdict,
    riskScore: result.riskScore,
    recipient: process.env.AGENT_ACTION_RECIPIENT ?? requester,
    amountWei: process.env.AGENT_ACTION_AMOUNT_WEI ?? "1000000000000000"
  });
  const finalProof = await writeProof({
    ...result.proof,
    actionPlan
  });
  const finalizeTx = await contract.finalizeRun(
    runId,
    actionPlan.statusValue,
    actionPlan.actionHash,
    finalProof.publicUri
  );
  console.log(`Run finalized: ${finalizeTx.hash}`);
  await finalizeTx.wait();
}
```

- [x] **Step 5: Deploy V2 stack**

Create `contracts\scripts\deploy-v2.ts` that deploys:

```ts
const IdentityRegistry = await ethers.getContractFactory("AgentIdentityRegistry");
const identity = await IdentityRegistry.deploy();
await identity.waitForDeployment();

const Ledger = await ethers.getContractFactory("AgentRunLedger");
const ledger = await Ledger.deploy(await identity.getAddress());
await ledger.waitForDeployment();

const Wallet = await ethers.getContractFactory("AgentWallet");
const wallet = await Wallet.deploy(await ledger.getAddress(), 40);
await wallet.waitForDeployment();

console.log(`AgentIdentityRegistry: ${await identity.getAddress()}`);
console.log(`AgentRunLedgerV2: ${await ledger.getAddress()}`);
console.log(`AgentWallet: ${await wallet.getAddress()}`);
```

- [x] **Step 6: Verify and fund AgentWallet**

Run:

```powershell
npm run deploy:mantle -w contracts
$env:AGENT_IDENTITY_REGISTRY_ADDRESS='address printed by deploy-v2.ts for AgentIdentityRegistry'
$env:AGENT_RUN_LEDGER_V2_ADDRESS='address printed by deploy-v2.ts for AgentRunLedgerV2'
$env:AGENT_WALLET_ADDRESS='address printed by deploy-v2.ts for AgentWallet'
npx hardhat verify --network mantleSepolia $env:AGENT_IDENTITY_REGISTRY_ADDRESS
npx hardhat verify --network mantleSepolia $env:AGENT_RUN_LEDGER_V2_ADDRESS $env:AGENT_IDENTITY_REGISTRY_ADDRESS
npx hardhat verify --network mantleSepolia $env:AGENT_WALLET_ADDRESS $env:AGENT_RUN_LEDGER_V2_ADDRESS 40
```

Expected:

- All three addresses are deployed on Mantle Sepolia.
- Sourcify full-match verification exists for the deployed V2 contracts; Mantle explorer address pages are public.
- AgentWallet has a small Mantle Sepolia balance after funding from the burner wallet.

- [x] **Step 7: Execute a live finalized action**

Run runner with:

```powershell
$env:RUNNER_FINALIZE_ACTION='true'
$env:AGENT_ACTION_RECIPIENT='0x691c43F065bbf7bFA692BeE5a2D865f81028Ed3A'
$env:AGENT_ACTION_AMOUNT_WEI='1000000000000000'
npm run dev -w runner
```

Then request a run, wait for `Run finalized`, and call `executeAction` on `AgentWallet`.

Expected live evidence:

- `RunRequested` tx.
- `RunAudited` tx.
- `RunFinalized` tx.
- `ActionExecuted` tx.

- [x] **Step 8: Add frontend execution panel**

Create `web\src\components\ExecutionPanel.tsx`:

```tsx
import { Send, WalletCards } from "lucide-react";

type Props = {
  walletAddress: string;
  actionHash?: string;
  executionTx?: string;
  disabled: boolean;
  onExecute: () => void;
};

export function ExecutionPanel({ walletAddress, actionHash, executionTx, disabled, onExecute }: Props) {
  return (
    <section className="panel execution-panel" aria-labelledby="execution-title">
      <div className="panel-heading">
        <div>
          <p className="section-label">Gated execution</p>
          <h2 id="execution-title">AgentWallet</h2>
        </div>
        <WalletCards size={22} />
      </div>
      <div className="receipt-strip compact">
        <div>
          <strong>Wallet</strong>
          <span>{walletAddress || "Not deployed"}</span>
        </div>
        <div>
          <strong>Action hash</strong>
          <span>{actionHash ?? "Waiting for finalized receipt"}</span>
        </div>
      </div>
      <button className="primary-button" type="button" disabled={disabled} onClick={onExecute}>
        <Send size={18} />
        Execute approved action
      </button>
      {executionTx && <p className="mode-note">Execution transaction recorded on Mantle.</p>}
    </section>
  );
}
```

- [x] **Step 9: Commit**

Execution note: Task 3 deployed `AgentRegistry=0x6245caE82a9Cb257Ae3c7a70D633c1b35E071464`, `AgentRunLedgerV2=0x572875Be3DDf633169Ff5A5162eB435ba4113e64`, and `AgentWallet=0xe29f4883FaFc657CD21F09fCc6BbF41876Eb97d0` on Mantle Sepolia. Live V2 evidence: request `0x3630f0fa2a537ebb5ccb6b588af9daa5edcfceb9f579d4f1299192f8e8c295c8`, audit `0x93535d135b081c584c4d3d63341c7fc0a873745daa5ed3f2441d375d603fbfce`, finalize `0x6210b44d229110db8f1cc7067778b18647799c48deb9f1b06a828c4b92889cb9`, execution `0x3b8bfda7ab32cae841bba4718f8af214ce6e6bb6a83b11bf6a8132fe19b76ff5`, action hash `0x9adf4e5e334b02df1f1958dbf012aed611d3f39e5841d2fd10907550dfb69e61`, final proof `/proofs/generated/run-1-allowed-v2-final.json`. Sourcify full-match verification passed for all three V2 contracts; the Mantle explorer Etherscan-style API returned HTML instead of JSON during Hardhat verification, so do not claim successful Etherscan-style API verification for V2.

---

## Task 4: Add ERC-8004-Aligned Agent Identity

**Purpose:** Improve Grand Champion/Mantle ecosystem contribution by issuing an ERC-721 identity token for the agent.

**Files:**
- Modify: `contracts\package.json`
- Create: `contracts\contracts\AgentIdentityRegistry.sol`
- Create: `contracts\test\AgentIdentityRegistry.test.ts`
- Modify: `contracts\scripts\deploy-v2.ts`
- Create: `web\src\components\AgentIdentityCard.tsx`

- [ ] **Step 1: Install OpenZeppelin**

Run:

```powershell
npm install @openzeppelin/contracts -w contracts
```

Expected: `contracts/package.json` includes `@openzeppelin/contracts`.

- [ ] **Step 2: Write failing identity tests**

Create `contracts\test\AgentIdentityRegistry.test.ts`:

```ts
import { expect } from "chai";
import { ethers } from "hardhat";

describe("AgentIdentityRegistry", function () {
  const policyHash = ethers.id("policy:v2");
  const capabilitiesHash = ethers.id("capabilities:v2");

  it("mints an ERC-721 agent identity whose tokenId is the agentId", async function () {
    const [owner] = await ethers.getSigners();
    const Registry = await ethers.getContractFactory("AgentIdentityRegistry");
    const registry = await Registry.deploy();

    await expect(
      registry.registerAgent("Personal CFO Agent", "https://example.com/agent.json", policyHash, capabilitiesHash)
    )
      .to.emit(registry, "AgentRegistered")
      .withArgs(1, owner.address, "Personal CFO Agent", "https://example.com/agent.json", policyHash, capabilitiesHash);

    expect(await registry.ownerOf(1)).to.equal(owner.address);
    expect(await registry.tokenURI(1)).to.equal("https://example.com/agent.json");
    expect(await registry.isAgentActive(1)).to.equal(true);
  });

  it("uses ERC-721 ownership for policy updates", async function () {
    const [owner, other] = await ethers.getSigners();
    const Registry = await ethers.getContractFactory("AgentIdentityRegistry");
    const registry = await Registry.deploy();
    await registry.registerAgent("Personal CFO Agent", "https://example.com/agent.json", policyHash, capabilitiesHash);

    await expect(registry.connect(other).updateAgentPolicy(1, ethers.id("new-policy"), ethers.id("new-caps")))
      .to.be.revertedWithCustomError(registry, "NotAgentOwner")
      .withArgs(1, other.address);

    await registry.transferFrom(owner.address, other.address, 1);
    await expect(registry.connect(other).updateAgentPolicy(1, ethers.id("new-policy"), ethers.id("new-caps")))
      .to.emit(registry, "AgentPolicyUpdated");
  });
});
```

- [ ] **Step 3: Implement identity registry**

Create `contracts\contracts\AgentIdentityRegistry.sol`:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC721URIStorage} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract AgentIdentityRegistry is ERC721URIStorage {
    struct Agent {
        uint256 id;
        string name;
        bytes32 policyHash;
        bytes32 capabilitiesHash;
        bool active;
    }

    uint256 public nextAgentId = 1;
    mapping(uint256 => Agent) private agents;

    event AgentRegistered(
        uint256 indexed agentId,
        address indexed owner,
        string name,
        string agentURI,
        bytes32 policyHash,
        bytes32 capabilitiesHash
    );
    event AgentPolicyUpdated(uint256 indexed agentId, bytes32 policyHash, bytes32 capabilitiesHash);
    event AgentActiveStatusUpdated(uint256 indexed agentId, bool active);

    error AgentNotFound(uint256 agentId);
    error NotAgentOwner(uint256 agentId, address caller);
    error EmptyName();
    error EmptyHash();

    constructor() ERC721("ClawGuard Agent Identity", "CGAI") {}

    modifier onlyAgentOwner(uint256 agentId) {
        if (_ownerOf(agentId) == address(0)) revert AgentNotFound(agentId);
        if (ownerOf(agentId) != msg.sender) revert NotAgentOwner(agentId, msg.sender);
        _;
    }

    function registerAgent(
        string calldata name,
        string calldata agentURI,
        bytes32 policyHash,
        bytes32 capabilitiesHash
    ) external returns (uint256 agentId) {
        if (bytes(name).length == 0) revert EmptyName();
        if (policyHash == bytes32(0) || capabilitiesHash == bytes32(0)) revert EmptyHash();

        agentId = nextAgentId++;
        _safeMint(msg.sender, agentId);
        _setTokenURI(agentId, agentURI);
        agents[agentId] = Agent({
            id: agentId,
            name: name,
            policyHash: policyHash,
            capabilitiesHash: capabilitiesHash,
            active: true
        });

        emit AgentRegistered(agentId, msg.sender, name, agentURI, policyHash, capabilitiesHash);
    }

    function updateAgentPolicy(
        uint256 agentId,
        bytes32 policyHash,
        bytes32 capabilitiesHash
    ) external onlyAgentOwner(agentId) {
        if (policyHash == bytes32(0) || capabilitiesHash == bytes32(0)) revert EmptyHash();
        agents[agentId].policyHash = policyHash;
        agents[agentId].capabilitiesHash = capabilitiesHash;
        emit AgentPolicyUpdated(agentId, policyHash, capabilitiesHash);
    }

    function setAgentActive(uint256 agentId, bool active) external onlyAgentOwner(agentId) {
        agents[agentId].active = active;
        emit AgentActiveStatusUpdated(agentId, active);
    }

    function getAgent(uint256 agentId) external view returns (Agent memory) {
        if (_ownerOf(agentId) == address(0)) revert AgentNotFound(agentId);
        return agents[agentId];
    }

    function ownerOfAgent(uint256 agentId) external view returns (address) {
        if (_ownerOf(agentId) == address(0)) revert AgentNotFound(agentId);
        return ownerOf(agentId);
    }

    function isAgentActive(uint256 agentId) external view returns (bool) {
        if (_ownerOf(agentId) == address(0)) revert AgentNotFound(agentId);
        return agents[agentId].active;
    }
}
```

- [ ] **Step 4: Run tests**

Run:

```powershell
npx hardhat test test/AgentIdentityRegistry.test.ts test/AgentRunLedger.test.ts
```

Expected:

- Identity tests pass.
- Ledger tests still pass with the existing registry.

- [ ] **Step 5: Add UI identity card**

Create `web\src\components\AgentIdentityCard.tsx`:

```tsx
import { BadgeCheck } from "lucide-react";
import { addressUrl } from "../lib/contracts";

type Props = {
  registryAddress: string;
  agentId: string;
  agentURI: string;
};

export function AgentIdentityCard({ registryAddress, agentId, agentURI }: Props) {
  return (
    <section className="panel identity-panel" aria-labelledby="identity-title">
      <div className="panel-heading">
        <div>
          <p className="section-label">Agent identity</p>
          <h2 id="identity-title">ERC-8004-aligned NFT</h2>
        </div>
        <BadgeCheck size={22} />
      </div>
      <div className="receipt-strip compact">
        <div>
          <strong>Agent ID</strong>
          <span>{agentId}</span>
        </div>
        <div>
          <strong>Registry</strong>
          <a href={addressUrl(registryAddress)} target="_blank" rel="noreferrer">
            {registryAddress || "Not deployed"}
          </a>
        </div>
        <div>
          <strong>Agent URI</strong>
          <span>{agentURI}</span>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 6: Commit**

Run:

```powershell
git add contracts web/src/components/AgentIdentityCard.tsx package-lock.json
git commit -m "feat: add ERC-8004-aligned agent identity"
```

---

## Task 5: Byreal Integration Spike With a Hard Claim Gate

**Purpose:** Either unlock a defensible Agentic Economy claim or explicitly leave the track out.

**Files:**
- Create: `services\runner\src\byreal.ts`
- Create: `services\runner\src\byreal.test.ts`
- Modify: `services\runner\src\types.ts`
- Modify: `services\runner\src\audit.ts`
- Create: `submission\byreal_evidence.md`
- Modify: `submission\dorahacks_final_checklist.md`

- [ ] **Step 1: Install or invoke Byreal CLI without committing global state assumptions**

Run:

```powershell
npm exec --yes --package @byreal-io/byreal-cli byreal-cli -- --help
```

If the command fails because the package is not published or requires interactive setup, run:

```powershell
npx skills add byreal-git/byreal-agent-skills
```

Hard gate:

- Continue this task only if one Byreal command can emit structured JSON or reliable CLI output without real funds.
- If no command can run, write the failure evidence to `submission/byreal_evidence.md` and do not select Agentic Economy.

- [ ] **Step 2: Create Byreal adapter tests**

Create `services\runner\src\byreal.test.ts`:

```ts
import { expect, it } from "vitest";
import { parseByrealJson } from "./byreal.js";

it("parses Byreal JSON command evidence", () => {
  const evidence = parseByrealJson(
    JSON.stringify({
      command: "pools analyze",
      pool: "test-pool",
      apr24h: 12.4,
      tvl: 100000,
      risk: "medium"
    })
  );

  expect(evidence.source).to.equal("byreal-cli");
  expect(evidence.raw.pool).to.equal("test-pool");
});

it("rejects non-json output", () => {
  expect(() => parseByrealJson("interactive setup required")).to.throw("Byreal command did not return JSON");
});
```

- [ ] **Step 3: Implement Byreal adapter**

Create `services\runner\src\byreal.ts`:

```ts
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

export type ByrealEvidence = {
  source: "byreal-cli";
  command: string;
  raw: Record<string, unknown>;
};

export function parseByrealJson(stdout: string): ByrealEvidence {
  let raw: Record<string, unknown>;
  try {
    raw = JSON.parse(stdout) as Record<string, unknown>;
  } catch {
    throw new Error("Byreal command did not return JSON");
  }
  return {
    source: "byreal-cli",
    command: String(raw.command ?? "unknown"),
    raw
  };
}

export async function runByrealEvidence(): Promise<ByrealEvidence | null> {
  if (process.env.BYREAL_ENABLED !== "true") return null;

  const binary = process.env.BYREAL_CLI_BINARY ?? "byreal-cli";
  const args = (process.env.BYREAL_CLI_ARGS ?? "pools list -o json").split(" ");
  const { stdout } = await execFileAsync(binary, args, { timeout: 30_000 });
  return parseByrealJson(stdout);
}
```

- [ ] **Step 4: Wire evidence into audit proof**

In `services\runner\src\audit.ts`, add optional `byrealEvidence` to the proof only if `runByrealEvidence()` returned non-null. The proof must not invent Byreal capability. It must contain the raw command output summary.

- [ ] **Step 5: Generate `submission/byreal_evidence.md`**

If the command succeeds, write:

```markdown
# Byreal Evidence

## Capability Used

Byreal Agent Skills / CLI command executed successfully.

## Command

Paste the exact command that produced the successful Byreal output.

## Scenario

Personal CFO Agent uses Byreal CLMM pool or swap-preview data as an external capability input. ClawGuard audits whether the resulting action stays inside wallet policy, then records the trust receipt on Mantle Sepolia.

## Output Summary

```json
Paste the bounded sanitized JSON output from the successful Byreal command.
```

## Claim Status

Agentic Economy can be selected only if this file contains successful command output.
```

If the command fails, write:

```markdown
# Byreal Evidence

Byreal integration was attempted but not completed.

Agentic Economy should not be selected for this submission because the project does not yet show successful use of Byreal Agent Skills, Byreal Perps CLI, or RealClaw core capabilities.

## Failure Evidence

```text
Paste the exact failed command and its stderr/stdout.
```
```

- [ ] **Step 6: Commit**

Run:

```powershell
git add services/runner/src submission/byreal_evidence.md submission/dorahacks_final_checklist.md
git commit -m "feat: add byreal evidence gate"
```

---

## Task 6: Upgrade UI/UX to Prize-Grade

**Purpose:** Improve Best UI/UX scoring across visual design, interaction flow, AI interaction design, and accessibility.

**Files:**
- Modify: `web\src\App.tsx`
- Create: `web\src\lib\trustRun.ts`
- Modify: `web\src\components\AiVerdictPanel.tsx`
- Add components from Tasks 2-5.
- Modify: `web\src\styles.css`
- Modify: `web\src\App.test.tsx`

- [ ] **Step 1: Add pure run state helper**

Create `web\src\lib\trustRun.ts`:

```ts
export type TrustRunPhase =
  | "idle"
  | "requesting"
  | "waiting-for-ledger"
  | "auditing"
  | "finalizing"
  | "ready-to-execute"
  | "executed"
  | "blocked"
  | "error";

export type TrustRunState = {
  phase: TrustRunPhase;
  requestTx?: string;
  auditTx?: string;
  finalizeTx?: string;
  executionTx?: string;
  error?: string;
};

export function isTerminalPhase(phase: TrustRunPhase) {
  return phase === "executed" || phase === "blocked" || phase === "error";
}

export function phaseLabel(phase: TrustRunPhase) {
  const labels: Record<TrustRunPhase, string> = {
    idle: "Ready",
    requesting: "Requesting",
    "waiting-for-ledger": "Waiting for Mantle",
    auditing: "Auditing",
    finalizing: "Finalizing",
    "ready-to-execute": "Ready to execute",
    executed: "Executed",
    blocked: "Blocked",
    error: "Error"
  };
  return labels[phase];
}
```

- [ ] **Step 2: Replace decorative nav with useful tabs**

In `App.tsx`, define:

```ts
type AppTab = "trust-check" | "receipt" | "identity";
const [tab, setTab] = useState<AppTab>("trust-check");
```

Replace inert buttons:

```tsx
<button className={`nav-button ${tab === "trust-check" ? "active" : ""}`} aria-label="Trust check" onClick={() => setTab("trust-check")}>
  <WalletCards size={20} />
</button>
<button className={`nav-button ${tab === "receipt" ? "active" : ""}`} aria-label="Receipts" onClick={() => setTab("receipt")}>
  <ReceiptText size={20} />
</button>
<button className={`nav-button ${tab === "identity" ? "active" : ""}`} aria-label="Agent identity" onClick={() => setTab("identity")}>
  <RadioTower size={20} />
</button>
```

- [ ] **Step 3: Add accessibility status live region**

Add near the top of `workspace`:

```tsx
<div className="sr-only" role="status" aria-live="polite">
  {phaseLabel(run.phase)}
</div>
```

Add CSS:

```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
```

- [ ] **Step 4: Improve contrast**

In `web\src\styles.css`, change:

```css
--muted: #a8bbb5;
```

Expected: muted labels become more readable against dark panels.

- [ ] **Step 5: Add tests for tabs and trace**

In `web\src\App.test.tsx`, add:

```ts
it("shows the audit trace instead of hiding AI behavior", async () => {
  render(<App />);
  const user = userEvent.setup();

  await user.click(screen.getByRole("button", { name: /Run trust check/i }));

  expect(await screen.findByRole("heading", { name: /Policy engine fallback|Model-backed audit/i })).toBeInTheDocument();
  expect(screen.getByText("Instruction risk")).toBeInTheDocument();
  expect(screen.getByText("Verdict mapping")).toBeInTheDocument();
});

it("sidebar buttons switch product views", async () => {
  render(<App />);
  const user = userEvent.setup();

  await user.click(screen.getByRole("button", { name: "Agent identity" }));
  expect(screen.getByRole("heading", { name: /Agent identity|ERC-8004/i })).toBeInTheDocument();
});
```

- [ ] **Step 6: Run frontend validation**

Run:

```powershell
npm run test -w web
npm run lint -w web
npm run build -w web
```

Expected: all pass.

- [ ] **Step 7: Visual QA**

Run:

```powershell
npm run dev:web
```

Open `http://127.0.0.1:5173/` and capture:

- Desktop 1440x1000.
- Mobile 390x844.

Acceptance:

- No overlapping text.
- Sidebar buttons change visible content.
- Audit trace is visible after running the check.
- Replay is explicitly labeled as replay.
- Live wallet mode tells the user exactly what it will call.

- [ ] **Step 8: Commit**

Run:

```powershell
git add web/src
git commit -m "feat: improve ai wallet receipt experience"
```

---

## Task 7: Community Voting Pack

**Purpose:** Give the project a clear shareable story for X voting.

**Files:**
- Create: `submission\community_pack.md`
- Create: `submission\x_thread.md`
- Modify: `submission\pitch_pack.md`

- [ ] **Step 1: Create campaign pack**

Create `submission\community_pack.md`:

```markdown
# Community Voting Pack

## Core Message

Would you trust an AI wallet? ClawGuard makes the answer inspectable: every agent request, policy audit verdict, proof hash, and execution gate becomes a Mantle receipt.

## Non-Technical Hook

AI wallets should not just say "trust me." They should leave receipts.

## Technical Hook

ClawGuard records AI wallet policy audit results on Mantle Sepolia and can gate testnet wallet execution through a finalized receipt.

## Proof Links

- Demo: https://smmyth.github.io/clawguard-ai-wallets-demo/
- Repo: https://github.com/smmyth/clawguard-ai-wallets
- Ledger: https://explorer.sepolia.mantle.xyz/address/0x6b349c752661Fdf085e48053E3186742b3a0D4d2
- Audit tx: https://explorer.sepolia.mantle.xyz/tx/0x10a4bf4c55f578b254c0b1fd8b0a906cd42937cfd3f6ddd5ec179304af57adbf

## CTA

Vote for ClawGuard if you think AI agents should be accountable before they touch money.
```

- [ ] **Step 2: Create X thread draft**

Create `submission\x_thread.md`:

```markdown
# X Thread Draft

1/ AI wallets are coming. The question is not "can they act?" The question is: would you trust them with money?

2/ ClawGuard is my answer for the Mantle Turing Test Hackathon: policy in, policy audit verdict out, proof anchored on-chain.

3/ The demo uses a Personal CFO agent. It asks for a low-risk earning action, gets checked against a declared policy, and receives a risk score plus rationale.

4/ The important part: the result is not just UI state. The request and audit receipt are recorded on Mantle Sepolia.

5/ Public proof:
Demo: https://smmyth.github.io/clawguard-ai-wallets-demo/
Repo: https://github.com/smmyth/clawguard-ai-wallets
Audit tx: https://explorer.sepolia.mantle.xyz/tx/0x10a4bf4c55f578b254c0b1fd8b0a906cd42937cfd3f6ddd5ec179304af57adbf

6/ AI agents should not just say "trust me." They should leave receipts.

7/ If that future makes sense to you, vote for ClawGuard in the Community Voting round.
```

- [ ] **Step 3: Commit**

Run:

```powershell
git add submission/community_pack.md submission/x_thread.md submission/pitch_pack.md
git commit -m "docs: add community voting pack"
```

---

## Task 8: Final Redeploy, Republish, Video, and Submission Update

**Purpose:** Convert the upgraded build into public evidence without breaking existing proof.

**Files:**
- Modify all deployment docs and public build outputs.

- [ ] **Step 1: Run full local gates**

Run:

```powershell
npm test
npm run build
npm run lint
```

Expected:

- Hardhat tests pass.
- Runner tests pass.
- Web tests pass.
- TypeScript builds.
- Vite production build succeeds.
- ESLint emits no errors.

- [ ] **Step 2: Read live V2 receipt from Mantle**

Run a Node read script:

```powershell
@'
const { ethers } = require('ethers');
const provider = new ethers.JsonRpcProvider('https://rpc.sepolia.mantle.xyz', 5003);
const ledger = new ethers.Contract(process.env.AGENT_RUN_LEDGER_ADDRESS, [
  'function getRun(uint256 runId) view returns (tuple(uint256 id,uint256 agentId,address requester,bytes32 instructionHash,string requestProofURI,uint8 verdict,uint8 riskScore,bytes32 auditHash,string auditProofURI,uint8 status,bytes32 actionHash,string finalProofURI,uint64 requestedAt,uint64 auditedAt,uint64 finalizedAt))'
], provider);
(async () => {
  const run = await ledger.getRun(process.env.LIVE_RUN_ID);
  console.log(JSON.stringify({
    chainId: Number((await provider.getNetwork()).chainId),
    runId: run.id.toString(),
    agentId: run.agentId.toString(),
    verdict: Number(run.verdict),
    riskScore: Number(run.riskScore),
    status: Number(run.status),
    auditProofURI: run.auditProofURI,
    finalProofURI: run.finalProofURI,
    actionHash: run.actionHash
  }, null, 2));
})().catch((error) => { console.error(error); process.exit(1); });
'@ | node
```

Expected:

- `chainId` is `5003`.
- `status` is `2` for finalized allowed execution, or `3` for cancelled blocked action.
- `auditProofURI` and `finalProofURI` are non-empty.

- [ ] **Step 3: Publish source repo**

Run from the public source mirror:

```powershell
git status --short
git log -1 --oneline
git push origin main
```

Expected:

- No `.env` is tracked.
- `main` includes the latest docs and source.

- [ ] **Step 4: Publish static demo**

Build web:

```powershell
npm run build -w web
```

Copy `web/dist` to the GitHub Pages repo and push. Then verify:

```powershell
curl.exe -I -L --max-time 20 -s https://smmyth.github.io/clawguard-ai-wallets-demo/
curl.exe -I -L --max-time 20 -s https://smmyth.github.io/clawguard-ai-wallets-demo/submission/clawguard-demo.webm
```

Expected: both return `HTTP/1.1 200 OK`.

- [ ] **Step 5: Record new video**

Video must show:

1. Public app.
2. Agent identity card.
3. Policy.
4. AI trace.
5. Mantle request/audit/finalize tx.
6. AgentWallet execution if deployed.
7. Proof JSON.
8. Honest claim matrix.

Acceptance:

- Duration is at least 120 seconds.
- Video URL returns `200`.
- It does not claim Byreal unless `submission/byreal_evidence.md` contains successful evidence.

- [ ] **Step 6: Update submission package**

Update:

- `README.md`
- `docs/deployment_evidence.md`
- `submission/dorahacks_final_checklist.md`
- `submission/pitch_pack.md`
- `submission/demo_script.md`

Each file must include:

- V2 contract addresses.
- V2 live run IDs/tx hashes.
- Verification status.
- Public video URL.
- Agentic Economy status based on Byreal evidence.

- [ ] **Step 7: Final claim scan**

Run:

```powershell
rg -n "Production Byreal|RealClaw integration|ERC-8004 compliant|mainnet custody|RWA|won|guaranteed|fake|simulated" README.md docs submission web/src services/runner/src contracts
```

Expected:

- No unsafe claims remain.
- "simulated" appears only when describing replay mode honestly.

- [ ] **Step 8: Final commit**

Run:

```powershell
git add README.md docs submission contracts services web package-lock.json package.json
git commit -m "chore: finalize clawguard prize submission"
```

---

## Execution Priority

1. **Restore green local gates:** Task -1.
2. **Immediate prize preservation:** Task 0 and Task 1.
3. **Highest ROI:** Task 2 and Task 6.
4. **Technical depth:** Task 3 and Task 4.
5. **Sponsor-track unlock:** Task 5 only if Byreal produces real evidence.
6. **Final packaging:** Task 7 and Task 8.

## Go / No-Go Rules

- Submit the current Deployment Award package before any risky refactor.
- Do not select Agentic Economy unless Byreal evidence exists.
- Do not claim model-backed AI unless a proof generated with a real server-side model key exists.
- Do not replace the existing V1 deployment evidence; append V2 evidence.
- Do not publish `.env` or any private key.
- Do not spend mainnet funds.

## Final Verification Checklist

- [ ] `npm test` passes.
- [ ] `npm run build` passes.
- [ ] `npm run lint` passes.
- [ ] Sourcify full-match verification exists for all V2 contracts used in the submission.
- [ ] Public app returns HTTP `200`.
- [ ] Public video returns HTTP `200`.
- [ ] Public video duration is at least `120` seconds.
- [ ] Public proof JSON returns HTTP `200`.
- [ ] Source repo returns HTTP `200`.
- [ ] Raw `.env` in source repo returns `404`.
- [ ] `submission/dorahacks_form_payload.md` matches the final public links.
- [ ] `submission/byreal_evidence.md` determines whether Agentic Economy is selected.
