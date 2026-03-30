package com.myteamproject.smart_ewaste.service;

import com.myteamproject.smart_ewaste.dto.*;
import com.myteamproject.smart_ewaste.entity.*;
import com.myteamproject.smart_ewaste.repository.WasteRequestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class EwasteRescheduleServiceImpl implements EwasteRescheduleService {

        private final WasteRequestRepository wasteRequestRepository;
        private final MailService mailService;

        /**
         * USER → Request reschedule
         * IMPORTANT:
         * - Do NOT disturb main lifecycle (ACCEPTED stays ACCEPTED)
         * - Use RESCHEDULE_REQUESTED only as a temporary flag
         */
        @Override
        public void requestReschedule(Long requestId, ReschedulePickupRequestDTO dto) {

                WasteRequest request = wasteRequestRepository.findById(requestId)
                                .orElseThrow(() -> new RuntimeException("Request not found"));

                if (request.getStatus() == RequestStatus.RESCHEDULE_REQUESTED) {
                        throw new RuntimeException("Reschedule request already pending approval");
                }

                if (!(request.getStatus() == RequestStatus.ACCEPTED
                                || request.getStatus() == RequestStatus.RESCHEDULE_APPROVED)) {
                        throw new RuntimeException("Reschedule not allowed for current request status");
                }

                // 🔹 Store reschedule data (separate from main lifecycle)
                request.setRescheduleRequestedAt(LocalDateTime.now());
                request.setRescheduledPickupAt(dto.getNewPickupDate());
                request.setRescheduleReason(dto.getReason());

                // 🔹 TEMP status only for admin queue
                request.setStatus(RequestStatus.RESCHEDULE_REQUESTED);

                wasteRequestRepository.save(request);

                // 📧 Notify user
                mailService.sendRescheduleRequestedMail(
                                request.getUser().getEmail(),
                                request.getId(),
                                request.getRescheduledPickupAt().toString(),
                                request.getRescheduleReason());
        }

        /**
         * ADMIN → Approve reschedule
         * IMPORTANT:
         * - Keep request ACCEPTED
         * - Update pickup date only
         */
        @Override
        public void approveReschedule(Long requestId) {

                WasteRequest request = wasteRequestRepository.findById(requestId)
                                .orElseThrow(() -> new RuntimeException("Request not found"));

                // 🔹 Apply new pickup date
                request.setPickupScheduledAt(request.getRescheduledPickupAt());

                // 🔹 Restore original lifecycle
                request.setStatus(RequestStatus.ACCEPTED);

                wasteRequestRepository.save(request);

                // 📧 Notify user
                mailService.sendRescheduleApprovedMail(
                                request.getUser().getEmail(),
                                request.getId(),
                                request.getPickupScheduledAt().toString());
        }

        /**
         * ADMIN → Reject reschedule
         * IMPORTANT:
         * - Keep request ACCEPTED
         * - Just reject the reschedule attempt
         */
        @Override
        public void rejectReschedule(Long requestId, RescheduleRejectionDTO dto) {

                WasteRequest request = wasteRequestRepository.findById(requestId)
                                .orElseThrow(() -> new RuntimeException("Request not found"));

                request.setRescheduleRejectionReason(dto.getReason());

                // 🔹 Restore lifecycle (do NOT mark main request rejected)
                request.setStatus(RequestStatus.ACCEPTED);

                wasteRequestRepository.save(request);

                // 📧 Notify user
                mailService.sendRescheduleRejectedMail(
                                request.getUser().getEmail(),
                                request.getId(),
                                dto.getReason());
        }

        /**
         * ADMIN → View pending reschedules
         * Used ONLY for reschedule card/table
         */
        @Override
        public List<RescheduleAdminDTO> getPendingReschedules() {

                List<WasteRequest> requests = wasteRequestRepository.findByStatusOrderByRescheduleRequestedAtDesc(
                                RequestStatus.RESCHEDULE_REQUESTED);

                return requests.stream().map(r -> {
                        RescheduleAdminDTO dto = new RescheduleAdminDTO();
                        dto.setId(r.getId());
                        dto.setRequestId(r.getId());

                        // ✅ UI FIX: these were causing "-"
                        dto.setUserId(r.getUser().getId());
                        dto.setUserEmail(r.getUser().getEmail());
                        dto.setOldPickupDate(r.getPickupScheduledAt());
                        dto.setNewPickupDate(r.getRescheduledPickupAt());
                        dto.setReason(r.getRescheduleReason());

                        return dto;
                }).toList();
        }
}
