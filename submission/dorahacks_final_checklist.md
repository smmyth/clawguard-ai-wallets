# DoraHacks Final Submission Checklist

Source reviewed: `C:\Users\smmyt\Downloads\The Turing Test Hackathon 2026 _ Hackathon _ DoraHacks3.pdf`

PDF snapshot timestamp: 2026-06-08 18:35

## Recommended Prize Target

Primary target: 20 Project Deployment Award.

Secondary targets: Best UI/UX, AI DevTools, and Community Voting.

Use Agentic Economy only as an adjacent narrative unless a real Byreal Agent Skills, Byreal Perps CLI, or RealClaw core-capability integration is added.

## 20 Project Deployment Award

- Smart contract deployed on Mantle Mainnet or Testnet: yes, Mantle Sepolia chain `5003`.
- Contract verified on Mantle Explorer: yes, both deployed contracts show `Contract: Verified`.
- At least one AI-agent audit workflow connected to on-chain calls: yes, `requestRun` creates the on-chain trigger and the runner writes `recordAuditResult` on-chain. The current public receipt uses the deterministic policy engine; model-backed rationale is optional and should only be claimed when `OPENAI_API_KEY` is exercised.
- Frontend demo publicly accessible, not localhost: yes.
- Deployment address ready for DoraHacks submission: yes.
- Demo video at least 2 minutes: yes, local WebM metadata shows `127.48` seconds.
- Open-source GitHub repo with README, setup, architecture, and deployed addresses: yes.

## Public Links

- Public app: https://smmyth.github.io/clawguard-ai-wallets-demo/
- Source repo: https://github.com/smmyth/clawguard-ai-wallets
- Deployed static build repo: https://github.com/smmyth/clawguard-ai-wallets-demo
- Demo video: https://smmyth.github.io/clawguard-ai-wallets-demo/submission/clawguard-demo.webm
- Public proof JSON: https://smmyth.github.io/clawguard-ai-wallets-demo/proofs/generated/run-4-allowed.json

## Deployment Evidence

- `AgentRegistry`: `0x12c186925ab7f8ad88a322ee057E4A68e22c88A8`
- `AgentRunLedger`: `0x6b349c752661Fdf085e48053E3186742b3a0D4d2`
- Live request tx: `0x856a67915f7457e9d822b9338ee6f8ea8d64838a43813d81c100ac68f044e83f`
- Live request block: `39710840`
- Live audit tx: `0x10a4bf4c55f578b254c0b1fd8b0a906cd42937cfd3f6ddd5ec179304af57adbf`
- Live audit block: `39710846`
- Live proof hash: `0x1d8c356529b185fa064176dedfe393ae007f7d17197067bfddb77d5cdefecfd3`
- Live `runId=4`: status `1` audited, verdict `1` allowed, risk score `24`.

## Submission Text

One-liner:

ClawGuard turns AI wallet decisions into Mantle Sepolia trust receipts: policy in, policy audit verdict out, proof anchored on-chain.

Short pitch:

ClawGuard is a trust receipt layer for AI wallet agents. A Personal CFO-style agent submits an instruction, an audit runner checks it against a declared policy and tool inventory, and `AgentRunLedger` records the policy audit result on Mantle Sepolia. The public demo shows the full receipt path: policy, instruction, policy audit verdict, risk score, proof JSON, and explorer links.

Safe claims:

- Deployed on Mantle Sepolia.
- Contracts verified on Mantle Explorer and Sourcify full-match verified.
- Live runner wrote a policy audit result on-chain.
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
- AI DevTools: eligible as a receipt/audit layer developers can integrate into agent runners.
- Community Voting: eligible after DoraHacks submission; winning requires campaign execution.
- Agentic Economy First Prize: not fully met as implemented because the PDF asks for genuine Byreal Agent Skills, Byreal Perps CLI, or RealClaw core-capability use.
- Alpha & Data First Prize: not met as implemented because Mantle on-chain data is not the core AI data source.
- AI & RWA First Prize: not met as implemented because the product does not involve Real World Assets.
