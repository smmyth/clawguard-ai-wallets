// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IAgentRegistry {
    function isAgentActive(uint256 agentId) external view returns (bool);
}

contract AgentRunLedger {
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

    IAgentRegistry public immutable registry;
    address public owner;
    uint256 public nextRunId = 1;

    mapping(address => bool) public authorizedAuditors;
    mapping(uint256 => AgentRun) private runs;

    event AuditorUpdated(address indexed auditor, bool authorized);
    event RunRequested(
        uint256 indexed runId,
        uint256 indexed agentId,
        address indexed requester,
        bytes32 instructionHash,
        string proofURI
    );
    event RunAudited(
        uint256 indexed runId,
        Verdict verdict,
        uint8 riskScore,
        bytes32 auditHash,
        string proofURI
    );
    event RunFinalized(uint256 indexed runId, RunStatus status, bytes32 actionHash, string proofURI);

    error NotOwner(address caller);
    error NotAuditor(address caller);
    error RunNotFound(uint256 runId);
    error AgentInactive(uint256 agentId);
    error InvalidHash();
    error InvalidRiskScore(uint8 riskScore);
    error InvalidVerdict(Verdict verdict);
    error InvalidStatus(RunStatus current, RunStatus expected);

    modifier onlyOwner() {
        if (msg.sender != owner) revert NotOwner(msg.sender);
        _;
    }

    modifier onlyAuditor() {
        if (!authorizedAuditors[msg.sender]) revert NotAuditor(msg.sender);
        _;
    }

    constructor(address registryAddress) {
        registry = IAgentRegistry(registryAddress);
        owner = msg.sender;
        authorizedAuditors[msg.sender] = true;
        emit AuditorUpdated(msg.sender, true);
    }

    function setAuditor(address auditor, bool authorized) external onlyOwner {
        authorizedAuditors[auditor] = authorized;
        emit AuditorUpdated(auditor, authorized);
    }

    function requestRun(
        uint256 agentId,
        bytes32 instructionHash,
        string calldata proofURI
    ) external returns (uint256 runId) {
        if (instructionHash == bytes32(0)) revert InvalidHash();
        if (!registry.isAgentActive(agentId)) revert AgentInactive(agentId);

        runId = nextRunId++;
        runs[runId] = AgentRun({
            id: runId,
            agentId: agentId,
            requester: msg.sender,
            instructionHash: instructionHash,
            requestProofURI: proofURI,
            verdict: Verdict.Pending,
            riskScore: 0,
            auditHash: bytes32(0),
            auditProofURI: "",
            status: RunStatus.Requested,
            actionHash: bytes32(0),
            finalProofURI: "",
            requestedAt: uint64(block.timestamp),
            auditedAt: 0,
            finalizedAt: 0
        });

        emit RunRequested(runId, agentId, msg.sender, instructionHash, proofURI);
    }

    function recordAuditResult(
        uint256 runId,
        Verdict verdict,
        uint8 riskScore,
        bytes32 auditHash,
        string calldata proofURI
    ) external onlyAuditor {
        AgentRun storage run = existingRun(runId);
        if (run.status != RunStatus.Requested) revert InvalidStatus(run.status, RunStatus.Requested);
        if (verdict == Verdict.Pending) revert InvalidVerdict(verdict);
        if (riskScore > 100) revert InvalidRiskScore(riskScore);
        if (auditHash == bytes32(0)) revert InvalidHash();

        run.verdict = verdict;
        run.riskScore = riskScore;
        run.auditHash = auditHash;
        run.auditProofURI = proofURI;
        run.status = RunStatus.Audited;
        run.auditedAt = uint64(block.timestamp);

        emit RunAudited(runId, verdict, riskScore, auditHash, proofURI);
    }

    function finalizeRun(
        uint256 runId,
        RunStatus status,
        bytes32 actionHash,
        string calldata proofURI
    ) external onlyAuditor {
        AgentRun storage run = existingRun(runId);
        if (run.status != RunStatus.Audited) revert InvalidStatus(run.status, RunStatus.Audited);
        if (status != RunStatus.Finalized && status != RunStatus.Cancelled) revert InvalidStatus(status, RunStatus.Finalized);
        if (actionHash == bytes32(0)) revert InvalidHash();

        run.status = status;
        run.actionHash = actionHash;
        run.finalProofURI = proofURI;
        run.finalizedAt = uint64(block.timestamp);

        emit RunFinalized(runId, status, actionHash, proofURI);
    }

    function getRun(uint256 runId) external view returns (AgentRun memory) {
        return existingRunView(runId);
    }

    function existingRun(uint256 runId) private view returns (AgentRun storage run) {
        run = runs[runId];
        if (run.id == 0) revert RunNotFound(runId);
    }

    function existingRunView(uint256 runId) private view returns (AgentRun memory run) {
        run = runs[runId];
        if (run.id == 0) revert RunNotFound(runId);
    }
}
