import { ethers } from "ethers";
import { contractAddresses, explorerBaseUrl } from "./demoData";

export const ledgerAbi = [
  "function requestRun(uint256 agentId, bytes32 instructionHash, string proofURI) returns (uint256)",
  "event RunRequested(uint256 indexed runId,uint256 indexed agentId,address indexed requester,bytes32 instructionHash,string proofURI)"
];

export function hashInstruction(instruction: string) {
  return ethers.keccak256(ethers.toUtf8Bytes(instruction));
}

export function makeRequestProofURI(instruction: string) {
  const requestProof = {
    instruction,
    timestamp: new Date().toISOString(),
    source: "clawguard-web"
  };
  return `data:application/json,${encodeURIComponent(JSON.stringify(requestProof))}`;
}

export function txUrl(hash?: string) {
  if (!hash) return "";
  return `${explorerBaseUrl}/tx/${hash}`;
}

export function addressUrl(address?: string) {
  if (!address) return "";
  return `${explorerBaseUrl}/address/${address}`;
}

export async function requestRunOnChain(instruction: string) {
  if (!window.ethereum) {
    throw new Error("No injected wallet found.");
  }
  if (!contractAddresses.ledger) {
    throw new Error("No AgentRunLedger address configured.");
  }

  const provider = new ethers.BrowserProvider(window.ethereum);
  await provider.send("eth_requestAccounts", []);
  const signer = await provider.getSigner();
  const contract = new ethers.Contract(contractAddresses.ledger, ledgerAbi, signer);
  const instructionHash = hashInstruction(instruction);
  const proofURI = makeRequestProofURI(instruction);
  const tx = await contract.requestRun(1, instructionHash, proofURI);
  return tx.wait();
}

declare global {
  interface Window {
    ethereum?: ethers.Eip1193Provider;
  }
}
