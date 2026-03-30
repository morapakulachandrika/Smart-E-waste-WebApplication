package com.myteamproject.smart_ewaste.service;

import com.myteamproject.smart_ewaste.dto.PasswordChangeRequest;
import com.myteamproject.smart_ewaste.dto.ProfileRequest;
import com.myteamproject.smart_ewaste.dto.UserProfileResponse;
import com.myteamproject.smart_ewaste.entity.User;
import com.myteamproject.smart_ewaste.repository.UserRepository;
import lombok.RequiredArgsConstructor;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Service
@RequiredArgsConstructor
public class UserService {

        private final UserRepository userRepository;

        private final String UPLOAD_DIR = "uploads/profile-photos/";

        // Get user profile by ID
        public UserProfileResponse getProfile(Long id) {
                User user = userRepository.findById(id)
                                .orElseThrow(() -> new RuntimeException("User not found"));

                return mapToUserProfileResponse(user);
        }

        // Update user profile
        public UserProfileResponse updateProfile(Long id, ProfileRequest request) {
                User user = userRepository.findById(id)
                                .orElseThrow(() -> new RuntimeException("User not found"));

                user.setFullName(request.getFullName());
                user.setAddress(request.getAddress());
                user.setCity(request.getCity());
                user.setState(request.getState());
                user.setPincode(request.getPincode());
                user.setPhone(request.getPhone());

                userRepository.save(user);

                return mapToUserProfileResponse(user);
        }

        // Upload profile photo
        public UserProfileResponse uploadProfilePhoto(Long userId, MultipartFile file) {
                User user = userRepository.findById(userId)
                                .orElseThrow(() -> new RuntimeException("User not found"));

                try {
                        Path uploadPath = Paths.get(UPLOAD_DIR);
                        if (!Files.exists(uploadPath)) {
                                Files.createDirectories(uploadPath);
                        }

                        String fileName = userId + "_" + file.getOriginalFilename();
                        Path filePath = uploadPath.resolve(fileName);
                        file.transferTo(filePath.toFile());

                        user.setProfilePhoto(fileName);
                        userRepository.save(user);

                        return mapToUserProfileResponse(user);

                } catch (IOException e) {
                        throw new RuntimeException("Failed to upload profile photo", e);
                }
        }

        // Change password
        public String changePassword(Long userId, PasswordChangeRequest request) {
                User user = userRepository.findById(userId)
                                .orElseThrow(() -> new RuntimeException("User not found"));

                BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

                if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
                        throw new RuntimeException("Old password is incorrect");
                }

                if (!request.getNewPassword().equals(request.getConfirmPassword())) {
                        throw new RuntimeException("New password and confirm password do not match");
                }

                user.setPassword(passwordEncoder.encode(request.getNewPassword()));
                userRepository.save(user);

                return "Password changed successfully";
        }

        // ✅ Fetch user by email (for frontend auto-fill)
        public UserProfileResponse getUserByEmail(String email) {
                User user = userRepository.findByEmail(email)
                                .orElseThrow(() -> new RuntimeException("User not found"));

                return mapToUserProfileResponse(user);
        }

        // ------------------ Helper ------------------
        private UserProfileResponse mapToUserProfileResponse(User user) {
                return new UserProfileResponse(
                                user.getId(),
                                user.getEmail(),
                                user.getFullName(),
                                user.getAddress(),
                                user.getCity(),
                                user.getState(),
                                user.getPincode(),
                                user.getPhone(), // 🔹 contact number
                                user.getProfilePhoto(),
                                user.getActiveSince());
        }

}
