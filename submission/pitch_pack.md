# ClawGuard Pitch Pack

## One-Liner

ClawGuard turns AI wallet decisions into Mantle Sepolia trust receipts: policy in, AI audit verdict out, proof anchored on-chain.

## Problem

AI wallet agents ask users for trust, but users usually see only the final action. They do not get a durable answer to: what policy governed this agent, what did it request, what did the audit decide, and where is the proof?

## Solution

ClawGuard is a receipt layer for wallet agents. A Personal CFO-style agent submits an instruction, the runner audits it against a declared policy and tool inventory, and `AgentRunLedger` records the audit result on Mantle Sepolia.

## Why Mantle

The demo uses Mantle Sepolia chain `5003` for public, low-cost trust receipts. The receipt is not a UI-only state: `RunRequested` and `RunAudited` are emitted and inspectable through the Mantle explorer.

## Demo Evidence

- Public app: https://smmyth.github.io/clawguard-ai-wallets-demo/
- `AgentRegistry`: `0x12c186925ab7f8ad88a322ee057E4A68e22c88A8`
- `AgentRunLedger`: `0x6b349c752661Fdf085e48053E3186742b3a0D4d2`
- Live `runId=3` request tx: `0x1c0ea9e90c9910152b6815a3e9e79b82fef29cf939ea80a020c24fe30fe26118`
- Live `runId=3` audit tx: `0x8888ee04c7d527982390b5b6237c4ccf3dd6b1d26a28de28cf4b356291be35d4`
- Proof JSON: https://smmyth.github.io/clawguard-ai-wallets-demo/proofs/generated/run-3-allowed.json
- Mantle Explorer shows `Contract: Verified` for both contracts.
- Sourcify full-match verification exists for both contracts on chain `5003`.
- Demo video: https://smmyth.github.io/clawguard-ai-wallets-demo/submission/clawguard-demo.webm

## Product Wedge

Start as a trust receipt for RealClaw-style AI wallet agents. Expand into a policy and evidence layer for agent marketplaces, custody-adjacent tools, testnet competitions, and eventually production wallet-agent workflows.

## Honest Claims

Safe to claim:

- ClawGuard is deployed on Mantle Sepolia.
- The runner audited a live request and recorded `RunAudited`.
- The public frontend shows policy, instruction, verdict, proof, and explorer links.
- The contracts are verified on Mantle Explorer and Sourcify full-match verified.

Do not claim:

- Production Byreal/RealClaw integration.
- Mainnet custody.
- OpenAI rationale unless the optional key-backed path is exercised.
- Successful Hardhat Etherscan-style API verification, because the explorer API returned HTML/503 earlier even though the public explorer UI now shows verified contracts.

## Prize Fit

- 20 Project Deployment Award: strongest fit; deployed contracts, verified source, public app, live receipt, public video, and README evidence.
- Agentic Economy: adjacent fit as a trust layer for RealClaw-style AI wallet workflows; do not present it as a production Byreal/RealClaw core-capability integration unless that integration is added.
- AI DevTools: a receipt/audit layer developers can integrate into agent runners.
- UI/UX: first screen is the product workflow, with replay and wallet modes.
- Community Voting: clear story: would you trust an AI wallet, and where is the proof?
