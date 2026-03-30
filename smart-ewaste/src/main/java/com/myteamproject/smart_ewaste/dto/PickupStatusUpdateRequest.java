package com.myteamproject.smart_ewaste.dto;

import com.myteamproject.smart_ewaste.entity.WasteRequest.PickupStatus;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PickupStatusUpdateRequest {
    private PickupStatus pickupStatus;
}
