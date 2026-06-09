import { ethers } from "ethers";
import type { ActionPlan, AuditVerdict } from "./types.js";

const UINT256_MAX = 2n ** 256n - 1n;

export function buildActionPlan(input: {
  verdict: AuditVerdict;
  recipient: string;
  amountWei: string | bigint | number;
}): ActionPlan {
  const recipient = normalizeRecipient(input.recipient);
  const amount = normalizeAmountWei(input.amountWei);
  const encodedAction = ethers.AbiCoder.defaultAbiCoder().encode(["address", "uint256"], [recipient, amount]);
  const actionHash = ethers.keccak256(encodedAction);
  const amountWei = amount.toString();

  if (input.verdict === "Allowed") {
    return {
      status: "Finalized",
      statusValue: 2,
      recipient,
      amountWei,
      actionHash
    };
  }

  return {
    status: "Cancelled",
    statusValue: 3,
    recipient,
    amountWei,
    actionHash
  };
}

function normalizeRecipient(recipient: string) {
  try {
    return ethers.getAddress(recipient);
  } catch {
    throw new Error("Action recipient must be a valid address.");
  }
}

function normalizeAmountWei(amountWei: string | bigint | number) {
  let amount: bigint;

  if (typeof amountWei === "bigint") {
    amount = amountWei;
  } else if (typeof amountWei === "number") {
    if (!Number.isSafeInteger(amountWei)) {
      throw new Error("Action amount must be a safe integer wei value.");
    }
    amount = BigInt(amountWei);
  } else {
    const trimmed = amountWei.trim();
    if (!/^\d+$/.test(trimmed)) {
      throw new Error("Action amount must be a positive integer wei amount.");
    }
    amount = BigInt(trimmed);
  }

  if (amount <= 0n) {
    throw new Error("Action amount must be positive.");
  }
  if (amount > UINT256_MAX) {
    throw new Error("Action amount must fit inside uint256.");
  }

  return amount;
}
