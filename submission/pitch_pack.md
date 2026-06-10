# ClawGuard Pitch Pack

## One-Liner

ClawGuard turns AI wallet decisions into Mantle Sepolia trust receipts: policy in, policy audit verdict out, proof anchored on-chain.

## Problem

AI wallet agents ask users for trust, but users usually see only the final action. They do not get a durable answer to: what policy governed this agent, what did it request, what did the audit decide, and where is the proof?

## Solution

ClawGuard is a receipt layer for wallet agents. A Personal CFO-style agent submits an instruction, the runner audits it against a declared policy and tool inventory, `AgentRunLedgerV2` records the policy audit result on Mantle Sepolia, and the `AgentWallet.executeAction` path releases testnet value only when the finalized receipt commits to the exact action. The owner-only sweep function is a testnet recovery path, not the agent execution path.

## Why Mantle

The demo uses Mantle Sepolia chain `5003` for public, low-cost trust receipts. The receipt is not a UI-only state: `RunRequested`, `RunAudited`, `RunFinalized`, and `ActionExecuted` are emitted and inspectable through the Mantle explorer.

## Demo Evidence

- Public app: https://smmyth.github.io/clawguard-ai-wallets-demo/
- Source repo: https://github.com/smmyth/clawguard-ai-wallets
- Deployed static build repo: https://github.com/smmyth/clawguard-ai-wallets-demo
- `AgentRegistry`: `0x6245caE82a9Cb257Ae3c7a70D633c1b35E071464`
- `AgentRunLedgerV2`: `0x572875Be3DDf633169Ff5A5162eB435ba4113e64`
- `AgentWallet`: `0xe29f4883FaFc657CD21F09fCc6BbF41876Eb97d0`
- Live V2 `runId=1` request tx: `0x3630f0fa2a537ebb5ccb6b588af9daa5edcfceb9f579d4f1299192f8e8c295c8`
- Live V2 `runId=1` audit tx: `0x93535d135b081c584c4d3d63341c7fc0a873745daa5ed3f2441d375d603fbfce`
- Live V2 finalize tx: `0x6210b44d229110db8f1cc7067778b18647799c48deb9f1b06a828c4b92889cb9`
- Live V2 execution tx: `0x3b8bfda7ab32cae841bba4718f8af214ce6e6bb6a83b11bf6a8132fe19b76ff5`
- Final proof JSON: https://smmyth.github.io/clawguard-ai-wallets-demo/proofs/generated/run-1-allowed-v2-final.json
- Sourcify full-match verification exists for all three V2 contracts on chain `5003`.
- Demo video: https://smmyth.github.io/clawguard-ai-wallets-demo/submission/clawguard-demo.webm

## Product Wedge

Start as a trust receipt for RealClaw-style AI wallet agents. Expand into a policy and evidence layer for agent marketplaces, custody-adjacent tools, testnet competitions, and future production-grade wallet-agent workflows.

## PMF / GTM

Who uses it first:

- AI wallet teams that need a public receipt before an agent moves funds.
- Mantle builders adding agent actions to hackathon or testnet apps.
- Agent marketplaces that need portable trust badges for policy, tool inventory, verdicts, and outcomes.
- Wallet safety dashboards that want a proof URL instead of a private log.

How it grows:

- Free receipt viewer for public demos and community trust.
- SDK/API for agent runners to emit ClawGuard receipts.
- Paid monitoring for persistent policy baselines, alerting, and proof retention.
- Marketplace badge for agents with recent passing receipts.

## DevTool Evidence

`npm run verify-proof` is the reproducible developer gate. It checks allowed, warning, and blocked benchmark cases, parses the public final proof, and recomputes the committed action hash from recipient and amount.

`npm run prize:model-run` is the model-backed upgrade path. It requires a real `OPENAI_API_KEY`, refuses deterministic fallback, writes the OpenAI-backed proof JSON, records the proof hash on Mantle, and finalizes the action commitment.

## Honest Claims

Safe to claim:

- ClawGuard is deployed on Mantle Sepolia.
- The runner audited a live request, recorded `RunAudited`, finalized the run, and AgentWallet executed the committed action.
- The public frontend shows policy, instruction, verdict, proof, and explorer links.
- The V2 contracts are Sourcify full-match verified.
- The repo includes a reproducible DevTool verifier for allowed/warning/blocked policy behavior.

Do not claim:

- Production Byreal/RealClaw integration.
- Mainnet custody.
- OpenAI rationale unless the optional key-backed path is exercised.
- Successful Hardhat Etherscan-style API verification, because the Mantle explorer API returned HTML instead of JSON during V2 verification.

## Prize Fit

- 20 Project Deployment Award: strongest fit; deployed contracts, Sourcify full-match verification, public app, live finalized receipt, AgentWallet execution, public video, and README evidence.
- Secondary targets: Best UI/UX, AI DevTools, and Community Voting.
- Agentic Economy: do not select as a judged target unless `submission/byreal_evidence.md` contains successful Byreal Agent Skills, Byreal Perps CLI, or RealClaw evidence.
- AI DevTools: a receipt/audit layer developers can integrate into agent runners, with a reproducible `verify-proof` workflow.
- Best UI/UX: first screen is the product workflow, with live receipt replay and new wallet request mode.
- Community Voting: clear story: would you trust an AI wallet, and where is the proof?
