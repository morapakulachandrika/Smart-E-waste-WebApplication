package com.myteamproject.smart_ewaste.controller;

import com.myteamproject.smart_ewaste.dto.ApproveUserRequest;
import com.myteamproject.smart_ewaste.entity.User;
import com.myteamproject.smart_ewaste.repository.UserRepository;
import com.myteamproject.smart_ewaste.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AdminController {

    private final AdminService adminService;
    private final UserRepository userRepo;

    @GetMapping("/pending-users")
    public List<User> getPendingUsers() {
        return adminService.getPendingUsers();
    }

    @PostMapping("/approve-user")
    public String approveUser(@RequestBody ApproveUserRequest request) {
        return adminService.approveUser(request);
    }

    @PostMapping("/resend-temp/{userId}")
    public String resendTemp(@PathVariable Long userId) {
        return adminService.resendTempPassword(userId);
    }

    @PostMapping("/reject/{userId}")
    public String rejectUser(@PathVariable Long userId) {
        return adminService.rejectUser(userId);
    }

    @GetMapping("/all-users")
    public List<User> allUsers() {
        return userRepo.findAllNonAdmin(); // fetch only non-admins
    }

    

}
