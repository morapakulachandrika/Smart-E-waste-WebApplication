package com.myteamproject.smart_ewaste.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ReschedulePickupRequestDTO {

    private LocalDateTime newPickupDate;
    private String reason;
}
