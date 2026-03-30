package com.myteamproject.smart_ewaste.dto;

import lombok.Data;

@Data
public class ProfileRequest {
    private String email;
    private String fullName;
    private String address;
    private String city;
    private String state;
    private String pincode;
    private String phone;
}
