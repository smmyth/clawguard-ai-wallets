import { ethers, network } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  if (!deployer) {
    throw new Error("No deployer account. Set PRIVATE_KEY before deploying.");
  }

  console.log(`Deploying ClawGuard contracts to ${network.name}`);
  console.log(`Deployer: ${deployer.address}`);

  const AgentRegistry = await ethers.getContractFactory("AgentRegistry");
  const registry = await AgentRegistry.deploy();
  await registry.waitForDeployment();

  const AgentRunLedger = await ethers.getContractFactory("AgentRunLedger");
  const ledger = await AgentRunLedger.deploy(await registry.getAddress());
  await ledger.waitForDeployment();

  console.log(`AgentRegistry: ${await registry.getAddress()}`);
  console.log(`AgentRunLedger: ${await ledger.getAddress()}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
