package com.myteamproject.smart_ewaste.controller;

import com.myteamproject.smart_ewaste.dto.WasteRequestDTO;
import com.myteamproject.smart_ewaste.entity.RequestStatus;
import com.myteamproject.smart_ewaste.service.WasteRequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/requests")
@RequiredArgsConstructor
public class WasteRequestController {

    private final WasteRequestService requestService;

    // Create request
    @PostMapping(value = "/create", consumes = "multipart/form-data")
    public ResponseEntity<WasteRequestDTO> createRequest(
            @RequestPart("request") WasteRequestDTO dto,
            @RequestPart(value = "images", required = false) List<MultipartFile> images) throws Exception {

        return ResponseEntity.ok(requestService.createRequest(dto, images));
    }

    // Get all requests (Admin)
    @GetMapping("/all")
    public ResponseEntity<List<WasteRequestDTO>> getAllRequests() {
        return ResponseEntity.ok(requestService.getAllRequests());
    }

    // Get requests by user
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<WasteRequestDTO>> getRequestsByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(requestService.getRequestsByUser(userId));
    }

    // ✅ UPDATE STATUS (ADMIN)
    @PutMapping("/{requestId}/status")
    public ResponseEntity<WasteRequestDTO> updateStatus(
            @PathVariable Long requestId,
            @RequestBody Map<String, String> payload) throws Exception {

        String status = payload.get("status");
        String reason = payload.get("reason"); // ✅ NEW

        return ResponseEntity.ok(
                requestService.updateStatus(requestId, status, reason));
    }

    // User request counts
    @GetMapping("/user/{userId}/counts")
    public ResponseEntity<Map<String, Long>> getUserRequestCounts(@PathVariable Long userId) {
        return ResponseEntity.ok(requestService.getCountsByUser(userId));
    }

    // Pending requests (Admin)
    @GetMapping("/admin/requests/new")
    public ResponseEntity<List<WasteRequestDTO>> getNewRequests() {
        return ResponseEntity.ok(
                requestService.getRequestsByStatus(RequestStatus.PENDING));
    }

    // Admin request history (ACCEPTED + REJECTED)
    @GetMapping("/admin/requests/history")
    public ResponseEntity<List<WasteRequestDTO>> getAllRequestsHistory() {
        return ResponseEntity.ok(requestService.getHistoryRequests());
    }

    // ✅ ADMIN COUNTS (NEW & REQUIRED)
    @GetMapping("/admin/counts")
    public ResponseEntity<Map<String, Long>> getAdminCounts(
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {

        return ResponseEntity.ok(
                requestService.getAdminCounts(startDate, endDate));
    }

    @GetMapping("/admin/trends")
    public ResponseEntity<List<Map<String, Object>>> getTrends(
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {

        return ResponseEntity.ok(
                requestService.getRequestTrends(startDate, endDate));
    }

    @GetMapping("/admin/device-stats")
    public ResponseEntity<List<Map<String, Object>>> getDeviceStats(
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {

        return ResponseEntity.ok(
                requestService.getDeviceWiseStats(startDate, endDate));
    }

    // ✅ ADMIN – ASSIGNABLE REQUESTS
    @GetMapping("/admin/requests/assignable")
    public ResponseEntity<List<WasteRequestDTO>> getAssignableRequests() {
        return ResponseEntity.ok(
                requestService.getAssignableRequests());
    }

}
