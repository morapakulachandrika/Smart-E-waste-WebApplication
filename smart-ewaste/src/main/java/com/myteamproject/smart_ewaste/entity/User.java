package com.myteamproject.smart_ewaste.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String fullName;

    public String getFullName() {
        return fullName;
    }

    @Column(unique = true, nullable = false)
    private String email;

    private String phone;

    private String password; // bcrypt password

    // APPROVAL & FIRST LOGIN FLAGS
    private boolean approved = false; // users are not approved by default
    private boolean tempPasswordActive = false; // temp password usage
    private boolean isFirstLogin = true; // new user = first login TRUE

    @Enumerated(EnumType.STRING)
    private Role role = Role.ROLE_USER; // default new user role

    // NEW IMPORTANT FIELD
    @Column(nullable = false)
    private String status = "pending"; // new users start as pending

    // PROFILE DETAILS
    private String address;
    private String city;
    private String state;
    private String pincode;
    private String profilePhoto; // URL or base64
    private boolean profileCompleted = false;
    private LocalDate activeSince; // NEW FIELD
}
