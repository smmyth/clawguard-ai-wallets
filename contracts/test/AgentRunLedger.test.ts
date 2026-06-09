import { expect } from "chai";
import { ethers } from "hardhat";

describe("AgentRunLedger", function () {
  const policyHash = ethers.id("policy:v1");
  const capabilitiesHash = ethers.id("capabilities:v1");
  const instructionHash = ethers.id("Find a low-risk earning action under my policy.");
  const auditHash = ethers.id("audit:allowed:24");
  const actionHash = ethers.id("action:receipt");

  async function deployFixture() {
    const [owner, requester, auditor, other] = await ethers.getSigners();
    const Registry = await ethers.getContractFactory("AgentRegistry");
    const registry = await Registry.deploy();
    await registry.registerAgent("Personal CFO Agent", "ipfs://agent", policyHash, capabilitiesHash);

    const Ledger = await ethers.getContractFactory("AgentRunLedger");
    const ledger = await Ledger.deploy(await registry.getAddress());
    await ledger.setAuditor(auditor.address, true);
    return { registry, ledger, owner, requester, auditor, other };
  }

  it("records a run request and emits the on-chain trigger", async function () {
    const { ledger, requester } = await deployFixture();

    await expect(ledger.connect(requester).requestRun(1, instructionHash, "proofs/request-1.json"))
      .to.emit(ledger, "RunRequested")
      .withArgs(1n, 1n, requester.address, instructionHash, "proofs/request-1.json");

    const run = await ledger.getRun(1);
    expect(run.id).to.equal(1n);
    expect(run.agentId).to.equal(1n);
    expect(run.requester).to.equal(requester.address);
    expect(run.instructionHash).to.equal(instructionHash);
    expect(run.verdict).to.equal(0n);
    expect(run.status).to.equal(0n);
  });

  it("lets authorized auditors record exactly one policy audit verdict", async function () {
    const { ledger, requester, auditor, other } = await deployFixture();
    await ledger.connect(requester).requestRun(1, instructionHash, "proofs/request-1.json");

    await expect(ledger.connect(other).recordAuditResult(1, 1, 24, auditHash, "proofs/audit-1.json"))
      .to.be.revertedWithCustomError(ledger, "NotAuditor");

    await expect(ledger.connect(auditor).recordAuditResult(1, 1, 24, auditHash, "proofs/audit-1.json"))
      .to.emit(ledger, "RunAudited")
      .withArgs(1n, 1, 24, auditHash, "proofs/audit-1.json");

    const run = await ledger.getRun(1);
    expect(run.verdict).to.equal(1n);
    expect(run.riskScore).to.equal(24);
    expect(run.auditHash).to.equal(auditHash);
    expect(run.status).to.equal(1n);

    await expect(ledger.connect(auditor).recordAuditResult(1, 1, 24, auditHash, "proofs/audit-1.json"))
      .to.be.revertedWithCustomError(ledger, "InvalidStatus");
  });

  it("finalizes audited runs and rejects duplicate finalization", async function () {
    const { ledger, requester, auditor } = await deployFixture();
    await ledger.connect(requester).requestRun(1, instructionHash, "proofs/request-1.json");
    await ledger.connect(auditor).recordAuditResult(1, 1, 24, auditHash, "proofs/audit-1.json");

    await expect(ledger.connect(auditor).finalizeRun(1, 2, actionHash, "proofs/final-1.json"))
      .to.emit(ledger, "RunFinalized")
      .withArgs(1n, 2, actionHash, "proofs/final-1.json");

    const run = await ledger.getRun(1);
    expect(run.status).to.equal(2n);
    expect(run.actionHash).to.equal(actionHash);

    await expect(ledger.connect(auditor).finalizeRun(1, 2, actionHash, "proofs/final-1.json"))
      .to.be.revertedWithCustomError(ledger, "InvalidStatus");
  });

  it("rejects runs for inactive agents", async function () {
    const { registry, ledger, requester } = await deployFixture();
    await registry.setAgentActive(1, false);

    await expect(ledger.connect(requester).requestRun(1, instructionHash, "proofs/request-1.json"))
      .to.be.revertedWithCustomError(ledger, "AgentInactive");
  });
});
