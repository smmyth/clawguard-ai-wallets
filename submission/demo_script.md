# ClawGuard Demo Script

Target length: 2 minutes.

## 0:00-0:15

Open the public app.

Narration:

ClawGuard is a trust receipt layer for AI wallet agents. The question is simple: would you trust this AI wallet, and where is the proof?

## 0:15-0:35

Show the Personal CFO Agent, the active policy, and the instruction field.

Narration:

This agent has an explicit policy: maximum risk 40, network access allowed, shell access forbidden, and high-slippage or unknown-contract actions blocked.

## 0:35-0:55

Click `Run trust check` in live receipt replay.

Narration:

The agent asks for a low-risk earning action. This public replay follows the already-recorded Mantle receipt flow: request, audit, proof, explorer, and gated execution.

## 0:55-1:15

Show the verdict panel, receipt timeline, and AgentWallet panel.

Narration:

The policy audit verdict is Allowed with risk score 24. The current public receipt uses the deterministic guardrail audit; the repo includes a `prize:model-run` command that refuses fallback and publishes a model-backed OpenAI proof only after a real API call succeeds. The AgentWallet panel shows the committed action hash and execution evidence.

## 1:15-1:35

Open or point to the Mantle explorer links.

Narration:

The public demo uses real Mantle Sepolia contracts. The live V2 run is `runId=1`, with a real request transaction, audit transaction, finalization transaction, and AgentWallet execution transaction.

## 1:35-1:50

Show the public proof JSON and mention the verifier.

Narration:

The final proof JSON records the agent, instruction, policy, capabilities, verdict, risk score, rationale, trace, and action plan. The ledger stores the audit hash, final proof URI, and action hash that AgentWallet checks before releasing testnet value. Developers can reproduce the audit cases and proof action hash with `npm run verify-proof`.

## 1:50-2:05

Close with deployment evidence.

Narration:

The contracts are deployed on Mantle Sepolia chain 5003, with Sourcify full-match verification for the V2 contracts. ClawGuard is not claiming production custody. It is a focused trust receipt and gated-execution layer for wallet agents, ready to integrate with RealClaw-style workflows.

## Links To Show

- Public app: https://smmyth.github.io/clawguard-ai-wallets-demo/
- Ledger V2: https://explorer.sepolia.mantle.xyz/address/0x572875Be3DDf633169Ff5A5162eB435ba4113e64
- AgentWallet: https://explorer.sepolia.mantle.xyz/address/0xe29f4883FaFc657CD21F09fCc6BbF41876Eb97d0
- Request tx: https://explorer.sepolia.mantle.xyz/tx/0x3630f0fa2a537ebb5ccb6b588af9daa5edcfceb9f579d4f1299192f8e8c295c8
- Audit tx: https://explorer.sepolia.mantle.xyz/tx/0x93535d135b081c584c4d3d63341c7fc0a873745daa5ed3f2441d375d603fbfce
- Finalize tx: https://explorer.sepolia.mantle.xyz/tx/0x6210b44d229110db8f1cc7067778b18647799c48deb9f1b06a828c4b92889cb9
- Execute tx: https://explorer.sepolia.mantle.xyz/tx/0x3b8bfda7ab32cae841bba4718f8af214ce6e6bb6a83b11bf6a8132fe19b76ff5
- Final proof JSON: https://smmyth.github.io/clawguard-ai-wallets-demo/proofs/generated/run-1-allowed-v2-final.json
