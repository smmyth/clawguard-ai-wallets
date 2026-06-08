# ClawGuard

ClawGuard is a Mantle Sepolia trust receipt layer for AI wallet agents. It records an agent policy, an instruction hash, an AI audit verdict, and a proof URI so users can inspect what an autonomous wallet agent was allowed to do and where the evidence lives on-chain.

## Public Demo

- Frontend: https://smmyth.github.io/clawguard-ai-wallets-demo/
- Public repo for the deployed static build: https://github.com/smmyth/clawguard-ai-wallets-demo
- Demo video: `submission/clawguard-demo.webm`
- Demo video duration: 127.48 seconds

## Mantle Sepolia Deployment

- Chain ID: `5003`
- RPC: `https://rpc.sepolia.mantle.xyz`
- Explorer: `https://explorer.sepolia.mantle.xyz`
- Deployer / burner: `0x691c43F065bbf7bFA692BeE5a2D865f81028Ed3A`
- Faucet tx: https://explorer.sepolia.mantle.xyz/tx/0x4b529efac6b8ff6f39b7fc469ca8994f29834de9b8323cbf144df845b41b8d90

Contracts:

- `AgentRegistry`: `0x12c186925ab7f8ad88a322ee057E4A68e22c88A8`
- Registry explorer: https://explorer.sepolia.mantle.xyz/address/0x12c186925ab7f8ad88a322ee057E4A68e22c88A8
- Registry Sourcify full match: https://repo.sourcify.dev/contracts/full_match/5003/0x12c186925ab7f8ad88a322ee057E4A68e22c88A8/
- `AgentRunLedger`: `0x6b349c752661Fdf085e48053E3186742b3a0D4d2`
- Ledger explorer: https://explorer.sepolia.mantle.xyz/address/0x6b349c752661Fdf085e48053E3186742b3a0D4d2
- Ledger Sourcify full match: https://repo.sourcify.dev/contracts/full_match/5003/0x6b349c752661Fdf085e48053E3186742b3a0D4d2/

Live receipt proof:

- `agentId`: `3`
- `runId`: `3`
- Register tx: https://explorer.sepolia.mantle.xyz/tx/0x36f5dbc6aa5e19119b223a2d5a2bb1890a1ad7204aeeb4d5b2d8902db32c9c30
- Request tx: https://explorer.sepolia.mantle.xyz/tx/0x1c0ea9e90c9910152b6815a3e9e79b82fef29cf939ea80a020c24fe30fe26118
- Audit tx: https://explorer.sepolia.mantle.xyz/tx/0x8888ee04c7d527982390b5b6237c4ccf3dd6b1d26a28de28cf4b356291be35d4
- On-chain status: `1` (`Audited`)
- On-chain verdict: `1` (`Allowed`)
- Risk score: `24`
- Proof URI: `/proofs/generated/run-3-allowed.json`
- Public proof JSON: https://smmyth.github.io/clawguard-ai-wallets-demo/proofs/generated/run-3-allowed.json

Note: both contracts are visible as verified contracts on the Mantle Sepolia explorer, and both also have Sourcify full-match verification for chain `5003`.

## Architecture

```mermaid
flowchart LR
  U["User"] --> W["ClawGuard Web"]
  W --> L["AgentRunLedger"]
  L --> R["Runner"]
  R --> A["Policy + AI Audit"]
  A --> P["Proof JSON"]
  R --> L
  L --> E["Mantle Explorer"]
```

## Packages

- `contracts`: Hardhat, `AgentRegistry`, `AgentRunLedger`, tests, deployment and verification scripts.
- `services/runner`: event polling listener, deterministic audit, optional OpenAI rationale, proof writer.
- `web`: React/Vite app with replay mode, wallet mode, policy panel, verdict panel, receipt timeline, and explorer links.
- `submission`: pitch pack, demo script, and generated demo video.
- `docs`: deployment evidence and operational notes.

## Local Setup

```powershell
npm install
npm test
npm run build
```

Run the frontend:

```powershell
npm run dev:web -- --port 5173
```

Run the deterministic runner demo without chain access:

```powershell
npm run demo:runner
```

Run the live runner against Mantle Sepolia:

```powershell
$env:RUNNER_POLLING_MS="5000"
npm run dev -w runner
```

The runner uses `eth_getLogs` polling instead of long-lived JSON-RPC filters because the Mantle public RPC returned `filter not found` for `eth_getFilterChanges` during live testing.

## Environment

Copy `.env.example` to `.env` and set:

- `MANTLE_RPC_URL`
- `PRIVATE_KEY`
- `AGENT_REGISTRY_ADDRESS`
- `AGENT_RUN_LEDGER_ADDRESS`
- optional `OPENAI_API_KEY`

Do not commit `.env`. The repository uses a local burner key only for testnet deployment and demo transactions.

## Submission Claim Rules

Safe claims:

- "ClawGuard demonstrates a trust receipt layer for RealClaw-style AI wallet agents."
- "Contracts are deployed on Mantle Sepolia."
- "Contract source is verified on Mantle Explorer and Sourcify with full match for chain `5003`."
- "A live `RunRequested` event was audited by the runner and recorded through `RunAudited`."
- "The public frontend links to the Mantle receipt and proof JSON."

Do not claim:

- A production Byreal/RealClaw integration.
- Custody of user funds.
- Mainnet deployment.
- OpenAI-generated rationale unless `OPENAI_API_KEY` is actually configured and exercised.

## Dependency Audit Note

`npm audit --omit=dev --omit=optional` reports two moderate findings from `ethers@6.16.0` pinning `ws@8.17.1`. The npm-recommended fix downgrades to `ethers@5.8.0`, which would break the v6 BrowserProvider and contract-client code. Keep this as a known dependency risk unless the project migrates to a patched ethers release or a different client library.
