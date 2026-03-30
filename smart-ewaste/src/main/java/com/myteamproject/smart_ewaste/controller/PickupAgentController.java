package com.myteamproject.smart_ewaste.controller;

import com.myteamproject.smart_ewaste.dto.PickupAgentDTO;
import com.myteamproject.smart_ewaste.dto.PickupStatusUpdateRequest;
import com.myteamproject.smart_ewaste.dto.WasteRequestDTO;
import com.myteamproject.smart_ewaste.entity.PickupAgent;
import com.myteamproject.smart_ewaste.entity.WasteRequest;
import com.myteamproject.smart_ewaste.service.PickupAgentService;
import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.List;

@RestController
@RequestMapping("/api/pickup-agent")
@RequiredArgsConstructor
public class PickupAgentController {

    private final PickupAgentService pickupAgentService;

    // ================= AGENT APIs =================
    @PreAuthorize("hasRole('PICKUP_AGENT')")
    @GetMapping("/requests")
    public List<WasteRequest> getAssignedRequests(Authentication authentication) {
        PickupAgent agent = (PickupAgent) authentication.getPrincipal();
        return pickupAgentService.getAssignedRequests(agent.getId());
    }

    @PreAuthorize("hasRole('PICKUP_AGENT')")
    @PatchMapping("/request/{requestId}/status")
    public WasteRequest updateStatus(
            @PathVariable Long requestId,
            @RequestBody PickupStatusUpdateRequest request,
            Authentication authentication) {

        return pickupAgentService.updateRequestStatus(requestId, request);
    }

    // ================= ADMIN APIs =================
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/admin/create")
    public PickupAgentDTO createAgent(@RequestBody PickupAgentDTO agentDTO) {
        // Simple null check
        if (agentDTO.getName() == null || agentDTO.getEmail() == null || agentDTO.getPhone() == null) {
            throw new RuntimeException("All fields are required");
        }
        return pickupAgentService.createAgent(agentDTO.getName(), agentDTO.getEmail(), agentDTO.getPhone());
    }

    // ================= ADMIN APIs =================
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/admin/all")
    public List<PickupAgentDTO> getAllAgents() {
        return pickupAgentService.getAllAgents();
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/admin/assign")
    public WasteRequest assignRequest(
            @RequestParam Long requestId,
            @RequestParam Long agentId) {

        return pickupAgentService.assignRequest(requestId, agentId);
    }

    // ================= ADMIN – ASSIGNED REQUEST HISTORY =================
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/admin/assigned")
    public ResponseEntity<List<Map<String, Object>>> getAssignedRequestsHistory() {
        return ResponseEntity.ok(pickupAgentService.getAssignedRequestsGroupedByAgent());
    }

    // ================= AGENT DASHBOARD COUNT =================
    @PreAuthorize("hasRole('PICKUP_AGENT')")
    @GetMapping("/dashboard/counts")
    public Map<String, Long> getDashboardCounts(Authentication authentication) {
        PickupAgent agent = (PickupAgent) authentication.getPrincipal();
        List<WasteRequest> requests = pickupAgentService.getAssignedRequests(agent.getId());

        long total = requests.size();
        long assigned = requests.stream()
                .filter(r -> r.getPickupStatus() == WasteRequest.PickupStatus.ASSIGNED)
                .count();
        long inProgress = requests.stream()
                .filter(r -> r.getPickupStatus() == WasteRequest.PickupStatus.IN_PROGRESS)
                .count();
        long completed = requests.stream()
                .filter(r -> r.getPickupStatus() == WasteRequest.PickupStatus.COMPLETED)
                .count();

        return Map.of(
                "total", total,
                "assigned", assigned,
                "inProgress", inProgress,
                "completed", completed);
    }

    // ================= AGENT DASHBOARD TABLE =================
    @PreAuthorize("hasRole('PICKUP_AGENT')")
    @GetMapping("/dashboard/requests")
    public List<WasteRequestDTO> getRequestsByStatus(
            @RequestParam(required = false) String status,
            Authentication authentication) {

        PickupAgent agent = (PickupAgent) authentication.getPrincipal();
        List<WasteRequest> requests = pickupAgentService.getAssignedRequests(agent.getId());

        // Filter by status if provided
        if (status != null && !status.isEmpty()) {
            WasteRequest.PickupStatus filterStatus;
            try {
                filterStatus = WasteRequest.PickupStatus.valueOf(status.toUpperCase());
            } catch (IllegalArgumentException e) {
                throw new RuntimeException("Invalid status: " + status);
            }
            requests = requests.stream()
                    .filter(r -> r.getPickupStatus() == filterStatus)
                    .toList();
        }

        // Convert to DTO
        return requests.stream()
                .map(WasteRequestDTO::fromEntityForAgent)
                .toList();
    }
}