package com.example.Spendwise_Backend.Service;

import com.example.Spendwise_Backend.Entity.user.EmailVerificationToken;
import com.example.Spendwise_Backend.Entity.user.User;
import com.example.Spendwise_Backend.Exception.ForbiddenException;
import com.example.Spendwise_Backend.Exception.ResourceNotFoundException;
import com.example.Spendwise_Backend.Exception.UnauthorizedException;
import com.example.Spendwise_Backend.Repo.EmailVerificationTokenRepository;
import com.example.Spendwise_Backend.Repo.UserRepository;
import com.example.Spendwise_Backend.Request.LoginRequest;
import com.example.Spendwise_Backend.Request.RegisterRequest;
import com.example.Spendwise_Backend.Request.VerifyEmailRequest;
import com.example.Spendwise_Backend.Response.LoginResponse;
import com.example.Spendwise_Backend.Response.UserResponse;
import jakarta.transaction.Transactional;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.Instant;
import java.time.LocalDateTime;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtEncoder jwtEncoder;
    private final EmailVerificationTokenRepository emailVerificationTokenRepository;
    private final EmailService emailService;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtEncoder jwtEncoder,
            EmailVerificationTokenRepository emailVerificationTokenRepository,
            EmailService emailService
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtEncoder = jwtEncoder;
        this.emailVerificationTokenRepository = emailVerificationTokenRepository;
        this.emailService = emailService;
    }

    public UserResponse register(RegisterRequest request) {

        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email already registered");
        }

        String passwordHash = passwordEncoder.encode(request.getPassword());

        User user = new User(
                request.getName(),
                request.getEmail(),
                request.getCurrency()
        );

        user.setPasswordHash(passwordHash);
        user.setEmailVerified(false);

        User savedUser = userRepository.save(user);

        String otp = String.format(
                "%06d",
                new SecureRandom().nextInt(1_000_000)
        );

        EmailVerificationToken token = new EmailVerificationToken(
                savedUser,
                otp,
                LocalDateTime.now().plusMinutes(10)
        );

        emailVerificationTokenRepository.save(token);

        emailService.sendVerificationEmail(
                savedUser.getEmail(),
                otp
        );

        return new UserResponse(
                savedUser.getId(),
                savedUser.getName(),
                savedUser.getEmail(),
                savedUser.getCurrency()
        );
    }

    public LoginResponse login(LoginRequest request) {

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() ->
                        new UnauthorizedException("Invalid email or password"));

        if (!passwordEncoder.matches(
                request.getPassword(),
                user.getPasswordHash()
        )) {
            throw new UnauthorizedException("Invalid email or password");
        }

        if (!user.isEmailVerified()) {
            throw new ForbiddenException(
                    "Please verify your email before logging in");
        }

        String token = generateToken(user);

        return new LoginResponse(
                token,
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getCurrency()
        );
    }

    private String generateToken(User user) {

        Instant now = Instant.now();

        JwtClaimsSet claims = JwtClaimsSet.builder()
                .subject(user.getId().toString())
                .claim("email", user.getEmail())
                .issuedAt(now)
                .expiresAt(now.plusSeconds(86400)) // 24 hours
                .build();

        return jwtEncoder
                .encode(JwtEncoderParameters.from(claims))
                .getTokenValue();
    }

    @Transactional
    public String verifyEmail(VerifyEmailRequest request) {

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found"));

        if (user.isEmailVerified()) {
            return "Email is already verified";
        }

        EmailVerificationToken token =
                emailVerificationTokenRepository.findByUserEmail(request.getEmail())
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Verification OTP not found"
                                ));

        if (LocalDateTime.now().isAfter(token.getExpiresAt())) {
            throw new IllegalArgumentException("OTP has expired");
        }

        if (!token.getOtp().equals(request.getOtp())) {
            throw new IllegalArgumentException("Invalid OTP");
        }

        user.setEmailVerified(true);
        userRepository.save(user);

        emailVerificationTokenRepository.deleteByUserId(user.getId());

        return "Email verified successfully";
    }

    @Transactional
    public String resendVerificationEmail(String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found"));

        if (user.isEmailVerified()) {
            return "Email is already verified";
        }

        String otp = String.format(
                "%06d",
                new SecureRandom().nextInt(1_000_000)
        );

        EmailVerificationToken token =
                emailVerificationTokenRepository.findByUserEmail(email)
                        .orElse(null);

        LocalDateTime expiresAt =
                LocalDateTime.now().plusMinutes(10);

        if (token == null) {

            token = new EmailVerificationToken(
                    user,
                    otp,
                    expiresAt
            );

        } else {

            token.setOtp(otp);
            token.setExpiresAt(expiresAt);
        }

        emailVerificationTokenRepository.save(token);

        emailService.sendVerificationEmail(
                user.getEmail(),
                otp
        );

        return "Verification OTP sent successfully";
    }
}