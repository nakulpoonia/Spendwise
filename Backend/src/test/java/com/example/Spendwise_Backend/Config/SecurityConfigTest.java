package com.example.Spendwise_Backend.Config;

import com.example.Spendwise_Backend.Service.AccountService;
import com.example.Spendwise_Backend.Service.AuthService;
import com.example.Spendwise_Backend.Service.EmailService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.HttpStatus;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class SecurityConfigTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private JwtDecoder jwtDecoder;

    @MockitoBean
    private AccountService accountService;

    @MockitoBean
    private AuthService authService;

    @MockitoBean
    private EmailService emailService;


    // =========================================================
    // PUBLIC AUTH ENDPOINT
    // =========================================================

    @Test
    void shouldAllowPublicAuthEndpointWithoutToken()
            throws Exception {

        mockMvc.perform(
                        post("/api/auth/login")
                                .contentType(APPLICATION_JSON)
                                .content("""
                                        {
                                            "email": "nakul@test.com",
                                            "password": "password123"
                                        }
                                        """)
                )
                .andExpect(status().isOk());

        verify(authService).login(any());
    }


    // =========================================================
    // PROTECTED ENDPOINT WITHOUT TOKEN
    // =========================================================

    @Test
    void shouldRejectProtectedEndpointWithoutToken()
            throws Exception {

        mockMvc.perform(
                        get("/api/accounts")
                )
                .andExpect(status().isUnauthorized());
    }


    // =========================================================
    // PROTECTED ENDPOINT WITH VALID JWT
    // =========================================================

    @Test
    void shouldAllowProtectedEndpointWithValidJwt()
            throws Exception {

        Jwt jwt = Jwt.withTokenValue("valid-token")
                .header("alg", "HS256")
                .claim("sub", "1")
                .build();

        when(jwtDecoder.decode("valid-token"))
                .thenReturn(jwt);

        when(accountService.getCurrentUserAccounts())
                .thenReturn(List.of());

        mockMvc.perform(
                        get("/api/accounts")
                                .header(
                                        "Authorization",
                                        "Bearer valid-token"
                                )
                )
                .andExpect(status().isOk());

        verify(accountService)
                .getCurrentUserAccounts();
    }
}