# Deployment Evidence

Date: 2026-06-08

## Network

- Chain: Mantle Sepolia
- Chain ID: `5003`
- RPC used: `https://rpc.sepolia.mantle.xyz`
- Explorer: `https://explorer.sepolia.mantle.xyz`

## Burner Wallet

- Address: `0x691c43F065bbf7bFA692BeE5a2D865f81028Ed3A`
- Funding source: HackQuest Mantle Sepolia faucet
- Faucet tx: `0x4b529efac6b8ff6f39b7fc469ca8994f29834de9b8323cbf144df845b41b8d90`
- Faucet link: https://explorer.sepolia.mantle.xyz/tx/0x4b529efac6b8ff6f39b7fc469ca8994f29834de9b8323cbf144df845b41b8d90

## Contracts

### AgentRegistry

- Address: `0x12c186925ab7f8ad88a322ee057E4A68e22c88A8`
- Explorer: https://explorer.sepolia.mantle.xyz/address/0x12c186925ab7f8ad88a322ee057E4A68e22c88A8
- Sourcify full match: https://repo.sourcify.dev/contracts/full_match/5003/0x12c186925ab7f8ad88a322ee057E4A68e22c88A8/

### AgentRunLedger

- Address: `0x6b349c752661Fdf085e48053E3186742b3a0D4d2`
- Explorer: https://explorer.sepolia.mantle.xyz/address/0x6b349c752661Fdf085e48053E3186742b3a0D4d2
- Sourcify full match: https://repo.sourcify.dev/contracts/full_match/5003/0x6b349c752661Fdf085e48053E3186742b3a0D4d2/

## Live Runner Receipt

- `agentId`: `3`
- `runId`: `3`
- Register tx: `0x36f5dbc6aa5e19119b223a2d5a2bb1890a1ad7204aeeb4d5b2d8902db32c9c30`
- Request tx: `0x1c0ea9e90c9910152b6815a3e9e79b82fef29cf939ea80a020c24fe30fe26118`
- Audit tx: `0x8888ee04c7d527982390b5b6237c4ccf3dd6b1d26a28de28cf4b356291be35d4`
- Audit tx block: `39703513`
- Ledger status: `1` (`Audited`)
- Verdict: `1` (`Allowed`)
- Risk score: `24`
- Audit proof hash: `0xe43a2bd16dead1dddf3c64dfbd4e136ea94085d29bd27bb43a712a54f1db1644`
- Audit proof URI: `/proofs/generated/run-3-allowed.json`
- Public proof: https://smmyth.github.io/clawguard-ai-wallets-demo/proofs/generated/run-3-allowed.json

Runner stdout from the clean run:

```text
Watching AgentRunLedger from block 39703496 with getLogs polling...
RunRequested runId=3 agentId=3 requester=0x691c43F065bbf7bFA692BeE5a2D865f81028Ed3A
Audit recorded: 0x8888ee04c7d527982390b5b6237c4ccf3dd6b1d26a28de28cf4b356291be35d4
```

Runner stderr from the clean run was empty.

## Public Frontend

- URL: https://smmyth.github.io/clawguard-ai-wallets-demo/
- Static build repo: https://github.com/smmyth/clawguard-ai-wallets-demo
- GitHub Pages status observed as `built`.
- HTML, CSS, JS, and proof JSON returned HTTP `200`.

## Verification Caveat

Hardhat verification against the Mantle explorer Etherscan-style endpoint returned HTML/503 responses, so the contracts are documented as Sourcify full-match verified. Do not claim successful Etherscan-style explorer API verification unless the explorer endpoint is retried and confirmed later.
