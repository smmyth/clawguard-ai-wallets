# DoraHacks Form Payload

## Project Name

ClawGuard for AI Wallets

## One-Line Pitch

ClawGuard turns AI wallet decisions into Mantle Sepolia trust receipts: policy in, policy audit verdict out, proof anchored on-chain.

## Project Description

ClawGuard is a trust receipt layer for AI wallet agents. A Personal CFO-style agent submits an instruction, an audit runner checks it against a declared policy and tool inventory, `AgentRunLedgerV2` records the policy audit result on Mantle Sepolia, and the `AgentWallet.executeAction` path only releases testnet value after the finalized receipt commits to the exact recipient and amount. The wallet keeps an owner-only sweep recovery path for leftover testnet balance. The public demo shows the full receipt path: policy, instruction, policy audit verdict, risk score, final proof JSON, explorer links, and gated execution evidence.

The repo also includes a reproducible DevTool verifier: `npm run verify-proof` checks allowed, warning, and blocked policy cases, parses the public final proof, and recomputes the committed action hash. The next model-backed run path is `npm run prize:model-run`, which requires a real `OPENAI_API_KEY` and refuses to publish if the OpenAI call falls back.

## Public Demo

https://smmyth.github.io/clawguard-ai-wallets-demo/

## Source Repo

https://github.com/smmyth/clawguard-ai-wallets

## Deployed Static Build Repo

https://github.com/smmyth/clawguard-ai-wallets-demo

## Demo Video

https://smmyth.github.io/clawguard-ai-wallets-demo/submission/clawguard-demo.webm

## Deployed Contracts

- AgentRegistry: `0x6245caE82a9Cb257Ae3c7a70D633c1b35E071464`
- AgentRunLedgerV2: `0x572875Be3DDf633169Ff5A5162eB435ba4113e64`
- AgentWallet: `0xe29f4883FaFc657CD21F09fCc6BbF41876Eb97d0`

## Mantle Explorer Links

- Registry: https://explorer.sepolia.mantle.xyz/address/0x6245caE82a9Cb257Ae3c7a70D633c1b35E071464
- Ledger V2: https://explorer.sepolia.mantle.xyz/address/0x572875Be3DDf633169Ff5A5162eB435ba4113e64
- AgentWallet: https://explorer.sepolia.mantle.xyz/address/0xe29f4883FaFc657CD21F09fCc6BbF41876Eb97d0
- Live request tx: https://explorer.sepolia.mantle.xyz/tx/0x3630f0fa2a537ebb5ccb6b588af9daa5edcfceb9f579d4f1299192f8e8c295c8
- Live audit tx: https://explorer.sepolia.mantle.xyz/tx/0x93535d135b081c584c4d3d63341c7fc0a873745daa5ed3f2441d375d603fbfce
- Live finalize tx: https://explorer.sepolia.mantle.xyz/tx/0x6210b44d229110db8f1cc7067778b18647799c48deb9f1b06a828c4b92889cb9
- Live execution tx: https://explorer.sepolia.mantle.xyz/tx/0x3b8bfda7ab32cae841bba4718f8af214ce6e6bb6a83b11bf6a8132fe19b76ff5
- Public final proof: https://smmyth.github.io/clawguard-ai-wallets-demo/proofs/generated/run-1-allowed-v2-final.json

## Prize Selection

Primary: 20 Project Deployment Award

Secondary: Best UI/UX, AI DevTools, Community Voting

Do not select Agentic Economy unless the Byreal integration evidence file exists and contains a successful command output from Byreal Agent Skills, Byreal Perps CLI, or RealClaw.
