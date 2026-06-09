import { run } from "hardhat";

async function main() {
  const [registryArg, ledgerArg, walletArg] = process.argv.slice(2);
  const registryAddress = registryArg ?? process.env.AGENT_REGISTRY_ADDRESS;
  const ledgerAddress = ledgerArg ?? process.env.AGENT_RUN_LEDGER_ADDRESS;
  const walletAddress = walletArg ?? process.env.AGENT_WALLET_ADDRESS;

  if (!registryAddress || !ledgerAddress || !walletAddress) {
    throw new Error(
      "Usage: AGENT_REGISTRY_ADDRESS=0x... AGENT_RUN_LEDGER_ADDRESS=0x... AGENT_WALLET_ADDRESS=0x... npm run verify:v2:mantle -w contracts"
    );
  }

  await run("verify:verify", {
    address: registryAddress,
    constructorArguments: []
  });

  await run("verify:verify", {
    address: ledgerAddress,
    constructorArguments: [registryAddress]
  });

  await run("verify:verify", {
    address: walletAddress,
    constructorArguments: [ledgerAddress, 40]
  });
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
