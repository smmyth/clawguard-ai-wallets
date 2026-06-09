# DoraHacks Final Submission Checklist

Source reviewed: `C:\Users\smmyt\Downloads\The Turing Test Hackathon 2026 _ Hackathon _ DoraHacks3.pdf`

PDF snapshot timestamp: 2026-06-08 18:35

## Recommended Prize Target

Primary target: 20 Project Deployment Award.

Secondary targets: Best UI/UX, AI DevTools, and Community Voting.

Use Agentic Economy only as an adjacent narrative unless a real Byreal Agent Skills, Byreal Perps CLI, or RealClaw core-capability integration is added.

## 20 Project Deployment Award

- Smart contract deployed on Mantle Mainnet or Testnet: yes, Mantle Sepolia chain `5003`.
- Contract source verification: V2 contracts are Sourcify full-match verified on Mantle Sepolia chain `5003`. The Mantle explorer address pages are public; the Etherscan-style API returned HTML instead of JSON during Hardhat verification, so do not claim successful Etherscan-style API verification for V2.
- At least one AI-agent audit workflow connected to on-chain calls: yes, `requestRun` creates the on-chain trigger, the runner writes `recordAuditResult`, the runner finalizes the action commitment, and `AgentWallet.executeAction` releases testnet value only after the finalized receipt. The current public receipt uses the deterministic policy engine; model-backed rationale is optional and should only be claimed when `OPENAI_API_KEY` is exercised.
- Frontend demo publicly accessible, not localhost: yes.
- Deployment address ready for DoraHacks submission: yes.
- Demo video at least 2 minutes: yes, local WebM metadata shows `127.48` seconds.
- Open-source GitHub repo with README, setup, architecture, and deployed addresses: yes.

## Public Links

- Public app: https://smmyth.github.io/clawguard-ai-wallets-demo/
- Source repo: https://github.com/smmyth/clawguard-ai-wallets
- Deployed static build repo: https://github.com/smmyth/clawguard-ai-wallets-demo
- Demo video: https://smmyth.github.io/clawguard-ai-wallets-demo/submission/clawguard-demo.webm
- Public final proof JSON: https://smmyth.github.io/clawguard-ai-wallets-demo/proofs/generated/run-1-allowed-v2-final.json

## Deployment Evidence

- `AgentRegistry`: `0x6245caE82a9Cb257Ae3c7a70D633c1b35E071464`
- `AgentRunLedgerV2`: `0x572875Be3DDf633169Ff5A5162eB435ba4113e64`
- `AgentWallet`: `0xe29f4883FaFc657CD21F09fCc6BbF41876Eb97d0`
- Live request tx: `0x3630f0fa2a537ebb5ccb6b588af9daa5edcfceb9f579d4f1299192f8e8c295c8`
- Live audit tx: `0x93535d135b081c584c4d3d63341c7fc0a873745daa5ed3f2441d375d603fbfce`
- Live finalize tx: `0x6210b44d229110db8f1cc7067778b18647799c48deb9f1b06a828c4b92889cb9`
- Live execution tx: `0x3b8bfda7ab32cae841bba4718f8af214ce6e6bb6a83b11bf6a8132fe19b76ff5`
- Live audit proof hash: `0x8ef4c30ba89b0971233615dbc6188171f4e905eb7a99aff425c6eeb4704604a7`
- Live final proof hash: `0x1e785ac40c8eb575fdba871ec7602c8ef983a643ef72b644a1aa2e3c3883212b`
- Live action hash: `0x9adf4e5e334b02df1f1958dbf012aed611d3f39e5841d2fd10907550dfb69e61`
- Live V2 `runId=1`: status `2` finalized, verdict `1` allowed, risk score `24`.

## Submission Text

One-liner:

ClawGuard turns AI wallet decisions into Mantle Sepolia trust receipts: policy in, policy audit verdict out, proof anchored on-chain.

Short pitch:

ClawGuard is a trust receipt layer for AI wallet agents. A Personal CFO-style agent submits an instruction, an audit runner checks it against a declared policy and tool inventory, `AgentRunLedgerV2` records the policy audit result on Mantle Sepolia, and `AgentWallet` executes only after a finalized receipt commits to the action. The public demo shows the full receipt path: policy, instruction, policy audit verdict, risk score, proof JSON, explorer links, and gated execution evidence.

Safe claims:

- Deployed on Mantle Sepolia.
- V2 contracts Sourcify full-match verified.
- Live runner wrote a policy audit result on-chain, finalized it, and AgentWallet executed the committed action.
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
