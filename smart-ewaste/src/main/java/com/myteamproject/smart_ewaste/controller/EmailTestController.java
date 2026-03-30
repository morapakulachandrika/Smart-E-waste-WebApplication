package com.myteamproject.smart_ewaste.controller;

import com.myteamproject.smart_ewaste.service.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class EmailTestController {

    private final EmailService emailService;

    @GetMapping("/test-email")
    public String testEmail() {
        emailService.sendHtmlMail(
                "githaalampally@gmail.com",
                "Test Email from Smart E-Waste",
                "This is a test email — email setup works!");

        return "Email sent successfully!";
    }
}
