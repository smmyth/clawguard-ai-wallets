import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { ethers } from "ethers";
import { AuditProof, ProofSchema } from "./types.js";

export async function writeProof(proof: AuditProof, baseDir = process.env.WEB_PROOFS_DIR ?? "../../web/public/proofs/generated") {
  const parsed = ProofSchema.parse(proof);
  const absoluteBase = path.resolve(process.cwd(), baseDir);
  await mkdir(absoluteBase, { recursive: true });

  const filename = `run-${parsed.runId}-${parsed.verdict.toLowerCase()}.json`;
  const absolutePath = path.join(absoluteBase, filename);
  const serialized = `${JSON.stringify(parsed, null, 2)}\n`;
  await writeFile(absolutePath, serialized, "utf8");

  return {
    filename,
    absolutePath,
    publicUri: `/proofs/generated/${filename}`,
    hash: ethers.keccak256(ethers.toUtf8Bytes(serialized))
  };
}
