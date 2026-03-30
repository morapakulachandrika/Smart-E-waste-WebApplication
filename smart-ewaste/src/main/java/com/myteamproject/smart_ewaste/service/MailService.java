package com.myteamproject.smart_ewaste.service;

public interface MailService {

        void sendRequestSubmittedMail(String to, Long requestId);

        void sendRequestApprovedMail(String to, Long requestId);

        void sendRequestRejectedMail(String to, Long requestId, String reason);

        // 🔁 RESCHEDULE
        void sendRescheduleRequestedMail(
                        String to,
                        Long requestId,
                        String newPickupDate,
                        String reason);

        void sendRescheduleApprovedMail(
                        String to,
                        Long requestId,
                        String pickupDate);

        void sendRescheduleRejectedMail(
                        String to,
                        Long requestId,
                        String reason);

        // ------------------- Pickup Agent Emails -------------------
        // ================= PICKUP AGENT MAILS =================

        void sendAgentAccountCreatedMail(
                        String to,
                        String name,
                        String email,
                        String password);

        void sendRequestAssignedToAgentMail(
                        String to,
                        Long requestId,
                        String pickupAddress);

        void sendPickupStatusUpdatedMailToUser(
                        String to,
                        Long requestId,
                        String status);

        // Notify user that a pickup agent has been assigned
        void sendAgentAssignedToUserMail(
                        String to,
                        Long requestId,
                        String agentName,
                        String agentEmail,
                        String agentPhone,
                        String pickupDateTime);

}
