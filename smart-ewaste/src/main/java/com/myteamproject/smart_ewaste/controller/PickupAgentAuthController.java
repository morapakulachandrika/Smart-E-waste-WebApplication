package com.myteamproject.smart_ewaste.controller;

import com.myteamproject.smart_ewaste.dto.AuthResponse;
import com.myteamproject.smart_ewaste.dto.PickupAgentLoginRequest;
import com.myteamproject.smart_ewaste.entity.PickupAgent;
import com.myteamproject.smart_ewaste.security.JwtUtils;

import lombok.RequiredArgsConstructor;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/pickup-agent/auth")
@RequiredArgsConstructor
public class PickupAgentAuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtUtils jwtUtils;

    @PostMapping("/login")
    public AuthResponse login(@RequestBody PickupAgentLoginRequest request) {

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()));

        PickupAgent agent = (PickupAgent) authentication.getPrincipal();

        // 🔒 Block inactive agents
        if (agent.getStatus() != PickupAgent.Status.ACTIVE) {
            throw new RuntimeException("Pickup agent account is inactive");
        }

        String token = jwtUtils.generateToken(agent);

        return AuthResponse.builder()
                .token(token)
                .message("Pickup Agent login successful")
                .role("PICKUP_AGENT")
                .profileCompleted(true)
                .userId(agent.getId())
                .build();
    }
}
