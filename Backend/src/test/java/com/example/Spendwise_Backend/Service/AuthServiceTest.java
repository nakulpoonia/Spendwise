package com.example.Spendwise_Backend.Service;

import com.example.Spendwise_Backend.Entity.user.EmailVerificationToken;
import com.example.Spendwise_Backend.Entity.user.User;
import com.example.Spendwise_Backend.Repo.EmailVerificationTokenRepository;
import com.example.Spendwise_Backend.Repo.UserRepository;
import com.example.Spendwise_Backend.Request.VerifyEmailRequest;
import com.example.Spendwise_Backend.Service.AuthService;
import com.example.Spendwise_Backend.Service.EmailService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoder;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtEncoder jwtEncoder;

    @Mock
    private EmailVerificationTokenRepository emailVerificationTokenRepository;

    @Mock
    private EmailService emailService;

    @InjectMocks
    private AuthService authService;

    @Test
    void verifyEmail_shouldVerifyUser_whenOtpIsCorrect() {

        // Request coming from Postman/frontend
        VerifyEmailRequest request = new VerifyEmailRequest();
        request.setEmail("test@gmail.com");
        request.setOtp("123456");

        // Existing user
        User user = mock(User.class);

        when(user.isEmailVerified()).thenReturn(false);
        when(user.getId()).thenReturn(1L);

        when(userRepository.findByEmail("test@gmail.com"))
                .thenReturn(Optional.of(user));

        // OTP stored in database
        EmailVerificationToken token =
                mock(EmailVerificationToken.class);

        when(token.getOtp()).thenReturn("123456");
        when(token.getExpiresAt())
                .thenReturn(LocalDateTime.now().plusMinutes(10));

        when(emailVerificationTokenRepository.findByUserEmail(
                "test@gmail.com"))
                .thenReturn(Optional.of(token));

        // Call the method we are testing
        String result = authService.verifyEmail(request);

        // Verify result
        assertEquals("Email verified successfully", result);

        // Verify user was marked as verified
        verify(user).setEmailVerified(true);

        // Verify user was saved
        verify(userRepository).save(user);

        // Verify OTP was deleted
        verify(emailVerificationTokenRepository)
                .deleteByUserId(1L);
    }
}
