# ClawGuard DevTool Workflow

ClawGuard can be used as a small audit gate for AI wallet agents. The developer-facing loop is:

1. Define the agent policy in `services/runner/fixtures/sample-agent-policy.json`.
2. Define declared and observed capabilities in `services/runner/fixtures/sample-tool-inventory.json`.
3. Add expected cases to `services/runner/fixtures/devtool-benchmark.json`.
4. Run `npm run verify-proof`.
5. Publish the proof JSON and anchor its hash through `AgentRunLedgerV2.recordAuditResult`.

## What The Verifier Proves

`npm run verify-proof` currently checks three representative cases:

- allowed: low-risk earning action under policy;
- warning: high-slippage wallet behavior;
- blocked: command execution request while shell is forbidden.

It also parses the public final proof, recomputes the `actionHash` from recipient and amount, and prints the public proof hash. This gives judges and future integrators a reproducible way to test that the audit output is not only UI copy.

## Integration Contract

A new agent runner only needs to produce:

- `agentId`;
- instruction text or instruction hash;
- policy JSON;
- tool inventory JSON;
- audit verdict: `Allowed`, `Warning`, or `Blocked`;
- risk score from `0` to `100`;
- proof JSON URI.

The runner writes the proof hash to Mantle through `recordAuditResult`. If the run is allowed, it finalizes an `actionHash`; `AgentWallet.executeAction` then checks the finalized receipt before releasing testnet value.

## Model-Backed Runs

For judged demos that require visible model use, set `OPENAI_API_KEY` and run:

```powershell
npm run prize:model-run
```

The command fails if the OpenAI Responses call does not produce a model-backed rationale. That failure mode is deliberate: ClawGuard should never label a deterministic fallback as model-backed AI.
