package com.myteamproject.smart_ewaste.service;

import com.myteamproject.smart_ewaste.dto.WasteRequestDTO;
import com.myteamproject.smart_ewaste.entity.RequestStatus;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

public interface WasteRequestService {

    WasteRequestDTO createRequest(WasteRequestDTO dto, List<MultipartFile> images) throws Exception;

    List<WasteRequestDTO> getAllRequests();

    List<WasteRequestDTO> getRequestsByUser(Long userId);

    List<WasteRequestDTO> getRequestsByStatus(RequestStatus status);

    WasteRequestDTO updateStatus(Long requestId, String status, String reason) throws Exception;

    // User counts
    Map<String, Long> getCountsByUser(Long userId);

    // Admin history (ACCEPTED + REJECTED)
    List<WasteRequestDTO> getHistoryRequests();

    // ✅ ADMIN COUNTS (NEW)

    Map<String, Long> getAdminCounts(String startDate, String endDate);

    List<Map<String, Object>> getRequestTrends(String startDate, String endDate);

    List<Map<String, Object>> getDeviceWiseStats(String startDate, String endDate);

    List<WasteRequestDTO> getAssignableRequests();

}
