// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract AgentRegistry {
    struct Agent {
        uint256 id;
        address owner;
        string name;
        string metadataURI;
        bytes32 policyHash;
        bytes32 capabilitiesHash;
        bool active;
    }

    uint256 public nextAgentId = 1;
    mapping(uint256 => Agent) private agents;

    event AgentRegistered(
        uint256 indexed agentId,
        address indexed owner,
        string name,
        string metadataURI,
        bytes32 policyHash,
        bytes32 capabilitiesHash
    );
    event AgentPolicyUpdated(uint256 indexed agentId, bytes32 policyHash, bytes32 capabilitiesHash);
    event AgentActiveStatusUpdated(uint256 indexed agentId, bool active);

    error AgentNotFound(uint256 agentId);
    error NotAgentOwner(uint256 agentId, address caller);
    error EmptyName();
    error EmptyHash();

    modifier onlyAgentOwner(uint256 agentId) {
        Agent storage agent = agents[agentId];
        if (agent.owner == address(0)) revert AgentNotFound(agentId);
        if (agent.owner != msg.sender) revert NotAgentOwner(agentId, msg.sender);
        _;
    }

    function registerAgent(
        string calldata name,
        string calldata metadataURI,
        bytes32 policyHash,
        bytes32 capabilitiesHash
    ) external returns (uint256 agentId) {
        if (bytes(name).length == 0) revert EmptyName();
        if (policyHash == bytes32(0) || capabilitiesHash == bytes32(0)) revert EmptyHash();

        agentId = nextAgentId++;
        agents[agentId] = Agent({
            id: agentId,
            owner: msg.sender,
            name: name,
            metadataURI: metadataURI,
            policyHash: policyHash,
            capabilitiesHash: capabilitiesHash,
            active: true
        });

        emit AgentRegistered(agentId, msg.sender, name, metadataURI, policyHash, capabilitiesHash);
    }

    function updateAgentPolicy(
        uint256 agentId,
        bytes32 policyHash,
        bytes32 capabilitiesHash
    ) external onlyAgentOwner(agentId) {
        if (policyHash == bytes32(0) || capabilitiesHash == bytes32(0)) revert EmptyHash();

        Agent storage agent = agents[agentId];
        agent.policyHash = policyHash;
        agent.capabilitiesHash = capabilitiesHash;

        emit AgentPolicyUpdated(agentId, policyHash, capabilitiesHash);
    }

    function setAgentActive(uint256 agentId, bool active) external onlyAgentOwner(agentId) {
        agents[agentId].active = active;
        emit AgentActiveStatusUpdated(agentId, active);
    }

    function getAgent(uint256 agentId) external view returns (Agent memory) {
        Agent memory agent = agents[agentId];
        if (agent.owner == address(0)) revert AgentNotFound(agentId);
        return agent;
    }

    function ownerOfAgent(uint256 agentId) external view returns (address) {
        Agent memory agent = agents[agentId];
        if (agent.owner == address(0)) revert AgentNotFound(agentId);
        return agent.owner;
    }

    function isAgentActive(uint256 agentId) external view returns (bool) {
        Agent memory agent = agents[agentId];
        if (agent.owner == address(0)) revert AgentNotFound(agentId);
        return agent.active;
    }
}
