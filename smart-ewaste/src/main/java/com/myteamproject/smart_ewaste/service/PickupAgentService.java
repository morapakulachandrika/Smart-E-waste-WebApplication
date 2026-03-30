package com.myteamproject.smart_ewaste.service;

import com.myteamproject.smart_ewaste.dto.PickupAgentDTO;
import com.myteamproject.smart_ewaste.dto.PickupStatusUpdateRequest;
import com.myteamproject.smart_ewaste.entity.WasteRequest;

import java.util.Map;
import java.util.List;

public interface PickupAgentService {

    // Admin: Create a new agent
    PickupAgentDTO createAgent(String name, String email, String phone);

    // Admin: Get all pickup agents
    List<PickupAgentDTO> getAllAgents();

    // Assign a request to agent
    WasteRequest assignRequest(Long requestId, Long agentId);

    // Agent: Get all assigned requests
    List<WasteRequest> getAssignedRequests(Long agentId);

    // Agent: Get assigned requests filtered by status
    List<WasteRequest> getAssignedRequestsByStatus(Long agentId, WasteRequest.PickupStatus status);

    // Agent: Update pickup status
    WasteRequest updateRequestStatus(Long requestId, PickupStatusUpdateRequest request);

    // Admin: Get assigned requests grouped by agent
    List<Map<String, Object>> getAssignedRequestsGroupedByAgent();
}
