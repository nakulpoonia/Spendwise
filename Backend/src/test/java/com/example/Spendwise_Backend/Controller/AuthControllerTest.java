package com.example.Spendwise_Backend.Controller;

import com.example.Spendwise_Backend.Service.AuthService;
import com.example.Spendwise_Backend.Service.EmailService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AuthController.class)
@AutoConfigureMockMvc(addFilters = false)
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private AuthService authService;

    @MockitoBean
    private EmailService emailService;


    // =========================================================
    // REGISTER
    // =========================================================

    @Test
    void shouldRegisterUser() throws Exception {

        String requestBody = """
                {
                    "name": "Nakul",
                    "email": "nakul@test.com",
                    "password": "password123",
                    "currency": "INR"
                }
                """;

        mockMvc.perform(
                        post("/api/auth/register")
                                .contentType(APPLICATION_JSON)
                                .content(requestBody)
                )
                .andExpect(status().isOk());

        verify(authService).register(any());
    }


    // =========================================================
    // REGISTER - VALIDATION FAILURE
    // =========================================================

    @Test
    void shouldRejectInvalidRegisterRequest() throws Exception {

        String requestBody = """
                {
                    "name": "",
                    "email": "invalid-email",
                    "password": "123",
                    "currency": "INR"
                }
                """;

        mockMvc.perform(
                        post("/api/auth/register")
                                .contentType(APPLICATION_JSON)
                                .content(requestBody)
                )
                .andExpect(status().isBadRequest());
    }


    // =========================================================
    // LOGIN
    // =========================================================

    @Test
    void shouldLoginUser() throws Exception {

        String requestBody = """
                {
                    "email": "nakul@test.com",
                    "password": "password123"
                }
                """;

        mockMvc.perform(
                        post("/api/auth/login")
                                .contentType(APPLICATION_JSON)
                                .content(requestBody)
                )
                .andExpect(status().isOk());

        verify(authService).login(any());
    }


    // =========================================================
    // LOGIN - VALIDATION FAILURE
    // =========================================================

    @Test
    void shouldRejectInvalidLoginRequest() throws Exception {

        String requestBody = """
                {
                    "email": "invalid-email",
                    "password": ""
                }
                """;

        mockMvc.perform(
                        post("/api/auth/login")
                                .contentType(APPLICATION_JSON)
                                .content(requestBody)
                )
                .andExpect(status().isBadRequest());
    }


    // =========================================================
    // VERIFY EMAIL
    // =========================================================

    @Test
    void shouldVerifyEmail() throws Exception {

        when(authService.verifyEmail(any()))
                .thenReturn("Email verified successfully");

        String requestBody = """
                {
                    "email": "nakul@test.com",
                    "otp": "123456"
                }
                """;

        mockMvc.perform(
                        post("/api/auth/verify-email")
                                .contentType(APPLICATION_JSON)
                                .content(requestBody)
                )
                .andExpect(status().isOk())
                .andExpect(
                        content().string("Email verified successfully")
                );

        verify(authService).verifyEmail(any());
    }


    // =========================================================
    // RESEND VERIFICATION
    // =========================================================

    @Test
    void shouldResendVerificationEmail() throws Exception {

        when(authService.resendVerificationEmail(
                eq("nakul@test.com")
        )).thenReturn("Verification email sent");

        mockMvc.perform(
                        post("/api/auth/resend-verification")
                                .param("email", "nakul@test.com")
                )
                .andExpect(status().isOk())
                .andExpect(
                        content().string("Verification email sent")
                );

        verify(authService)
                .resendVerificationEmail("nakul@test.com");
    }


    // =========================================================
    // TEST EMAIL
    // =========================================================

    @Test
    void shouldSendTestEmail() throws Exception {

        mockMvc.perform(
                        get("/api/auth/test-email")
                )
                .andExpect(status().isOk())
                .andExpect(
                        content().string("Test email sent")
                );

        verify(emailService).sendBudgetAlert(
                "your-email@gmail.com",
                "SpendWise Test Email",
                "Your SpendWise email configuration is working!"
        );
    }
}
