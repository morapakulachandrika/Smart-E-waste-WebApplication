package com.myteamproject.smart_ewaste.controller;

import com.myteamproject.smart_ewaste.dto.ProfileRequest;
import com.myteamproject.smart_ewaste.entity.User;
import com.myteamproject.smart_ewaste.service.ProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
public class ProfileController {

    private final ProfileService profileService;

    // Get user profile
    @GetMapping
    public ResponseEntity<User> getProfile(@RequestParam String email) {
        return profileService.getProfile(email)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Update profile
    @PutMapping
    public ResponseEntity<User> updateProfile(@RequestParam String email, @RequestBody ProfileRequest request) {
        return ResponseEntity.ok(profileService.updateProfile(email, request));
    }

    // Upload profile photo
    @PostMapping("/upload-photo")
    public ResponseEntity<User> uploadProfilePhoto(
            @RequestParam String email,
            @RequestParam("file") MultipartFile file) throws IOException {
        User updatedUser = profileService.uploadProfilePhoto(email, file);
        return ResponseEntity.ok(updatedUser);
    }

    // Change password
    @PostMapping("/change-password")
    public ResponseEntity<String> changePassword(@RequestParam String email,
            @RequestParam String oldPassword,
            @RequestParam String newPassword) {
        profileService.changePassword(email, oldPassword, newPassword);
        return ResponseEntity.ok("Password changed successfully");
    }

    // Delete account
    @DeleteMapping
    public ResponseEntity<String> deleteAccount(@RequestParam String email) {
        profileService.deleteAccount(email);
        return ResponseEntity.ok("Account deleted successfully");
    }
}
