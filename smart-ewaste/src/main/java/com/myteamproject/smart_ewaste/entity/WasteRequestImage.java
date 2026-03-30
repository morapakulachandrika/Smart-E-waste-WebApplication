package com.myteamproject.smart_ewaste.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "waste_request_images")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WasteRequestImage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String imagePath;

    @ManyToOne
    @JoinColumn(name = "waste_request_id")
    private WasteRequest wasteRequest;
}
