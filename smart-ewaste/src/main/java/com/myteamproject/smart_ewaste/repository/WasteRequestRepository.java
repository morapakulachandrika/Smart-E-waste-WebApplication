package com.myteamproject.smart_ewaste.repository;

import com.myteamproject.smart_ewaste.entity.PickupAgent;
import com.myteamproject.smart_ewaste.entity.RequestStatus;
import com.myteamproject.smart_ewaste.entity.WasteRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface WasteRequestRepository extends JpaRepository<WasteRequest, Long> {

    // ================= BASIC FETCHES =================

    // Find all requests by user
    List<WasteRequest> findByUserId(Long userId);

    // Find requests by status
    List<WasteRequest> findByStatus(RequestStatus status);

    // Find requests by multiple statuses (Admin History)
    List<WasteRequest> findByStatusIn(List<RequestStatus> statuses);

    // ================= USER COUNTS =================

    long countByUserId(Long userId);

    long countByUserIdAndStatus(Long userId, RequestStatus status);

    // ================= ADMIN COUNTS =================
    // ONLY requests having pickupScheduledAt

    @Query("""
                SELECT COUNT(r)
                FROM WasteRequest r
                WHERE r.pickupScheduledAt IS NOT NULL
                AND (:start IS NULL OR r.pickupScheduledAt >= :start)
                AND (:end IS NULL OR r.pickupScheduledAt <= :end)
            """)
    long countByDateRange(LocalDateTime start, LocalDateTime end);

    @Query("""
                SELECT COUNT(r)
                FROM WasteRequest r
                WHERE r.status = :status
                AND r.pickupScheduledAt IS NOT NULL
                AND (:start IS NULL OR r.pickupScheduledAt >= :start)
                AND (:end IS NULL OR r.pickupScheduledAt <= :end)
            """)
    long countByStatusAndDate(RequestStatus status, LocalDateTime start, LocalDateTime end);

    // ================= TRENDS (LINE CHART) =================
    // CRITICAL FIX: prevent DATE(NULL)

    @Query("""
                SELECT FUNCTION('DATE', r.pickupScheduledAt), COUNT(r)
                FROM WasteRequest r
                WHERE r.pickupScheduledAt IS NOT NULL
                AND (:start IS NULL OR r.pickupScheduledAt >= :start)
                AND (:end IS NULL OR r.pickupScheduledAt <= :end)
                GROUP BY FUNCTION('DATE', r.pickupScheduledAt)
                ORDER BY FUNCTION('DATE', r.pickupScheduledAt)
            """)
    List<Object[]> countRequestsPerDayByDate(LocalDateTime start, LocalDateTime end);

    // ================= DEVICE STATS (BAR CHART) =================

    @Query("""
                SELECT r.deviceType, r.status, COUNT(r)
                FROM WasteRequest r
                WHERE r.pickupScheduledAt IS NOT NULL
                AND (:start IS NULL OR r.pickupScheduledAt >= :start)
                AND (:end IS NULL OR r.pickupScheduledAt <= :end)
                GROUP BY r.deviceType, r.status
            """)
    List<Object[]> getDeviceWiseStats(LocalDateTime start, LocalDateTime end);

    // ================= RESCHEDULE SPECIFIC METHODS =================

    // Admin: Fetch all pending reschedule requests
    List<WasteRequest> findByStatusOrderByRescheduleRequestedAtDesc(RequestStatus status);

    // Admin: Count reschedule requests by status
    long countByStatus(RequestStatus status);

    // User: Fetch reschedule history (approved + rejected)
    List<WasteRequest> findByUserIdAndStatusIn(Long userId, List<RequestStatus> statuses);

    List<WasteRequest> findByPickupAgent(PickupAgent pickupAgent);

    // Fetch all requests by agent ID (optional, useful for agent view)
    List<WasteRequest> findByPickupAgentId(Long agentId);

    List<WasteRequest> findByStatusInAndPickupAgentIsNull(
            List<RequestStatus> statuses);

    long countByPickupAgentIdAndPickupStatusIn(Long agentId, List<WasteRequest.PickupStatus> statuses);

}
