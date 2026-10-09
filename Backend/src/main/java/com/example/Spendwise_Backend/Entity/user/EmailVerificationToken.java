package com.example.Spendwise_Backend.Entity.user;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "email_verification_tokens")
public class EmailVerificationToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(nullable = false, length = 6)
    private String otp;

    @Column(nullable = false)
    private LocalDateTime expiresAt;

    protected EmailVerificationToken() {
    }

    public EmailVerificationToken(User user, String otp, LocalDateTime expiresAt) {
        this.user = user;
        this.otp = otp;
        this.expiresAt = expiresAt;
    }

    public Long getId() {
        return id;
    }

    public User getUser() {
        return user;
    }

    public String getOtp() {
        return otp;
    }

    public LocalDateTime getExpiresAt() {
        return expiresAt;
    }

    public void setOtp(String otp) {
        this.otp = otp;
    }

    public void setExpiresAt(LocalDateTime expiresAt) {
        this.expiresAt = expiresAt;
    }
}