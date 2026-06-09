// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @notice Read-only view of the already-deployed AgentRunLedger. The struct and
/// enum layout must match AgentRunLedger exactly so `getRun` decodes correctly.
interface IAgentRunLedgerView {
    enum Verdict {
        Pending,
        Allowed,
        Warning,
        Blocked
    }

    enum RunStatus {
        Requested,
        Audited,
        Finalized,
        Cancelled
    }

    struct AgentRun {
        uint256 id;
        uint256 agentId;
        address requester;
        bytes32 instructionHash;
        string requestProofURI;
        Verdict verdict;
        uint8 riskScore;
        bytes32 auditHash;
        string auditProofURI;
        RunStatus status;
        bytes32 actionHash;
        string finalProofURI;
        uint64 requestedAt;
        uint64 auditedAt;
        uint64 finalizedAt;
    }

    function getRun(uint256 runId) external view returns (AgentRun memory);
}

/// @title AgentWallet
/// @notice A ClawGuard-gated wallet for AI agents. It holds testnet value and only
/// releases a transfer when the AgentRunLedger trust receipt says the run was
/// `Allowed` and `Finalized`, the audited risk is within an on-chain bound, and the
/// finalized `actionHash` commits to exactly this `(to, amount)` pair. A `Blocked`
/// verdict, an un-finalized run, a risk over the bound, or any altered recipient or
/// amount leaves the funds locked. This turns the trust receipt from a log into the
/// authority that controls the money.
contract AgentWallet {
    IAgentRunLedgerView public immutable ledger;
    address public owner;

    /// @notice Refuse to release funds when the audited risk score exceeds this bound,
    /// even if the verdict is `Allowed`. Defense in depth on top of the ledger verdict.
    uint256 public maxRiskScore;

    /// @notice Each run can release funds at most once.
    mapping(uint256 => bool) public executed;

    event Deposited(address indexed from, uint256 amount);
    event ActionExecuted(uint256 indexed runId, address indexed to, uint256 amount, uint8 riskScore);
    event Swept(address indexed to, uint256 amount);
    event MaxRiskUpdated(uint256 maxRiskScore);

    error NotOwner(address caller);
    error ZeroAmount();
    error AlreadyExecuted(uint256 runId);
    error RunNotAllowed(uint256 runId, IAgentRunLedgerView.Verdict verdict);
    error RunNotFinalized(uint256 runId, IAgentRunLedgerView.RunStatus status);
    error RiskTooHigh(uint8 riskScore, uint256 maxRiskScore);
    error ActionMismatch(uint256 runId, bytes32 expected, bytes32 committed);
    error InsufficientBalance(uint256 requested, uint256 available);
    error TransferFailed();

    modifier onlyOwner() {
        if (msg.sender != owner) revert NotOwner(msg.sender);
        _;
    }

    constructor(address ledgerAddress, uint256 initialMaxRisk) {
        ledger = IAgentRunLedgerView(ledgerAddress);
        owner = msg.sender;
        maxRiskScore = initialMaxRisk;
        emit MaxRiskUpdated(initialMaxRisk);
    }

    receive() external payable {
        emit Deposited(msg.sender, msg.value);
    }

    function setMaxRisk(uint256 newMax) external onlyOwner {
        maxRiskScore = newMax;
        emit MaxRiskUpdated(newMax);
    }

    /// @notice The canonical commitment a finalized run must carry to release `(to, amount)`.
    /// The runner sets `finalizeRun(runId, Finalized, actionCommitment(to, amount), ...)`.
    function actionCommitment(address to, uint256 amount) public pure returns (bytes32) {
        return keccak256(abi.encode(to, amount));
    }

    /// @notice Release `amount` to `to` only if the ledger trust receipt authorizes it.
    /// Permissionless by design: anyone may trigger the release, but the recipient and
    /// amount are bound by the finalized `actionHash`, so the caller cannot redirect funds.
    function executeAction(uint256 runId, address payable to, uint256 amount) external {
        if (amount == 0) revert ZeroAmount();
        if (executed[runId]) revert AlreadyExecuted(runId);

        IAgentRunLedgerView.AgentRun memory run = ledger.getRun(runId);

        if (run.verdict != IAgentRunLedgerView.Verdict.Allowed) {
            revert RunNotAllowed(runId, run.verdict);
        }
        if (run.status != IAgentRunLedgerView.RunStatus.Finalized) {
            revert RunNotFinalized(runId, run.status);
        }
        if (run.riskScore > maxRiskScore) {
            revert RiskTooHigh(run.riskScore, maxRiskScore);
        }

        bytes32 expected = actionCommitment(to, amount);
        if (run.actionHash != expected) {
            revert ActionMismatch(runId, expected, run.actionHash);
        }

        uint256 balance = address(this).balance;
        if (balance < amount) revert InsufficientBalance(amount, balance);

        executed[runId] = true;

        (bool ok, ) = to.call{value: amount}("");
        if (!ok) revert TransferFailed();

        emit ActionExecuted(runId, to, amount, run.riskScore);
    }

    /// @notice Owner recovery path for any remaining testnet balance.
    function sweep(address payable to) external onlyOwner {
        uint256 balance = address(this).balance;
        (bool ok, ) = to.call{value: balance}("");
        if (!ok) revert TransferFailed();
        emit Swept(to, balance);
    }
}
