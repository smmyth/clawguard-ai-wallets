import { run } from "hardhat";

async function main() {
  const [registryArg, ledgerArg] = process.argv.slice(2);
  const registryAddress = registryArg ?? process.env.AGENT_REGISTRY_ADDRESS;
  const ledgerAddress = ledgerArg ?? process.env.AGENT_RUN_LEDGER_ADDRESS;
  if (!registryAddress || !ledgerAddress) {
    throw new Error(
      "Usage: AGENT_REGISTRY_ADDRESS=0x... AGENT_RUN_LEDGER_ADDRESS=0x... npm run verify:mantle -w contracts"
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
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
