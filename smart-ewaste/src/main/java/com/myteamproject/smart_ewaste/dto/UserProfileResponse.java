package com.myteamproject.smart_ewaste.dto;

import java.time.LocalDate;

public class UserProfileResponse {

    private Long id;
    private String email;
    private String fullName;
    private String address;
    private String city;
    private String state;
    private String pincode;
    private String phone;
    private String profilePhoto;
    private LocalDate activeSince;

    public UserProfileResponse(Long id, String email, String fullName,
            String address, String city, String state,
            String pincode, String phone, String profilePhoto,
            LocalDate activeSince) {
        this.id = id;
        this.email = email;
        this.fullName = fullName;
        this.address = address;
        this.city = city;
        this.state = state;
        this.pincode = pincode;
        this.phone = phone;
        this.profilePhoto = profilePhoto;
        this.activeSince = activeSince;
    }

    public Long getId() {
        return id;
    }

    public String getEmail() {
        return email;
    }

    public String getFullName() {
        return fullName;
    }

    public String getAddress() {
        return address;
    }

    public String getCity() {
        return city;
    }

    public String getState() {
        return state;
    }

    public String getPincode() {
        return pincode;
    }

    public String getPhone() {
        return phone;
    }

    public String getProfilePhoto() {
        return profilePhoto;
    }

    public LocalDate getActiveSince() {
        return activeSince;
    }
}
