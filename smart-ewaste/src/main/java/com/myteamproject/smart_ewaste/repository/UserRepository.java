package com.myteamproject.smart_ewaste.repository;

import com.myteamproject.smart_ewaste.entity.User;
import com.myteamproject.smart_ewaste.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    List<User> findByApproved(boolean approved);

    List<User> findByRole(Role role);

    // ⭐ New method for status-based filtering
    List<User> findByStatus(String status);

    // Fetch all users except admins
    @Query("SELECT u FROM User u WHERE u.role <> 'ROLE_ADMIN'")
    List<User> findAllNonAdmin();
}
