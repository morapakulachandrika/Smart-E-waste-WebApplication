package com.myteamproject.smart_ewaste.repository;

import com.myteamproject.smart_ewaste.entity.TemporaryPassword;
import com.myteamproject.smart_ewaste.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TemporaryPasswordRepository extends JpaRepository<TemporaryPassword, Long> {
    Optional<TemporaryPassword> findByUser(User user);
}
