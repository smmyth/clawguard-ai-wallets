# DoraHacks Final Submission Checklist

Source reviewed: `C:\Users\smmyt\Downloads\The Turing Test Hackathon 2026 _ Hackathon _ DoraHacks3.pdf`

PDF snapshot timestamp: 2026-06-08 18:35

## Recommended Prize Target

Primary target: 20 Project Deployment Award.

Secondary targets: Best UI/UX and Community Voting.

Use Agentic Economy only as an adjacent narrative unless a real Byreal Agent Skills, Byreal Perps CLI, or RealClaw core-capability integration is added.

## 20 Project Deployment Award

- Smart contract deployed on Mantle Mainnet or Testnet: yes, Mantle Sepolia chain `5003`.
- Contract verified on Mantle Explorer: yes, both deployed contracts show `Contract: Verified`.
- At least one AI-powered function callable on-chain: yes, `requestRun` creates the on-chain trigger and the runner writes `recordAuditResult` on-chain.
- Frontend demo publicly accessible, not localhost: yes.
- Deployment address ready for DoraHacks submission: yes.
- Demo video at least 2 minutes: yes, local WebM metadata shows `127.48` seconds.
- Open-source GitHub repo with README, setup, architecture, and deployed addresses: yes.

## Public Links

- Public app: https://smmyth.github.io/clawguard-ai-wallets-demo/
- Source repo: https://github.com/smmyth/clawguard-ai-wallets
- Demo video: https://smmyth.github.io/clawguard-ai-wallets-demo/submission/clawguard-demo.webm
- Public proof JSON: https://smmyth.github.io/clawguard-ai-wallets-demo/proofs/generated/run-3-allowed.json

## Deployment Evidence

- `AgentRegistry`: `0x12c186925ab7f8ad88a322ee057E4A68e22c88A8`
- `AgentRunLedger`: `0x6b349c752661Fdf085e48053E3186742b3a0D4d2`
- Live request tx: `0x1c0ea9e90c9910152b6815a3e9e79b82fef29cf939ea80a020c24fe30fe26118`
- Live audit tx: `0x8888ee04c7d527982390b5b6237c4ccf3dd6b1d26a28de28cf4b356291be35d4`
- Live audit block: `39703513`
- Live `runId=3`: status `1` audited, verdict `1` allowed, risk score `24`.

## Submission Text

One-liner:

ClawGuard turns AI wallet decisions into Mantle Sepolia trust receipts: policy in, AI audit verdict out, proof anchored on-chain.

Short pitch:

ClawGuard is a trust receipt layer for AI wallet agents. A Personal CFO-style agent submits an instruction, an audit runner checks it against a declared policy and tool inventory, and `AgentRunLedger` records the audit result on Mantle Sepolia. The public demo shows the full receipt path: policy, instruction, AI verdict, risk score, proof JSON, and explorer links.

Safe claims:

- Deployed on Mantle Sepolia.
- Contracts verified on Mantle Explorer and Sourcify full-match verified.
- Live runner wrote an AI audit result on-chain.
- Public frontend, public video, public proof JSON, and open-source repo are available.

Do not claim:

- Production Byreal/RealClaw integration.
- Mantle mainnet custody.
- RWA functionality.
- Alpha/Data track fit based on Mantle on-chain data as a core data source.
- Final DoraHacks submission acceptance until the form is actually submitted in the DoraHacks UI.

## Track Fit

- 20 Project Deployment Award: requirements met by available evidence.
- Best UI/UX: frontend and public video requirements met.
- Community Voting: eligible after DoraHacks submission; winning requires campaign execution.
- Agentic Economy First Prize: not fully met as implemented because the PDF asks for genuine Byreal Agent Skills, Byreal Perps CLI, or RealClaw core-capability use.
- Alpha & Data First Prize: not met as implemented because Mantle on-chain data is not the core AI data source.
- AI & RWA First Prize: not met as implemented because the product does not involve Real World Assets.
