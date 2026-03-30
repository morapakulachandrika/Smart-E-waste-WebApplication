package com.myteamproject.smart_ewaste.service;

import com.myteamproject.smart_ewaste.dto.ReschedulePickupRequestDTO;
import com.myteamproject.smart_ewaste.dto.RescheduleRejectionDTO;
import com.myteamproject.smart_ewaste.dto.RescheduleAdminDTO;
import java.util.List;

public interface EwasteRescheduleService {

    void requestReschedule(Long requestId, ReschedulePickupRequestDTO dto);

    void approveReschedule(Long requestId);

    void rejectReschedule(Long requestId, RescheduleRejectionDTO dto);

    List<RescheduleAdminDTO> getPendingReschedules();

}
