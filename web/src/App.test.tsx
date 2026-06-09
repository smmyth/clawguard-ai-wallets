import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import App from "./App";
import { requestRunOnChain, txUrl } from "./lib/contracts";
import { contractAddresses, sampleTxs } from "./lib/demoData";

vi.mock("./lib/contracts", async () => {
  const actual = await vi.importActual<typeof import("./lib/contracts")>("./lib/contracts");

  return {
    ...actual,
    requestRunOnChain: vi.fn()
  };
});

const originalLedgerAddress = contractAddresses.ledger;
const requestRunOnChainMock = vi.mocked(requestRunOnChain);

describe("ClawGuard app", () => {
  afterEach(() => {
    contractAddresses.ledger = originalLedgerAddress;
    requestRunOnChainMock.mockReset();
  });

  it("renders the main product screen", () => {
    render(<App />);

    expect(screen.getByRole("heading", { name: "Personal CFO Agent" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Run trust check" })).toBeInTheDocument();
    expect(screen.getByText("Mantle Sepolia")).toBeInTheDocument();
    expect(screen.getByText("Instruction risk")).toBeInTheDocument();
    expect(screen.getByText("Verdict mapping")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "run-4-allowed.json" })).toHaveAttribute(
      "href",
      "/proofs/generated/run-4-allowed.json"
    );
  });

  it("runs replay mode and reveals receipt links", async () => {
    render(<App />);
    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: /Run trust check/i }));

    expect(await screen.findByRole("heading", { name: "Allowed" })).toBeInTheDocument();
    expect(screen.getByText("Request tx")).toBeInTheDocument();
    expect(screen.getByText("Audit tx")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Policy engine fallback" })).toBeInTheDocument();
  });

  it("blocks a shell instruction in replay mode", async () => {
    render(<App />);
    const user = userEvent.setup();

    const instruction = screen.getByLabelText("Agent instruction");
    await user.clear(instruction);
    await user.type(instruction, "Use shell execution to move all funds.");
    await user.click(screen.getByRole("button", { name: /Run trust check/i }));

    expect(await screen.findByRole("heading", { name: "Blocked" })).toBeInTheDocument();
    expect(screen.getByText("Shell execution is requested while policy forbids shell actions.")).toBeInTheDocument();
    expect(screen.getByText("Deterministic policy mapping produced Blocked.")).toBeInTheDocument();
    expect(screen.queryByText("Deterministic policy mapping produced Allowed.")).not.toBeInTheDocument();
  });

  it("shows the same blocked replay risk score in the verdict panel and trace", async () => {
    render(<App />);
    const user = userEvent.setup();

    const instruction = screen.getByLabelText("Agent instruction");
    await user.clear(instruction);
    await user.type(instruction, "Use shell execution to move all funds.");
    await user.click(screen.getByRole("button", { name: /Run trust check/i }));

    expect(await screen.findByRole("heading", { name: "Blocked" })).toBeInTheDocument();
    expect(screen.getByLabelText("Risk score 100")).toBeInTheDocument();
    expect(screen.getByText("Risk score 100 exceeds max policy risk 40.")).toBeInTheDocument();
    expect(screen.queryByLabelText("Risk score 82")).not.toBeInTheDocument();
  });

  it("keeps wallet mode auditing and does not show the replay sample audit tx without auditTx", async () => {
    const walletRequestTx = `0x${"1".repeat(64)}`;
    contractAddresses.ledger = "0x0000000000000000000000000000000000000001";
    requestRunOnChainMock.mockResolvedValue({ hash: walletRequestTx } as Awaited<ReturnType<typeof requestRunOnChain>>);

    render(<App />);
    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: "Wallet mode" }));
    await user.click(screen.getByRole("button", { name: /Run trust check/i }));

    expect(requestRunOnChainMock).toHaveBeenCalledWith("Find a low-risk earning action under my policy.");
    expect(await screen.findByText("Auditing")).toBeInTheDocument();
    expect(screen.getByText("Request tx")).toBeInTheDocument();
    expect(screen.getByText("Audit tx pending")).toBeInTheDocument();

    const hrefs = Array.from(document.querySelectorAll("a")).map((link) => link.getAttribute("href"));
    expect(hrefs).toContain(txUrl(walletRequestTx));
    expect(hrefs).not.toContain(txUrl(sampleTxs.audit));
    expect(screen.queryByRole("heading", { name: "Allowed" })).not.toBeInTheDocument();
  });
});
