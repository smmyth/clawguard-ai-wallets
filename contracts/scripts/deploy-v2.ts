import { ethers, network } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  if (!deployer) {
    throw new Error("No deployer account. Set PRIVATE_KEY before deploying.");
  }

  console.log(`network=${network.name}`);
  console.log(`deployer=${deployer.address}`);

  const AgentRegistry = await ethers.getContractFactory("AgentRegistry");
  const registry = await AgentRegistry.deploy();
  await registry.waitForDeployment();
  const registryAddress = await registry.getAddress();

  const policyHash = ethers.id("clawguard.demo.policy.v2");
  const capabilitiesHash = ethers.id("clawguard.demo.capabilities.v2");
  const registerAgentTx = await registry.registerAgent(
    "ClawGuard Demo Agent",
    "ipfs://clawguard-demo-agent-v2",
    policyHash,
    capabilitiesHash
  );
  await registerAgentTx.wait();

  const AgentRunLedger = await ethers.getContractFactory("AgentRunLedger");
  const ledger = await AgentRunLedger.deploy(registryAddress);
  await ledger.waitForDeployment();
  const ledgerAddress = await ledger.getAddress();

  const AgentWallet = await ethers.getContractFactory("AgentWallet");
  const wallet = await AgentWallet.deploy(ledgerAddress, 40);
  await wallet.waitForDeployment();
  const walletAddress = await wallet.getAddress();

  console.log(`AgentRegistry=${registryAddress}`);
  console.log(`AgentRunLedgerV2=${ledgerAddress}`);
  console.log(`AgentWallet=${walletAddress}`);
  console.log("demoAgentId=1");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
