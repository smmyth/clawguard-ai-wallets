import { ethers } from "ethers";

export const ledgerAbi = [
  "event RunRequested(uint256 indexed runId,uint256 indexed agentId,address indexed requester,bytes32 instructionHash,string proofURI)",
  "function recordAuditResult(uint256 runId,uint8 verdict,uint8 riskScore,bytes32 auditHash,string proofURI)",
  "function getRun(uint256 runId) view returns (tuple(uint256 id,uint256 agentId,address requester,bytes32 instructionHash,string requestProofURI,uint8 verdict,uint8 riskScore,bytes32 auditHash,string auditProofURI,uint8 status,bytes32 actionHash,string finalProofURI,uint64 requestedAt,uint64 auditedAt,uint64 finalizedAt))"
];

export function createLedgerContract() {
  const rpcUrl = process.env.MANTLE_RPC_URL ?? "https://rpc.sepolia.mantle.xyz";
  const privateKey = process.env.PRIVATE_KEY;
  const ledgerAddress = process.env.AGENT_RUN_LEDGER_ADDRESS;

  if (!privateKey) {
    throw new Error("PRIVATE_KEY is required for on-chain runner mode.");
  }
  if (!ledgerAddress) {
    throw new Error("AGENT_RUN_LEDGER_ADDRESS is required for on-chain runner mode.");
  }

  const provider = new ethers.JsonRpcProvider(rpcUrl, 5003);
  const wallet = new ethers.Wallet(privateKey, provider);
  return new ethers.Contract(ledgerAddress, ledgerAbi, wallet);
}
