package com.myteamproject.smart_ewaste.service;

import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class MailServiceImpl implements MailService {

        private final EmailService emailService;
        private final EmailTemplateService emailTemplateService;

        /*
         * =========================================================
         * REQUEST SUBMITTED
         * =========================================================
         */
        @Override
        @Async
        public void sendRequestSubmittedMail(String to, Long requestId) {

                String body = emailTemplateService.loadTemplate(
                                "requestSubmitted.html",
                                Map.of("requestId", String.valueOf(requestId)));

                emailService.sendHtmlMail(
                                to,
                                " E-Waste Request Submitted Successfully",
                                body);
        }

        /*
         * =========================================================
         * REQUEST APPROVED
         * =========================================================
         */
        @Override
        @Async
        public void sendRequestApprovedMail(String to, Long requestId) {

                String body = emailTemplateService.loadTemplate(
                                "requestApproved.html",
                                Map.of("requestId", String.valueOf(requestId)));

                emailService.sendHtmlMail(
                                to,
                                "Your E-Waste Request Has Been Approved",
                                body);
        }

        /*
         * =========================================================
         * REQUEST REJECTED
         * =========================================================
         */
        @Override
        @Async
        public void sendRequestRejectedMail(String to, Long requestId, String reason) {

                String body = emailTemplateService.loadTemplate(
                                "requestRejected.html",
                                Map.of(
                                                "requestId", String.valueOf(requestId),
                                                "reason", reason));

                emailService.sendHtmlMail(
                                to,
                                " Your E-Waste Request Has Been Rejected",
                                body);
        }

        /*
         * =========================================================
         * RESCHEDULE REQUESTED
         * =========================================================
         */
        @Override
        @Async
        public void sendRescheduleRequestedMail(
                        String to,
                        Long requestId,
                        String newPickupDate,
                        String reason) {

                String body = emailTemplateService.loadTemplate(
                                "ewaste-reschedule-request.html",
                                Map.of(
                                                "requestId", String.valueOf(requestId),
                                                "newPickupDate", newPickupDate,
                                                "reason", reason));

                emailService.sendHtmlMail(
                                to,
                                "E-Waste Pickup Reschedule Requested",
                                body);
        }

        /*
         * =========================================================
         * RESCHEDULE APPROVED
         * =========================================================
         */
        @Override
        @Async
        public void sendRescheduleApprovedMail(
                        String to,
                        Long requestId,
                        String pickupDate) {

                String body = emailTemplateService.loadTemplate(
                                "ewaste-reschedule-approved.html",
                                Map.of(
                                                "requestId", String.valueOf(requestId),
                                                "pickupDate", pickupDate));

                emailService.sendHtmlMail(
                                to,
                                "E-Waste Pickup Reschedule Approved",
                                body);
        }

        /*
         * =========================================================
         * RESCHEDULE REJECTED
         * =========================================================
         */
        @Override
        @Async
        public void sendRescheduleRejectedMail(
                        String to,
                        Long requestId,
                        String reason) {

                String body = emailTemplateService.loadTemplate(
                                "ewaste-reschedule-rejected.html",
                                Map.of(
                                                "requestId", String.valueOf(requestId),
                                                "reason", reason));

                emailService.sendHtmlMail(
                                to,
                                "E-Waste Pickup Reschedule Rejected",
                                body);
        }

        @Override
        @Async
        public void sendAgentAccountCreatedMail(String to, String name, String email, String password) {
                // Use the new template
                String body = emailTemplateService.loadTemplate(
                                "pickup-agent-created.html",
                                Map.of(
                                                "name", name,
                                                "email", email,
                                                "password", password));

                emailService.sendHtmlMail(
                                to,
                                "Your Pickup Agent Account Has Been Created",
                                body);
        }

        @Override
        @Async
        public void sendRequestAssignedToAgentMail(String to, Long requestId, String pickupAddress) {
                String body = emailTemplateService.loadTemplate(
                                "pickup-request-assigned.html",
                                Map.of(
                                                "requestId", String.valueOf(requestId),
                                                "pickupAddress", pickupAddress));

                emailService.sendHtmlMail(
                                to,
                                "New Pickup Request Assigned",
                                body);
        }

        @Override
        @Async
        public void sendPickupStatusUpdatedMailToUser(String to, Long requestId, String status) {
                String body = emailTemplateService.loadTemplate(
                                "pickup-status-updated.html",
                                Map.of(
                                                "requestId", String.valueOf(requestId),
                                                "status", status));

                emailService.sendHtmlMail(
                                to,
                                "Your Pickup Status Has Been Updated",
                                body);
        }

        @Override
        @Async
        public void sendAgentAssignedToUserMail(
                        String to,
                        Long requestId,
                        String agentName,
                        String agentEmail,
                        String agentPhone,
                        String pickupDateTime) {

                String body = emailTemplateService.loadTemplate(
                                "agent-assigned-to-user.html",
                                Map.of(
                                                "requestId", String.valueOf(requestId),
                                                "agentName", agentName,
                                                "agentEmail", agentEmail,
                                                "agentPhone", agentPhone,
                                                "pickupDateTime",
                                                pickupDateTime != null ? pickupDateTime : "Not scheduled yet"));

                emailService.sendHtmlMail(
                                to,
                                "Pickup Agent Assigned for Your E-Waste Request",
                                body);
        }

}
