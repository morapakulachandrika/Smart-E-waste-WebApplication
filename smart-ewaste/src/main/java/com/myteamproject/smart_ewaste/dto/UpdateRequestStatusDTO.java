package com.myteamproject.smart_ewaste.dto;

import com.myteamproject.smart_ewaste.entity.RequestStatus;
import lombok.Data;

@Data
public class UpdateRequestStatusDTO {
    private Long requestId;
    private RequestStatus status;
}
