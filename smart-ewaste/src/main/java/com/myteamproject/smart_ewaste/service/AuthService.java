package com.myteamproject.smart_ewaste.service;

import com.myteamproject.smart_ewaste.dto.*;
import com.myteamproject.smart_ewaste.entity.User;
import com.myteamproject.smart_ewaste.entity.PickupAgent;
import com.myteamproject.smart_ewaste.entity.Role;
import com.myteamproject.smart_ewaste.repository.PickupAgentRepository;
import com.myteamproject.smart_ewaste.repository.UserRepository;
import com.myteamproject.smart_ewaste.security.CustomUserDetails;
import com.myteamproject.smart_ewaste.security.JwtUtils;

import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final TemporaryPasswordService tempPassService;
    private final EmailService emailService;
    private final EmailTemplateService emailTemplateService;
    private final PasswordEncoder encoder;
    private final JwtUtils jwtUtils;
    private final PickupAgentRepository pickupAgentRepository;

    private final String adminEmail = "admin@example.com";

    // ✅ FIXED: removed leading space
    private final String FRONTEND_URL = "http://localhost:3000";

    /*
     * =========================================================
     * REGISTER
     * =========================================================
     */
    @Transactional
    public String register(RegisterRequest request) {

        Optional<User> existingOpt = userRepository.findByEmail(request.getEmail());

        if (existingOpt.isPresent()) {
            User existingUser = existingOpt.get();

            if ("rejected".equalsIgnoreCase(existingUser.getStatus())) {

                // Reactivate rejected user
                existingUser.setFullName(request.getName());
                existingUser.setPhone(request.getPhone());
                existingUser.setApproved(false);
                existingUser.setStatus("pending");
                existingUser.setTempPasswordActive(false);
                existingUser.setFirstLogin(false);
                userRepository.save(existingUser);

                // ✅ User email (HTML)
                try {
                    String body = emailTemplateService.loadTemplate(
                            "reRegistration.html",
                            Map.of("name", existingUser.getFullName()));

                    emailService.sendHtmlMail(
                            existingUser.getEmail(),
                            "Smart E-Waste Re-Registration",
                            body);
                } catch (Exception ignored) {
                }

                // Admin email (plain text OK)
                try {
                    emailService.sendHtmlMail(
                            adminEmail,
                            "User Re-Registration Pending",
                            "<p>User re-registered and pending approval:</p>" +
                                    "<p><b>Name:</b> " + existingUser.getFullName() + "<br>" +
                                    "<b>Email:</b> " + existingUser.getEmail() + "</p>");
                } catch (Exception ignored) {
                }

                return "Re-registration submitted successfully. Wait for admin approval.";
            } else {
                throw new RuntimeException("Email already registered");
            }
        }

        // ================= NEW USER REGISTRATION =================
        User user = new User();
        user.setFullName(request.getName());
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());
        user.setApproved(false);
        user.setRole(Role.ROLE_USER);
        user.setStatus("pending");
        user.setTempPasswordActive(false);
        user.setFirstLogin(false);
        userRepository.save(user);

        // ✅ Welcome email (HTML)
        try {
            String body = emailTemplateService.loadTemplate(
                    "welcome.html",
                    Map.of("name", user.getFullName()));

            emailService.sendHtmlMail(
                    user.getEmail(),
                    "Welcome to Smart E-Waste 🌱",
                    body);
        } catch (Exception ignored) {
        }

        // Admin email
        try {
            emailService.sendHtmlMail(
                    adminEmail,
                    "User Registration Pending",
                    "<p>New user pending approval:</p>" +
                            "<p><b>Name:</b> " + user.getFullName() + "<br>" +
                            "<b>Email:</b> " + user.getEmail() + "</p>");
        } catch (Exception ignored) {
        }

        return "Registration submitted successfully. Wait for admin approval.";
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {

        // ===== 1️⃣ Try to find user in Users table =====
        Optional<User> userOpt = userRepository.findByEmail(request.getEmail());
        if (userOpt.isPresent()) {
            User user = userOpt.get();

            if ("rejected".equalsIgnoreCase(user.getStatus()))
                throw new RuntimeException("Your registration has been rejected.");

            if (!user.isApproved())
                throw new RuntimeException("User not active. Wait for admin approval.");

            boolean valid = false;

            if (user.getPassword() != null &&
                    encoder.matches(request.getPassword(), user.getPassword())) {
                valid = true;
            }

            if (!valid && user.isTempPasswordActive()) {
                valid = tempPassService.validateTempPassword(user, request.getPassword());
            }

            if (!valid)
                throw new RuntimeException("Invalid credentials");

            if (user.getActiveSince() == null) {
                user.setActiveSince(LocalDate.now());
                userRepository.save(user);
            }

            String token = jwtUtils.generateToken(new CustomUserDetails(user));

            return AuthResponse.builder()
                    .token(token)
                    .message("Login successful")
                    .role(user.getRole().name())
                    .profileCompleted(user.isProfileCompleted())
                    .userId(user.getId())
                    .build();
        }

        // ===== 2️⃣ Try to find agent in PickupAgent table =====
        PickupAgent agent = pickupAgentRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (agent.getStatus() != PickupAgent.Status.ACTIVE) {
            throw new RuntimeException("Pickup agent account is inactive.");
        }

        boolean agentValid = encoder.matches(request.getPassword(), agent.getPassword());
        if (!agentValid) {
            throw new RuntimeException("Invalid credentials");
        }

        // ✅ Generate JWT directly from PickupAgent
        String token = jwtUtils.generateToken(agent);

        return AuthResponse.builder()
                .token(token)
                .message("Login successful")
                .role("ROLE_PICKUP_AGENT")
                .profileCompleted(true)
                .userId(agent.getId())
                .build();
    }

    /*
     * =========================================================
     * FORGOT PASSWORD
     * =========================================================
     */
    @Transactional
    public String forgotPassword(ForgotPasswordRequest request) {

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getPassword() == null)
            throw new RuntimeException("No permanent password. Contact admin.");

        // Generate temporary password (15 mins)
        String temp = tempPassService.generateTempPassword(user, 15);

        String resetLink = FRONTEND_URL + "/reset-password?email=" + user.getEmail();

        String body = emailTemplateService.loadTemplate(
                "resetPassword.html",
                Map.of(
                        "name", user.getFullName(),
                        "tempPassword", temp,
                        "resetLink", resetLink));

        emailService.sendHtmlMail(
                user.getEmail(),
                " Reset Your Password – Smart E-Waste",
                body);

        return "Password reset instructions sent.";
    }

    /*
     * =========================================================
     * RESET PASSWORD
     * =========================================================
     */
    @Transactional
    public String resetPassword(ResetPasswordRequest request) {

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!request.getNewPassword().equals(request.getConfirmPassword()))
            throw new RuntimeException("Passwords do not match");

        boolean ok = tempPassService.validateTempPassword(
                user,
                request.getTemporaryPassword());

        if (!ok)
            throw new RuntimeException("Invalid or expired temporary password");

        user.setPassword(encoder.encode(request.getNewPassword()));

        if (user.isFirstLogin()) {
            user.setFirstLogin(false);
            user.setTempPasswordActive(false);
            user.setStatus("active");
        } else {
            user.setTempPasswordActive(false);
        }

        userRepository.save(user);
        tempPassService.expireTemporaryPassword(user);

        // ✅ Confirmation email (HTML)
        try {
            String body = emailTemplateService.loadTemplate(
                    "passwordUpdated.html",
                    Map.of("name", user.getFullName()));

            emailService.sendHtmlMail(
                    user.getEmail(),
                    " Password Updated Successfully",
                    body);
        } catch (Exception ignored) {
        }

        return "Password updated successfully.";
    }
}
