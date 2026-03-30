package com.myteamproject.smart_ewaste.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TemporaryPassword {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Hashed temporary password (bcrypt)
     */
    @Column(nullable = false)
    private String tempPasswordHash;

    /**
     * If null -> does not expire (used for admin-created temps per your
     * requirement).
     * Otherwise expiry time in LocalDateTime (for forgot-password flow).
     */
    private LocalDateTime expiryTime;

    @OneToOne
    @JoinColumn(name = "user_id", unique = true)
    private User user;
}
