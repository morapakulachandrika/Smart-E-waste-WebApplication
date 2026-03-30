package com.myteamproject.smart_ewaste.controller;

import com.myteamproject.smart_ewaste.dto.PasswordChangeRequest;
import com.myteamproject.smart_ewaste.dto.ProfileRequest;
import com.myteamproject.smart_ewaste.dto.UserProfileResponse;
import com.myteamproject.smart_ewaste.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class UserController {

    private final UserService userService;

    @GetMapping("/{id}")
    public UserProfileResponse getProfile(@PathVariable Long id) {
        return userService.getProfile(id);
    }

    @GetMapping("/email/{email}")
    public UserProfileResponse getUserByEmail(@PathVariable String email) {
        return userService.getUserByEmail(email);
    }

    @PutMapping("/update/{id}")
    public UserProfileResponse updateProfile(
            @PathVariable Long id,
            @RequestBody ProfileRequest request) {
        return userService.updateProfile(id, request);
    }

    @PostMapping("/{id}/upload-photo")
    public UserProfileResponse uploadProfilePhoto(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file) {
        return userService.uploadProfilePhoto(id, file);
    }

    @PostMapping("/{id}/change-password")
    public String changePassword(
            @PathVariable Long id,
            @RequestBody PasswordChangeRequest request) {
        return userService.changePassword(id, request);
    }

}
