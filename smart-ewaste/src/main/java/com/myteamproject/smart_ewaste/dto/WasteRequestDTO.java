package com.myteamproject.smart_ewaste.dto;

import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

import com.myteamproject.smart_ewaste.entity.WasteRequest;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WasteRequestDTO {

    private Long id;

    // User ID only (avoid full User object in DTO)
    private Long userId;

    private String deviceType;
    private String deviceName;
    private String brand;
    private String model;

    private String conditionStatus;
    private Integer quantity;

    private String address;
    private String landmark;

    private Double latitude;
    private Double longitude;

    private String contactNumber;
    private String alternateContact;

    private String remarks;
    private String status;

    private LocalDateTime createdAt;

    private LocalDateTime approvedAt;
    private LocalDateTime rejectedAt;
    private String rejectionReason;

    private LocalDateTime pickupScheduledAt;

    // List of image paths
    private List<String> images;
    private String pickupStatus; // ASSIGNED, IN_PROGRESS, COMPLETED

    private Long assignedAgentId;
    private String assignedAgentName;
    private String assignedAgentEmail;
    private String assignedAgentPhone;

    // ---------------- Agent Dashboard Fields ----------------
    private LocalDateTime rescheduledPickupAt;
    private String rescheduleReason;

    private boolean canMarkInProgress; // for action buttons
    private boolean canMarkCompleted; // for action buttons

    public static WasteRequestDTO fromEntityForAgent(WasteRequest request) {
        WasteRequestDTO dto = new WasteRequestDTO();

        dto.setId(request.getId());
        dto.setUserId(request.getUser().getId());
        dto.setDeviceType(request.getDeviceType());
        dto.setDeviceName(request.getDeviceName());
        dto.setBrand(request.getBrand());
        dto.setModel(request.getModel());
        dto.setConditionStatus(request.getConditionStatus());
        dto.setQuantity(request.getQuantity());
        dto.setAddress(request.getAddress());
        dto.setLandmark(request.getLandmark());
        dto.setContactNumber(request.getContactNumber());
        dto.setAlternateContact(request.getAlternateContact());
        dto.setRemarks(request.getRemarks());
        dto.setStatus(request.getPickupStatus().name()); // Agent sees PickupStatus
        dto.setPickupScheduledAt(request.getPickupScheduledAt());
        dto.setPickupStatus(request.getPickupStatus() != null ? request.getPickupStatus().name() : null);

        // Reschedule info (if any)
        dto.setRescheduledPickupAt(request.getRescheduledPickupAt());
        dto.setRescheduleReason(request.getRescheduleReason());

        // Assigned agent info
        if (request.getPickupAgent() != null) {
            dto.setAssignedAgentId(request.getPickupAgent().getId());
            dto.setAssignedAgentName(request.getPickupAgent().getName());
            dto.setAssignedAgentEmail(request.getPickupAgent().getEmail());
            dto.setAssignedAgentPhone(request.getPickupAgent().getPhone());
        }

        return dto;
    }

}
