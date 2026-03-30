package com.myteamproject.smart_ewaste.service;

import com.myteamproject.smart_ewaste.dto.PickupAgentDTO;
import com.myteamproject.smart_ewaste.dto.PickupStatusUpdateRequest;
import com.myteamproject.smart_ewaste.entity.PickupAgent;
import com.myteamproject.smart_ewaste.entity.RequestStatus;
import com.myteamproject.smart_ewaste.entity.WasteRequest;
import com.myteamproject.smart_ewaste.repository.PickupAgentRepository;
import com.myteamproject.smart_ewaste.repository.WasteRequestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Map;

import java.util.HashMap;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PickupAgentServiceImpl implements PickupAgentService {

        private final PickupAgentRepository pickupAgentRepository;
        private final WasteRequestRepository wasteRequestRepository;
        private final PasswordEncoder passwordEncoder;
        private final MailService mailService;
        private static final int MAX_ACTIVE_REQUESTS_PER_AGENT = 5; // adjust as needed//

        private String generateRandomPassword() {
                return UUID.randomUUID()
                                .toString()
                                .replace("-", "")
                                .substring(0, 8);
        }

        /*
         * =========================================================
         * CREATE PICKUP AGENT (ADMIN)
         * =========================================================
         */
        @Override
        public PickupAgentDTO createAgent(String name, String email, String phone) {

                if (pickupAgentRepository.findByEmail(email).isPresent()) {
                        throw new RuntimeException("Pickup Agent with this email already exists");
                }

                String rawPassword = generateRandomPassword();

                PickupAgent agent = PickupAgent.builder()
                                .name(name)
                                .email(email)
                                .phone(phone)
                                .password(passwordEncoder.encode(rawPassword))
                                .status(PickupAgent.Status.ACTIVE)
                                .build();

                PickupAgent saved = pickupAgentRepository.save(agent);

                mailService.sendAgentAccountCreatedMail(
                                saved.getEmail(),
                                saved.getName(),
                                saved.getEmail(),
                                rawPassword);

                return toDTO(saved);
        }

        /*
         * =========================================================
         * GET ALL PICKUP AGENTS (ADMIN) ✅ FIXED
         * =========================================================
         */
        @Override
        public List<PickupAgentDTO> getAllAgents() {
                return pickupAgentRepository.findAll()
                                .stream()
                                .map(agent -> {
                                        long activeCount = wasteRequestRepository.findByPickupAgent(agent).stream()
                                                        .filter(r -> r.getPickupStatus() != WasteRequest.PickupStatus.COMPLETED
                                                                        && r.getPickupStatus() != WasteRequest.PickupStatus.CANCELLED)
                                                        .count();

                                        PickupAgentDTO dto = toDTO(agent);
                                        dto.setActiveRequestCount((int) activeCount); // Add this field in DTO
                                        return dto;
                                })
                                .collect(Collectors.toList());
        }

        /*
         * =========================================================
         * ASSIGN REQUEST TO AGENT (ADMIN)
         * =========================================================
         */
        @Override
        public WasteRequest assignRequest(Long requestId, Long agentId) {

                WasteRequest request = wasteRequestRepository.findById(requestId)
                                .orElseThrow(() -> new RuntimeException("Request not found"));

                // ❌ Allow assignment only for approved requests
                if (!(request.getStatus() == RequestStatus.ACCEPTED ||
                                request.getStatus() == RequestStatus.RESCHEDULE_APPROVED)) {
                        throw new RuntimeException("Request is not approved for pickup assignment");
                }

                // ❌ Prevent double assignment
                if (request.getPickupAgent() != null) {
                        throw new RuntimeException("Request already assigned to an agent");
                }

                PickupAgent agent = pickupAgentRepository.findById(agentId)
                                .orElseThrow(() -> new RuntimeException("Pickup agent not found"));

                // ❌ Prevent inactive agent assignment
                if (agent.getStatus() != PickupAgent.Status.ACTIVE) {
                        throw new RuntimeException("Cannot assign inactive pickup agent");
                }

                // ✅ NEW: Check active request limit
                long activeCount = wasteRequestRepository.countByPickupAgentIdAndPickupStatusIn(
                                agentId,
                                List.of(WasteRequest.PickupStatus.ASSIGNED, WasteRequest.PickupStatus.IN_PROGRESS));

                // adjust limit here
                if (activeCount >= MAX_ACTIVE_REQUESTS_PER_AGENT) {
                        throw new RuntimeException("Agent has reached maximum active requests ("
                                        + MAX_ACTIVE_REQUESTS_PER_AGENT + ")");
                }

                // ✅ Assign agent
                request.setPickupAgent(agent);
                request.setPickupStatus(WasteRequest.PickupStatus.ASSIGNED);

                WasteRequest saved = wasteRequestRepository.save(request);

                // 📧 Mail notification to agent
                mailService.sendRequestAssignedToAgentMail(
                                agent.getEmail(),
                                saved.getId(),
                                saved.getAddress());

                // Notify User
                mailService.sendAgentAssignedToUserMail(
                                saved.getUser().getEmail(),
                                saved.getId(),
                                agent.getName(),
                                agent.getEmail(),
                                agent.getPhone(),
                                saved.getPickupScheduledAt() != null ? saved.getPickupScheduledAt().toString() : null);

                return saved;
        }

        /*
         * =========================================================
         * AGENT VIEW ASSIGNED REQUESTS
         * =========================================================
         */
        @Override
        public List<WasteRequest> getAssignedRequestsByStatus(Long agentId, WasteRequest.PickupStatus status) {
                return wasteRequestRepository.findByPickupAgentId(agentId)
                                .stream()
                                .filter(r -> r.getPickupStatus() == status)
                                .collect(Collectors.toList());
        }

        @Override
        public List<WasteRequest> getAssignedRequests(Long agentId) {
                // Returns all requests for the agent (without status filter)
                return wasteRequestRepository.findByPickupAgentId(agentId);
        }

        /*
         * =========================================================
         * AGENT UPDATES PICKUP STATUS
         * =========================================================
         */
        @Override
        public WasteRequest updateRequestStatus(Long requestId, PickupStatusUpdateRequest request) {

                WasteRequest wr = wasteRequestRepository.findById(requestId)
                                .orElseThrow(() -> new RuntimeException("Request not found"));

                // Update pickup status only
                wr.setPickupStatus(request.getPickupStatus());

                WasteRequest updated = wasteRequestRepository.save(wr);

                // Notify user via email
                mailService.sendPickupStatusUpdatedMailToUser(
                                wr.getUser().getEmail(),
                                wr.getId(),
                                wr.getPickupStatus().name());

                return updated;
        }

        @Override
        public List<Map<String, Object>> getAssignedRequestsGroupedByAgent() {
                List<PickupAgent> agents = pickupAgentRepository.findAll();

                List<Map<String, Object>> result = new ArrayList<>();
                for (PickupAgent agent : agents) {
                        List<WasteRequest> requests = wasteRequestRepository.findByPickupAgent(agent);

                        Map<String, Object> map = new HashMap<>();
                        map.put("agent", toDTO(agent));
                        map.put("requests", requests.stream().map(r -> {
                                Map<String, Object> reqMap = new HashMap<>();
                                reqMap.put("id", r.getId());
                                reqMap.put("deviceType", r.getDeviceType());
                                reqMap.put("brand", r.getBrand());
                                reqMap.put("model", r.getModel());
                                reqMap.put("address", r.getAddress());
                                reqMap.put("pickupScheduledAt", r.getPickupScheduledAt());
                                reqMap.put("pickupStatus", r.getPickupStatus().name()); // ✅ Add this
                                return reqMap;
                        }).collect(Collectors.toList()));
                        result.add(map);
                }
                return result;
        }

        /*
         * =========================================================
         * DTO MAPPER (PRIVATE)
         * =========================================================
         */
        private PickupAgentDTO toDTO(PickupAgent agent) {
                return PickupAgentDTO.builder()
                                .id(agent.getId())
                                .name(agent.getName())
                                .email(agent.getEmail())
                                .phone(agent.getPhone())
                                .status(agent.getStatus()) // ✅ FIX
                                .build();
        }

}
