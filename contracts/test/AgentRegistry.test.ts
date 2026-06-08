import { expect } from "chai";
import { ethers } from "hardhat";

describe("AgentRegistry", function () {
  const policyHash = ethers.id("policy:v1");
  const capabilitiesHash = ethers.id("capabilities:v1");

  async function deployRegistry() {
    const [owner, other] = await ethers.getSigners();
    const Registry = await ethers.getContractFactory("AgentRegistry");
    const registry = await Registry.deploy();
    return { registry, owner, other };
  }

  it("registers an agent with incrementing ids and stored hashes", async function () {
    const { registry, owner } = await deployRegistry();

    await expect(registry.registerAgent("Personal CFO Agent", "ipfs://agent", policyHash, capabilitiesHash))
      .to.emit(registry, "AgentRegistered")
      .withArgs(1n, owner.address, "Personal CFO Agent", "ipfs://agent", policyHash, capabilitiesHash);

    const agent = await registry.getAgent(1);
    expect(agent.id).to.equal(1n);
    expect(agent.owner).to.equal(owner.address);
    expect(agent.name).to.equal("Personal CFO Agent");
    expect(agent.metadataURI).to.equal("ipfs://agent");
    expect(agent.policyHash).to.equal(policyHash);
    expect(agent.capabilitiesHash).to.equal(capabilitiesHash);
    expect(agent.active).to.equal(true);
    expect(await registry.nextAgentId()).to.equal(2n);
  });

  it("lets only the agent owner update policy hashes", async function () {
    const { registry, other } = await deployRegistry();
    await registry.registerAgent("Personal CFO Agent", "ipfs://agent", policyHash, capabilitiesHash);

    await expect(registry.connect(other).updateAgentPolicy(1, ethers.id("policy:v2"), ethers.id("capabilities:v2")))
      .to.be.revertedWithCustomError(registry, "NotAgentOwner");

    await expect(registry.updateAgentPolicy(1, ethers.id("policy:v2"), ethers.id("capabilities:v2")))
      .to.emit(registry, "AgentPolicyUpdated")
      .withArgs(1n, ethers.id("policy:v2"), ethers.id("capabilities:v2"));

    const agent = await registry.getAgent(1);
    expect(agent.policyHash).to.equal(ethers.id("policy:v2"));
    expect(agent.capabilitiesHash).to.equal(ethers.id("capabilities:v2"));
  });

  it("rejects empty agent names and zero hashes", async function () {
    const { registry } = await deployRegistry();

    await expect(registry.registerAgent("", "ipfs://agent", policyHash, capabilitiesHash))
      .to.be.revertedWithCustomError(registry, "EmptyName");

    await expect(registry.registerAgent("Agent", "ipfs://agent", ethers.ZeroHash, capabilitiesHash))
      .to.be.revertedWithCustomError(registry, "EmptyHash");
  });
});
