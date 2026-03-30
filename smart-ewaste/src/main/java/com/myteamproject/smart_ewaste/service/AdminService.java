package com.myteamproject.smart_ewaste.service;

import com.myteamproject.smart_ewaste.dto.ApproveUserRequest;
import com.myteamproject.smart_ewaste.entity.User;
import com.myteamproject.smart_ewaste.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final TemporaryPasswordService tempPassService;
    private final EmailService emailService;
    private final EmailTemplateService emailTemplateService;

    // ✅ FIXED: removed leading space
    private final String FRONTEND_URL = "http://localhost:3000";

    /* =========================================================
       FETCH PENDING USERS
       ========================================================= */
    public List<User> getPendingUsers() {
        return userRepository.findByStatus("pending");
    }

    /* =========================================================
       APPROVE USER
       ========================================================= */
    public String approveUser(ApproveUserRequest request) {

        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.isApproved() && !"pending".equalsIgnoreCase(user.getStatus())) {
            return "User already approved";
        }

        // ---- STATE CHANGES ----
        user.setApproved(true);
        user.setStatus("approved");     // approved but not active
        user.setFirstLogin(true);       // must change password
        userRepository.save(user);

        sendApprovalEmailAsync(user);

        return "User approved. Approval email will be sent shortly.";
    }

    /* =========================================================
       APPROVAL EMAIL
       ========================================================= */
    @Async
    public void sendApprovalEmailAsync(User user) {

        String tempPass = tempPassService.generateTempPassword(user, 0);
        String resetLink = FRONTEND_URL + "/reset-password?email=" + user.getEmail();

        String body = emailTemplateService.loadTemplate(
                "userApproved.html",
                Map.of(
                        "name", user.getFullName(),
                        "tempPassword", tempPass,
                        "resetLink", resetLink
                )
        );

        emailService.sendHtmlMail(
                user.getEmail(),
                "🎉 Smart E-Waste Account Approved",
                body
        );
    }

    /* =========================================================
       RESEND TEMP PASSWORD
       ========================================================= */
    public String resendTempPassword(Long userId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!user.isApproved()) {
            throw new RuntimeException("User is not approved yet");
        }

        sendResendTempEmailAsync(user);
        return "Temporary password will be resent shortly.";
    }

    @Async
    public void sendResendTempEmailAsync(User user) {

        String temp = tempPassService.generateTempPassword(user, 0);
        String resetLink = FRONTEND_URL + "/reset-password?email=" + user.getEmail();

        String body = emailTemplateService.loadTemplate(
                "tempPasswordResent.html",
                Map.of(
                        "name", user.getFullName(),
                        "tempPassword", temp,
                        "resetLink", resetLink
                )
        );

        emailService.sendHtmlMail(
                user.getEmail(),
                "🔐 Temporary Password Reissued – Smart E-Waste",
                body
        );
    }

    /* =========================================================
       REJECT USER
       ========================================================= */
    public String rejectUser(Long userId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setApproved(false);
        user.setStatus("rejected");
        userRepository.save(user);

        sendRejectionEmailAsync(user);

        return "User rejected successfully. Rejection email will be sent shortly.";
    }

    @Async
    public void sendRejectionEmailAsync(User user) {

        String body = emailTemplateService.loadTemplate(
                "userRejected.html",
                Map.of("name", user.getFullName())
        );

        emailService.sendHtmlMail(
                user.getEmail(),
                "❌ Smart E-Waste Registration Rejected",
                body
        );
    }
}
