package com.myteamproject.smart_ewaste.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {

    private String token;
    private String message;
    private String role; // ADMIN or USER
    private boolean profileCompleted; // true/false
    private Long userId;

}
