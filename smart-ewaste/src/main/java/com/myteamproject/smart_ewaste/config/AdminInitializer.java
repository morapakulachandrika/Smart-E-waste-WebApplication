package com.myteamproject.smart_ewaste.config;

import com.myteamproject.smart_ewaste.entity.Role;
import com.myteamproject.smart_ewaste.entity.User;
import com.myteamproject.smart_ewaste.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
@RequiredArgsConstructor
public class AdminInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        String adminEmail = "admin@example.com";
        if (!userRepository.existsByEmail(adminEmail)) {
            User admin = new User();
            admin.setFullName("Ewaste - Admin");
            admin.setEmail(adminEmail);
            admin.setPhone("0000000000");
            admin.setPassword(passwordEncoder.encode("Admin@123")); // default
            admin.setApproved(true);
            admin.setRole(Role.ROLE_ADMIN);     // ✅ FIXED
            admin.setTempPasswordActive(false);
            admin.setStatus("active");       // default active status
            userRepository.save(admin);
            System.out.println("Default admin created: " + adminEmail + " / Admin@123");
        }
    }
}
