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

Click `Run trust check` in replay mode.

Narration:

The agent asks for a low-risk earning action. ClawGuard turns that request into a receipt flow: request, audit, receipt, explorer.

## 0:55-1:15

Show the verdict panel and receipt timeline.

Narration:

The policy audit verdict is Allowed with risk score 24. The rationale is deterministic and can optionally be rewritten through OpenAI when a key is configured, but the fallback is always available.

## 1:15-1:35

Open or point to the Mantle explorer links.

Narration:

The public demo uses the real Mantle Sepolia ledger contract. The live run is `runId=4`, with a real request transaction and a real audit transaction.

## 1:35-1:50

Show the public proof JSON.

Narration:

The proof JSON records the agent, instruction, policy, capabilities, verdict, risk score, rationale, and timestamp. The ledger stores the proof URI and audit hash.

## 1:50-2:05

Close with deployment evidence.

Narration:

The contracts are deployed on Mantle Sepolia chain 5003 and verified on Mantle Explorer, with Sourcify full match as additional evidence. ClawGuard is not claiming production custody. It is a focused trust receipt layer for wallet agents, ready to integrate with RealClaw-style workflows.

## Links To Show

- Public app: https://smmyth.github.io/clawguard-ai-wallets-demo/
- Ledger: https://explorer.sepolia.mantle.xyz/address/0x6b349c752661Fdf085e48053E3186742b3a0D4d2
- Request tx: https://explorer.sepolia.mantle.xyz/tx/0x856a67915f7457e9d822b9338ee6f8ea8d64838a43813d81c100ac68f044e83f
- Audit tx: https://explorer.sepolia.mantle.xyz/tx/0x10a4bf4c55f578b254c0b1fd8b0a906cd42937cfd3f6ddd5ec179304af57adbf
- Proof JSON: https://smmyth.github.io/clawguard-ai-wallets-demo/proofs/generated/run-4-allowed.json
