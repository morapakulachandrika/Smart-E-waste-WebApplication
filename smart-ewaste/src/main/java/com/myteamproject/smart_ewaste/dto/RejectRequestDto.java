package com.myteamproject.smart_ewaste.dto;


import lombok.Data;

@Data
public class RejectRequestDto {
    private Long requestId;
    private String reason;
}
