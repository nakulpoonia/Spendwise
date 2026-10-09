package com.example.Spendwise_Backend.Repo;

import com.example.Spendwise_Backend.Entity.user.EmailVerificationToken;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface EmailVerificationTokenRepository
        extends JpaRepository<EmailVerificationToken, Long> {

    Optional<EmailVerificationToken> findByUserId(Long userId);

    Optional<EmailVerificationToken> findByUserEmail(String email);

    void deleteByUserId(Long userId);
}