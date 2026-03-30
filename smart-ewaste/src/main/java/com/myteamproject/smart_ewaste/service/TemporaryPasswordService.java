package com.myteamproject.smart_ewaste.service;

import com.myteamproject.smart_ewaste.entity.TemporaryPassword;
import com.myteamproject.smart_ewaste.entity.User;
import com.myteamproject.smart_ewaste.repository.TemporaryPasswordRepository;
import com.myteamproject.smart_ewaste.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.apache.commons.lang3.RandomStringUtils;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class TemporaryPasswordService {

    private final TemporaryPasswordRepository tempRepo;
    private final UserRepository userRepository;
    private final PasswordEncoder encoder;

    @Transactional
    public String generateTempPassword(User user, int expiresInMinutes) {
        String raw = RandomStringUtils.randomAlphanumeric(8);
        String hash = encoder.encode(raw);

        TemporaryPassword tmp = tempRepo.findByUser(user).orElse(new TemporaryPassword());
        tmp.setUser(user);
        tmp.setTempPasswordHash(hash);
        tmp.setExpiryTime(expiresInMinutes > 0 ? LocalDateTime.now().plusMinutes(expiresInMinutes) : null);
        tempRepo.save(tmp);

        user.setTempPasswordActive(true);
        userRepository.save(user);
        return raw;
    }

    @Transactional(readOnly = true)
    public boolean validateTempPassword(User user, String rawTemp) {
        Optional<TemporaryPassword> opt = tempRepo.findByUser(user);
        if (opt.isEmpty())
            return false;

        TemporaryPassword tmp = opt.get();
        if (tmp.getExpiryTime() != null && tmp.getExpiryTime().isBefore(LocalDateTime.now()))
            return false;

        return encoder.matches(rawTemp, tmp.getTempPasswordHash());
    }

    @Transactional
    public void expireTemporaryPassword(User user) {
        // Use safe transactional delete
        tempRepo.findByUser(user).ifPresent(tempRepo::delete);

        user.setTempPasswordActive(false);
        user.setFirstLogin(false);
        userRepository.save(user);
    }
}
