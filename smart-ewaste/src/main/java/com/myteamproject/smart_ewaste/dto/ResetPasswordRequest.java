package com.myteamproject.smart_ewaste.dto;

import lombok.Data;

@Data
public class ResetPasswordRequest {
    private String email;
    private String temporaryPassword; // temp from email
    private String newPassword;
    private String confirmPassword;   // added field
}
