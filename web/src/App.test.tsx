import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import App from "./App";
import { addressUrl, requestRunOnChain, txUrl } from "./lib/contracts";
import { agentExecutionConfig, contractAddresses, sampleTxs } from "./lib/demoData";

vi.mock("./lib/contracts", async () => {
  const actual = await vi.importActual<typeof import("./lib/contracts")>("./lib/contracts");

  return {
    ...actual,
    requestRunOnChain: vi.fn()
  };
});

const originalLedgerAddress = contractAddresses.ledger;
const originalExecutionConfig = { ...agentExecutionConfig };
const requestRunOnChainMock = vi.mocked(requestRunOnChain);

describe("ClawGuard app", () => {
  afterEach(() => {
    contractAddresses.ledger = originalLedgerAddress;
    Object.assign(agentExecutionConfig, originalExecutionConfig);
    requestRunOnChainMock.mockReset();
  });

  it("renders the main product screen", () => {
    render(<App />);

    expect(screen.getByRole("heading", { name: "Personal CFO Agent" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Run trust check" })).toBeInTheDocument();
    expect(screen.getByText("Mantle Sepolia")).toBeInTheDocument();
    expect(screen.getByText("Instruction risk")).toBeInTheDocument();
    expect(screen.getByText("Verdict mapping")).toBeInTheDocument();
    const executionPanel = screen.getByRole("region", { name: "AgentWallet" });
    expect(executionPanel).toBeInTheDocument();
    expect(within(executionPanel).getAllByText("Not deployed").length).toBeGreaterThan(0);
    expect(screen.getByRole("link", { name: "run-1-allowed-v2-final.json" })).toHaveAttribute(
      "href",
      "/proofs/generated/run-1-allowed-v2-final.json"
    );
  });

  it("renders the execution panel with configured live evidence links", () => {
    const walletAddress = "0x0000000000000000000000000000000000000002";
    const actionHash = `0x${"2".repeat(64)}`;

    Object.assign(agentExecutionConfig, {
      walletAddress,
      actionHash,
      executionTx: ""
    });

    render(<App />);

    const panel = screen.getByRole("region", { name: "AgentWallet" });
    expect(within(panel).getByText(walletAddress)).toBeInTheDocument();
    expect(within(panel).getByText(actionHash)).toBeInTheDocument();
    expect(within(panel).getAllByText("Waiting for finalized receipt")).toHaveLength(2);
    expect(within(panel).getByRole("link", { name: /Open AgentWallet/i })).toHaveAttribute(
      "href",
      addressUrl(walletAddress)
    );
  });

  it("keeps the public V2 final proof link visible", () => {
    render(<App />);

    expect(screen.getByRole("link", { name: "run-1-allowed-v2-final.json" })).toHaveAttribute(
      "href",
      "/proofs/generated/run-1-allowed-v2-final.json"
    );
  });

  it("runs replay mode and reveals receipt links", async () => {
    render(<App />);
    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: /Run trust check/i }));

    expect(await screen.findByRole("heading", { name: "Allowed" })).toBeInTheDocument();
    expect(screen.getByText("Request tx")).toBeInTheDocument();
    expect(screen.getByText("Audit tx")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Deterministic guardrail audit" })).toBeInTheDocument();
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

  it("blocks command-execution terms in replay mode like the runner", async () => {
    render(<App />);
    const user = userEvent.setup();

    const instruction = screen.getByLabelText("Agent instruction");
    await user.clear(instruction);
    await user.type(instruction, "Run a bash command before moving funds.");
    await user.click(screen.getByRole("button", { name: /Run trust check/i }));

    expect(await screen.findByRole("heading", { name: "Blocked" })).toBeInTheDocument();
    expect(screen.getByText("Shell execution is requested while policy forbids shell actions.")).toBeInTheDocument();
    expect(screen.getByText("Risk score 84 exceeds max policy risk 40.")).toBeInTheDocument();
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

    await user.click(screen.getByRole("button", { name: "New wallet request" }));
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

  it("does not fall back to replay txs when wallet mode is missing ledger config", async () => {
    contractAddresses.ledger = "";
    render(<App />);
    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: "New wallet request" }));
    await user.click(screen.getByRole("button", { name: /Run trust check/i }));

    expect(requestRunOnChainMock).not.toHaveBeenCalled();
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "New wallet request needs VITE_AGENT_RUN_LEDGER_ADDRESS before it can submit on-chain."
    );
    expect(screen.getByText("Audit tx pending")).toBeInTheDocument();

    const hrefs = Array.from(document.querySelectorAll("a")).map((link) => link.getAttribute("href"));
    expect(hrefs).not.toContain(txUrl(sampleTxs.request));
    expect(hrefs).not.toContain(txUrl(sampleTxs.audit));
  });
});
