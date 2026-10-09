package com.example.Spendwise_Backend.Controller;

import com.example.Spendwise_Backend.Entity.user.User;
import com.example.Spendwise_Backend.Request.LoginRequest;
import com.example.Spendwise_Backend.Request.RegisterRequest;
import com.example.Spendwise_Backend.Request.VerifyEmailRequest;
import com.example.Spendwise_Backend.Response.LoginResponse;
import com.example.Spendwise_Backend.Response.UserResponse;
import com.example.Spendwise_Backend.Service.AuthService;
import com.example.Spendwise_Backend.Service.EmailService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final EmailService emailService;

    public AuthController(AuthService authService,
                          EmailService emailService) {
        this.authService = authService;
        this.emailService = emailService;
    }

    @PostMapping("/register")
    public UserResponse register(
            @Valid @RequestBody RegisterRequest request
    ) {
        return authService.register(request);
    }

    @PostMapping("/login")
    public LoginResponse login(
            @Valid @RequestBody LoginRequest request
    ) {
        return authService.login(request);
    }

    @GetMapping("/test-email")
    public String testEmail() {

        emailService.sendBudgetAlert(
                "your-email@gmail.com",
                "SpendWise Test Email",
                "Your SpendWise email configuration is working!"
        );

        return "Test email sent";
    }

    @PostMapping("/verify-email")
    public String verifyEmail(
            @Valid @RequestBody VerifyEmailRequest request) {

        return authService.verifyEmail(request);
    }

    @PostMapping("/resend-verification")
    public String resendVerification(@RequestParam String email) {
        return authService.resendVerificationEmail(email);
    }
}