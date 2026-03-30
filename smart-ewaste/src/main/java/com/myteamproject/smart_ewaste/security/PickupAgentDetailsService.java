package com.myteamproject.smart_ewaste.security;

import com.myteamproject.smart_ewaste.entity.PickupAgent;
import com.myteamproject.smart_ewaste.repository.PickupAgentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class PickupAgentDetailsService implements UserDetailsService {

    private final PickupAgentRepository pickupAgentRepository;

    @Override
    public UserDetails loadUserByUsername(String email)
            throws UsernameNotFoundException {

        return pickupAgentRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Pickup Agent not found"));
    }
}
