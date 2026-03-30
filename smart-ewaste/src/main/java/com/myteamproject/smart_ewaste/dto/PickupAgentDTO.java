package com.myteamproject.smart_ewaste.dto;

import com.myteamproject.smart_ewaste.entity.PickupAgent;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PickupAgentDTO {
    private Long id;
    private String name;
    private String email;
    private String phone;
    private PickupAgent.Status status;
    private int activeRequestCount; // + getter/setter

}
