package com.myteamproject.smart_ewaste.repository;

import com.myteamproject.smart_ewaste.entity.PickupAgent;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface PickupAgentRepository extends JpaRepository<PickupAgent, Long> {
    Optional<PickupAgent> findByEmail(String email);
}
