# Deployment Evidence

Date: 2026-06-09

## Network

- Chain: Mantle Sepolia
- Chain ID: `5003`
- RPC used: `https://rpc.sepolia.mantle.xyz`
- Explorer: https://explorer.sepolia.mantle.xyz

## Burner Wallet

- Address: `0x691c43F065bbf7bFA692BeE5a2D865f81028Ed3A`
- Funding source: HackQuest Mantle Sepolia faucet
- Faucet tx: `0x4b529efac6b8ff6f39b7fc469ca8994f29834de9b8323cbf144df845b41b8d90`
- Faucet link: https://explorer.sepolia.mantle.xyz/tx/0x4b529efac6b8ff6f39b7fc469ca8994f29834de9b8323cbf144df845b41b8d90

## Current V2 Contracts

### AgentRegistry

- Address: `0x6245caE82a9Cb257Ae3c7a70D633c1b35E071464`
- Explorer: https://explorer.sepolia.mantle.xyz/address/0x6245caE82a9Cb257Ae3c7a70D633c1b35E071464
- Sourcify full match: https://repo.sourcify.dev/contracts/full_match/5003/0x6245caE82a9Cb257Ae3c7a70D633c1b35E071464/

### AgentRunLedgerV2

- Address: `0x572875Be3DDf633169Ff5A5162eB435ba4113e64`
- Explorer: https://explorer.sepolia.mantle.xyz/address/0x572875Be3DDf633169Ff5A5162eB435ba4113e64
- Sourcify full match: https://repo.sourcify.dev/contracts/full_match/5003/0x572875Be3DDf633169Ff5A5162eB435ba4113e64/

### AgentWallet

- Address: `0xe29f4883FaFc657CD21F09fCc6BbF41876Eb97d0`
- Explorer: https://explorer.sepolia.mantle.xyz/address/0xe29f4883FaFc657CD21F09fCc6BbF41876Eb97d0
- Sourcify full match: https://repo.sourcify.dev/contracts/full_match/5003/0xe29f4883FaFc657CD21F09fCc6BbF41876Eb97d0/

Verification note: Hardhat reported successful Sourcify verification for all three V2 contracts. The Mantle explorer Etherscan-style API returned HTML instead of JSON during the same commands, so the V2 claim is Sourcify full-match verification plus public Mantle explorer visibility, not successful Etherscan-style API verification.

## Live V2 Gated Execution

- `agentId`: `1`
- `runId`: `1`
- Recipient: `0x691c43F065bbf7bFA692BeE5a2D865f81028Ed3A`
- Amount: `1000000000000000` wei
- AgentWallet funding tx: `0xd5e17f814d1edeb54c5965073e3746361bc856a5ed90664f7a76917bb5025713`
- Request tx: `0x3630f0fa2a537ebb5ccb6b588af9daa5edcfceb9f579d4f1299192f8e8c295c8`
- Audit tx: `0x93535d135b081c584c4d3d63341c7fc0a873745daa5ed3f2441d375d603fbfce`
- Finalize tx: `0x6210b44d229110db8f1cc7067778b18647799c48deb9f1b06a828c4b92889cb9`
- Execute tx: `0x3b8bfda7ab32cae841bba4718f8af214ce6e6bb6a83b11bf6a8132fe19b76ff5`
- Ledger status: `2` (`Finalized`)
- Verdict: `1` (`Allowed`)
- Risk score: `24`
- Action hash: `0x9adf4e5e334b02df1f1958dbf012aed611d3f39e5841d2fd10907550dfb69e61`
- Audit proof URI: `/proofs/generated/run-1-allowed-v2.json`
- Audit proof hash: `0x8ef4c30ba89b0971233615dbc6188171f4e905eb7a99aff425c6eeb4704604a7`
- Final proof URI: `/proofs/generated/run-1-allowed-v2-final.json`
- Final proof hash: `0x1e785ac40c8eb575fdba871ec7602c8ef983a643ef72b644a1aa2e3c3883212b`
- Public final proof: https://smmyth.github.io/clawguard-ai-wallets-demo/proofs/generated/run-1-allowed-v2-final.json

## Historical V1 Receipt

The earlier receipt-only deployment remains useful as historical evidence but is no longer the strongest submission path.

- `AgentRegistry`: `0x12c186925ab7f8ad88a322ee057E4A68e22c88A8`
- `AgentRunLedger`: `0x6b349c752661Fdf085e48053E3186742b3a0D4d2`
- `runId=4` audit tx: `0x10a4bf4c55f578b254c0b1fd8b0a906cd42937cfd3f6ddd5ec179304af57adbf`
- Public proof: https://smmyth.github.io/clawguard-ai-wallets-demo/proofs/generated/run-4-allowed.json

## Public Frontend

- URL: https://smmyth.github.io/clawguard-ai-wallets-demo/
- Deployed static build repo: https://github.com/smmyth/clawguard-ai-wallets-demo
- Demo video: https://smmyth.github.io/clawguard-ai-wallets-demo/submission/clawguard-demo.webm
