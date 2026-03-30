package com.myteamproject.smart_ewaste.repository;

import com.myteamproject.smart_ewaste.entity.WasteRequestImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WasteRequestImageRepository extends JpaRepository<WasteRequestImage, Long> {

    List<WasteRequestImage> findByWasteRequestId(Long wasteRequestId);
}
