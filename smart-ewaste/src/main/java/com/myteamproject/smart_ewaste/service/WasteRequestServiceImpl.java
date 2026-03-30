package com.myteamproject.smart_ewaste.service;

import com.myteamproject.smart_ewaste.dto.WasteRequestDTO;
import com.myteamproject.smart_ewaste.entity.RequestStatus;
import com.myteamproject.smart_ewaste.entity.User;
import com.myteamproject.smart_ewaste.entity.WasteRequest;
import com.myteamproject.smart_ewaste.entity.WasteRequestImage;
import com.myteamproject.smart_ewaste.repository.UserRepository;
import com.myteamproject.smart_ewaste.repository.WasteRequestImageRepository;
import com.myteamproject.smart_ewaste.repository.WasteRequestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WasteRequestServiceImpl implements WasteRequestService {

    private final WasteRequestRepository requestRepo;
    private final WasteRequestImageRepository imageRepo;
    private final UserRepository userRepo;
    private final MailService mailService;

    private final String uploadDir = "uploads/";

    // ================= CREATE REQUEST =================
    @Override
    public WasteRequestDTO createRequest(WasteRequestDTO dto, List<MultipartFile> images) throws Exception {

        User user = userRepo.findById(dto.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Files.createDirectories(Paths.get(uploadDir));

        WasteRequest request = WasteRequest.builder()
                .user(user)
                .deviceType(dto.getDeviceType())
                .deviceName(dto.getDeviceName())
                .brand(dto.getBrand())
                .model(dto.getModel())
                .conditionStatus(dto.getConditionStatus())
                .quantity(dto.getQuantity())
                .address(dto.getAddress())
                .landmark(dto.getLandmark())
                .latitude(dto.getLatitude())
                .longitude(dto.getLongitude())
                .contactNumber(user.getPhone())
                .alternateContact(dto.getAlternateContact())
                .remarks(dto.getRemarks())
                .pickupScheduledAt(dto.getPickupScheduledAt())
                .status(RequestStatus.PENDING)
                .createdAt(LocalDateTime.now())
                .build();

        WasteRequest savedRequest = requestRepo.save(request);

        // ================= SAVE IMAGES =================
        if (images != null && !images.isEmpty()) {
            for (MultipartFile file : images) {
                String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
                Path filePath = Paths.get(uploadDir, fileName);
                Files.write(filePath, file.getBytes());

                WasteRequestImage image = WasteRequestImage.builder()
                        .imagePath(uploadDir + fileName)
                        .wasteRequest(savedRequest)
                        .build();

                imageRepo.save(image);
            }
        }

        // ================= SEND MAIL =================
        mailService.sendRequestSubmittedMail(user.getEmail(), savedRequest.getId());

        return mapToDTO(savedRequest);
    }

    // ================= FETCH METHODS =================
    @Override
    public List<WasteRequestDTO> getAllRequests() {
        return requestRepo.findAll()
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<WasteRequestDTO> getRequestsByUser(Long userId) {
        return requestRepo.findByUserId(userId)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<WasteRequestDTO> getRequestsByStatus(RequestStatus status) {
        return requestRepo.findByStatus(status)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    // ================= USER COUNTS =================
    @Override
    public Map<String, Long> getCountsByUser(Long userId) {
        Map<String, Long> counts = new HashMap<>();
        counts.put("total", requestRepo.countByUserId(userId));
        counts.put("pending", requestRepo.countByUserIdAndStatus(userId, RequestStatus.PENDING));
        counts.put("accepted", requestRepo.countByUserIdAndStatus(userId, RequestStatus.ACCEPTED));
        counts.put("rejected", requestRepo.countByUserIdAndStatus(userId, RequestStatus.REJECTED));
        return counts;
    }

    // ================= ADMIN COUNTS =================
    @Override
    public Map<String, Long> getAdminCounts(String startDate, String endDate) {

        LocalDateTime start = startDate != null ? LocalDateTime.parse(startDate + "T00:00:00") : null;
        LocalDateTime end = endDate != null ? LocalDateTime.parse(endDate + "T23:59:59") : null;

        Map<String, Long> counts = new HashMap<>();
        counts.put("total", requestRepo.countByDateRange(start, end));
        counts.put("pending", requestRepo.countByStatusAndDate(RequestStatus.PENDING, start, end));
        counts.put("accepted", requestRepo.countByStatusAndDate(RequestStatus.ACCEPTED, start, end));
        counts.put("rejected", requestRepo.countByStatusAndDate(RequestStatus.REJECTED, start, end));

        return counts;
    }

    // ================= TRENDS =================
    @Override
    public List<Map<String, Object>> getRequestTrends(String startDate, String endDate) {

        LocalDateTime start = (startDate != null && !startDate.isBlank())
                ? LocalDateTime.parse(startDate + "T00:00:00")
                : null;
        LocalDateTime end = (endDate != null && !endDate.isBlank())
                ? LocalDateTime.parse(endDate + "T23:59:59")
                : null;

        return requestRepo.countRequestsPerDayByDate(start, end)
                .stream()
                .map(row -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("date", row[0].toString());
                    map.put("count", ((Number) row[1]).longValue()); // ✅ Safe casting
                    return map;
                })
                .toList();
    }

    // ================= DEVICE STATS =================
    @Override
    public List<Map<String, Object>> getDeviceWiseStats(String startDate, String endDate) {

        LocalDateTime start = startDate != null ? LocalDateTime.parse(startDate + "T00:00:00") : null;
        LocalDateTime end = endDate != null ? LocalDateTime.parse(endDate + "T23:59:59") : null;

        Map<String, Map<String, Long>> grouped = new HashMap<>();

        for (Object[] row : requestRepo.getDeviceWiseStats(start, end)) {
            String device = (String) row[0];
            String status = row[1].toString().toLowerCase();
            Long count = ((Number) row[2]).longValue(); // ✅ Safe casting

            grouped.putIfAbsent(device, new HashMap<>());
            grouped.get(device).put(status, count);
        }

        return grouped.entrySet().stream().map(e -> {
            Map<String, Object> map = new HashMap<>();
            map.put("device", e.getKey());
            map.put("accepted", e.getValue().getOrDefault("accepted", 0L));
            map.put("rejected", e.getValue().getOrDefault("rejected", 0L));
            map.put("pending", e.getValue().getOrDefault("pending", 0L));
            return map;
        }).toList();
    }

    // ================= ADMIN HISTORY =================
    @Override
    public List<WasteRequestDTO> getHistoryRequests() {
        return requestRepo.findByStatusIn(List.of(RequestStatus.ACCEPTED, RequestStatus.REJECTED))
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    // ================= UPDATE STATUS =================
    @Override
    public WasteRequestDTO updateStatus(Long requestId, String status, String reason) {

        WasteRequest request = requestRepo.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        RequestStatus newStatus = RequestStatus.valueOf(status.toUpperCase());
        request.setStatus(newStatus);

        if (newStatus == RequestStatus.ACCEPTED) {
            request.setApprovedAt(LocalDateTime.now());
            request.setRejectedAt(null);
            mailService.sendRequestApprovedMail(request.getUser().getEmail(), request.getId());
        }

        if (newStatus == RequestStatus.REJECTED) {
            request.setRejectedAt(LocalDateTime.now());
            request.setApprovedAt(null);
            request.setRejectionReason(reason);
            mailService.sendRequestRejectedMail(request.getUser().getEmail(), request.getId(), reason);
        }

        return mapToDTO(requestRepo.save(request));
    }

    @Override
    public List<WasteRequestDTO> getAssignableRequests() {

        List<RequestStatus> allowedStatuses = List.of(
                RequestStatus.ACCEPTED,
                RequestStatus.RESCHEDULE_APPROVED);

        return requestRepo
                .findByStatusInAndPickupAgentIsNull(allowedStatuses)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    // ================= ENTITY → DTO =================
    private WasteRequestDTO mapToDTO(WasteRequest request) {
        List<String> imagePaths = request.getImages() == null
                ? List.of()
                : request.getImages().stream()
                        .map(WasteRequestImage::getImagePath)
                        .collect(Collectors.toList());

        return WasteRequestDTO.builder()
                .id(request.getId())
                .userId(request.getUser().getId())
                .deviceType(request.getDeviceType())
                .deviceName(request.getDeviceName())
                .brand(request.getBrand())
                .model(request.getModel())
                .conditionStatus(request.getConditionStatus())
                .quantity(request.getQuantity())
                .address(request.getAddress())
                .landmark(request.getLandmark())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .contactNumber(request.getContactNumber())
                .alternateContact(request.getAlternateContact())
                .remarks(request.getRemarks())
                .status(request.getStatus().name())
                .pickupStatus(request.getPickupStatus() != null ? request.getPickupStatus().name() : null) // NEW
                .createdAt(request.getCreatedAt())
                .approvedAt(request.getApprovedAt())
                .rejectedAt(request.getRejectedAt())
                .rejectionReason(request.getRejectionReason())
                .pickupScheduledAt(request.getPickupScheduledAt())
                .images(imagePaths)
                .assignedAgentId(request.getPickupAgent() != null ? request.getPickupAgent().getId() : null)
                .assignedAgentName(request.getPickupAgent() != null ? request.getPickupAgent().getName() : null)
                .assignedAgentEmail(request.getPickupAgent() != null ? request.getPickupAgent().getEmail() : null)
                .assignedAgentPhone(request.getPickupAgent() != null ? request.getPickupAgent().getPhone() : null)
                .build();
    }

}
