package com.myteamproject.smart_ewaste.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PickupAgentLoginRequest {
    private String email;
    private String password;
}
