package com.myteamproject.smart_ewaste.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "waste_requests")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WasteRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 🔗 Who submitted
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // 🔹 Device Info
    private String deviceType;
    private String deviceName;
    private String brand;
    private String model;

    // 🔹 Condition
    private String conditionStatus;

    // 🔹 Quantity
    private Integer quantity;

    // 🔹 Pickup Address
    @Column(columnDefinition = "TEXT")
    private String address;
    private String landmark;

    // 🔹 Map Coordinates
    private Double latitude;
    private Double longitude;

    // 🔹 Contacts
    private String contactNumber;
    private String alternateContact;

    // 🔹 Extra
    @Column(columnDefinition = "TEXT")
    private String remarks;

    // 🔹 Status
    @Enumerated(EnumType.STRING)
    private RequestStatus status;

    // 🔹 Timeline (REAL WORLD)
    private LocalDateTime createdAt;
    private LocalDateTime approvedAt;
    private LocalDateTime rejectedAt;

    // 🔹 Pickup (future ready)
    private LocalDateTime pickupScheduledAt;

    @Column(length = 500)
    private String rejectionReason;

    // 🔹 Images
    @OneToMany(mappedBy = "wasteRequest", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<WasteRequestImage> images;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.status = RequestStatus.PENDING;
    }

    // 🔁 Reschedule
    private LocalDateTime rescheduleRequestedAt;
    private LocalDateTime rescheduledPickupAt;

    @Column(length = 500)
    private String rescheduleReason;

    @Column(length = 500)
    private String rescheduleRejectionReason;

    @ManyToOne
    @JoinColumn(name = "pickup_agent_id")
    private PickupAgent pickupAgent;

    @Enumerated(EnumType.STRING)
    private PickupStatus pickupStatus = PickupStatus.PENDING;

    public enum PickupStatus {
        PENDING,
        ASSIGNED,
        IN_PROGRESS,
        COMPLETED,
        CANCELLED
    }

}
