package com.myteamproject.smart_ewaste.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class RescheduleAdminDTO {
    private Long id;
    private Long requestId;
    private Long userId;
    private String userEmail;
    private LocalDateTime oldPickupDate;
    private LocalDateTime newPickupDate;
    private String reason;
}
