import { expect } from "chai";
import { ethers } from "hardhat";

const Verdict = { Pending: 0, Allowed: 1, Warning: 2, Blocked: 3 } as const;
const RunStatus = { Requested: 0, Audited: 1, Finalized: 2, Cancelled: 3 } as const;

describe("AgentWallet", function () {
  const policyHash = ethers.id("policy:v1");
  const capabilitiesHash = ethers.id("capabilities:v1");
  const instructionHash = ethers.id("Send 0.1 MNT into low-risk staking under my policy.");
  const auditHash = ethers.id("audit:allowed:24");
  const amount = ethers.parseEther("0.1");
  const maxRisk = 40n;

  async function deployFixture() {
    const [owner, requester, recipient, other] = await ethers.getSigners();

    const Registry = await ethers.getContractFactory("AgentRegistry");
    const registry = await Registry.deploy();
    await registry.registerAgent("Personal CFO Agent", "ipfs://agent", policyHash, capabilitiesHash);

    const Ledger = await ethers.getContractFactory("AgentRunLedger");
    const ledger = await Ledger.deploy(await registry.getAddress());

    const Wallet = await ethers.getContractFactory("AgentWallet");
    const wallet = await Wallet.deploy(await ledger.getAddress(), maxRisk);

    // Fund the agent wallet with testnet value.
    await owner.sendTransaction({ to: await wallet.getAddress(), value: ethers.parseEther("1") });

    return { registry, ledger, wallet, owner, requester, recipient, other };
  }

  // Drives a run through request -> audit -> finalize with a chosen verdict/risk/status.
  async function stageRun(
    ledger: any,
    wallet: any,
    requester: any,
    auditor: any,
    to: string,
    {
      verdict = Verdict.Allowed,
      riskScore = 24,
      finalStatus = RunStatus.Finalized,
      finalize = true,
      commitment
    }: { verdict?: number; riskScore?: number; finalStatus?: number; finalize?: boolean; commitment?: string } = {}
  ) {
    await ledger.connect(requester).requestRun(1, instructionHash, "proofs/request.json");
    const runId = (await ledger.nextRunId()) - 1n;
    await ledger.connect(auditor).recordAuditResult(runId, verdict, riskScore, auditHash, "proofs/audit.json");
    if (finalize) {
      const actionHash = commitment ?? (await wallet.actionCommitment(to, amount));
      await ledger.connect(auditor).finalizeRun(runId, finalStatus, actionHash, "proofs/final.json");
    }
    return runId;
  }

  it("computes actionCommitment as keccak256(abi.encode(to, amount))", async function () {
    const { wallet, recipient } = await deployFixture();
    const expected = ethers.keccak256(
      ethers.AbiCoder.defaultAbiCoder().encode(["address", "uint256"], [recipient.address, amount])
    );
    expect(await wallet.actionCommitment(recipient.address, amount)).to.equal(expected);
  });

  it("releases funds only when the receipt is Allowed + Finalized and the action matches", async function () {
    const { ledger, wallet, owner, requester, recipient } = await deployFixture();
    const runId = await stageRun(ledger, wallet, requester, owner, recipient.address);

    const walletAddress = await wallet.getAddress();
    const beforeWallet = await ethers.provider.getBalance(walletAddress);
    const beforeRecipient = await ethers.provider.getBalance(recipient.address);

    const tx = await wallet.executeAction(runId, recipient.address, amount);

    await expect(tx)
      .to.emit(wallet, "ActionExecuted")
      .withArgs(runId, recipient.address, amount, 24);

    expect(await ethers.provider.getBalance(walletAddress)).to.equal(beforeWallet - amount);
    expect(await ethers.provider.getBalance(recipient.address)).to.equal(beforeRecipient + amount);

    expect(await wallet.executed(runId)).to.equal(true);
  });

  it("blocks a second release for the same run", async function () {
    const { ledger, wallet, owner, requester, recipient } = await deployFixture();
    const runId = await stageRun(ledger, wallet, requester, owner, recipient.address);
    await wallet.executeAction(runId, recipient.address, amount);

    await expect(wallet.executeAction(runId, recipient.address, amount)).to.be.revertedWithCustomError(
      wallet,
      "AlreadyExecuted"
    );
  });

  it("locks funds when the verdict is not Allowed (Warning finalized)", async function () {
    const { ledger, wallet, owner, requester, recipient } = await deployFixture();
    const runId = await stageRun(ledger, wallet, requester, owner, recipient.address, {
      verdict: Verdict.Warning
    });

    await expect(wallet.executeAction(runId, recipient.address, amount))
      .to.be.revertedWithCustomError(wallet, "RunNotAllowed")
      .withArgs(runId, Verdict.Warning);
  });

  it("locks funds when a Blocked run is cancelled rather than finalized", async function () {
    const { ledger, wallet, owner, requester, recipient } = await deployFixture();
    const runId = await stageRun(ledger, wallet, requester, owner, recipient.address, {
      verdict: Verdict.Blocked,
      riskScore: 82,
      finalStatus: RunStatus.Cancelled
    });

    // Verdict check fires first for a Blocked run.
    await expect(wallet.executeAction(runId, recipient.address, amount))
      .to.be.revertedWithCustomError(wallet, "RunNotAllowed")
      .withArgs(runId, Verdict.Blocked);
  });

  it("locks funds when the run is audited but not finalized", async function () {
    const { ledger, wallet, owner, requester, recipient } = await deployFixture();
    const runId = await stageRun(ledger, wallet, requester, owner, recipient.address, { finalize: false });

    await expect(wallet.executeAction(runId, recipient.address, amount))
      .to.be.revertedWithCustomError(wallet, "RunNotFinalized")
      .withArgs(runId, RunStatus.Audited);
  });

  it("rejects an altered recipient or amount that breaks the commitment", async function () {
    const { ledger, wallet, owner, requester, recipient, other } = await deployFixture();
    const runId = await stageRun(ledger, wallet, requester, owner, recipient.address);

    await expect(wallet.executeAction(runId, other.address, amount)).to.be.revertedWithCustomError(
      wallet,
      "ActionMismatch"
    );
    await expect(
      wallet.executeAction(runId, recipient.address, amount + 1n)
    ).to.be.revertedWithCustomError(wallet, "ActionMismatch");
  });

  it("refuses to release when the audited risk exceeds the on-chain bound", async function () {
    const { ledger, wallet, owner, requester, recipient } = await deployFixture();
    const runId = await stageRun(ledger, wallet, requester, owner, recipient.address, {
      verdict: Verdict.Allowed,
      riskScore: 41
    });

    await expect(wallet.executeAction(runId, recipient.address, amount))
      .to.be.revertedWithCustomError(wallet, "RiskTooHigh")
      .withArgs(41, maxRisk);
  });

  it("reverts when the wallet cannot cover the approved amount", async function () {
    const { ledger, wallet, owner, requester, recipient } = await deployFixture();
    const big = ethers.parseEther("2"); // wallet holds 1
    const commitment = await wallet.actionCommitment(recipient.address, big);
    const runId = await stageRun(ledger, wallet, requester, owner, recipient.address, { commitment });

    await expect(wallet.executeAction(runId, recipient.address, big)).to.be.revertedWithCustomError(
      wallet,
      "InsufficientBalance"
    );
  });

  it("lets only the owner sweep remaining funds", async function () {
    const { wallet, owner, other } = await deployFixture();
    await expect(wallet.connect(other).sweep(other.address)).to.be.revertedWithCustomError(wallet, "NotOwner");

    await expect(wallet.connect(owner).sweep(owner.address)).to.emit(wallet, "Swept");
    expect(await ethers.provider.getBalance(await wallet.getAddress())).to.equal(0n);
  });
});
