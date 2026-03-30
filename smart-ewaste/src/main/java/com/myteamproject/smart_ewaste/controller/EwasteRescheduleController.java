package com.myteamproject.smart_ewaste.controller;

import com.myteamproject.smart_ewaste.dto.*;
import com.myteamproject.smart_ewaste.service.EwasteRescheduleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.myteamproject.smart_ewaste.dto.RescheduleAdminDTO;
import java.util.List;

@RestController
@RequestMapping("/api/ewaste/reschedule")
@RequiredArgsConstructor
public class EwasteRescheduleController {

    private final EwasteRescheduleService rescheduleService;

    // USER
    @PostMapping("/{requestId}")
    public ResponseEntity<?> requestReschedule(
            @PathVariable Long requestId,
            @RequestBody ReschedulePickupRequestDTO dto) {

        rescheduleService.requestReschedule(requestId, dto);
        return ResponseEntity.ok("Reschedule request submitted");
    }

    // ADMIN
    @PostMapping("/{requestId}/approve")
    public ResponseEntity<?> approveReschedule(@PathVariable Long requestId) {

        rescheduleService.approveReschedule(requestId);
        return ResponseEntity.ok("Reschedule approved");
    }

    // ADMIN
    @PostMapping("/{requestId}/reject")
    public ResponseEntity<?> rejectReschedule(
            @PathVariable Long requestId,
            @RequestBody RescheduleRejectionDTO dto) {

        rescheduleService.rejectReschedule(requestId, dto);
        return ResponseEntity.ok("Reschedule rejected");
    }

    // ADMIN: Get all pending reschedule requests
    @GetMapping("/admin/pending")
    public ResponseEntity<?> getPendingReschedules() {
        return ResponseEntity.ok(rescheduleService.getPendingReschedules());
    }

}
