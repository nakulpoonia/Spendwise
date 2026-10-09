package com.example.Spendwise_Backend.Controller;

import com.example.Spendwise_Backend.Entity.user.User;
import com.example.Spendwise_Backend.Projection.UserSummary;
import com.example.Spendwise_Backend.Service.UserService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(UserController.class)
@AutoConfigureMockMvc(addFilters = false)
class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private UserService userService;


    // =========================================================
    // GET CURRENT USER
    // =========================================================

    @Test
    void shouldGetCurrentUser() throws Exception {

        UserSummary summary = new UserSummary() {

            @Override
            public Long getId() {
                return 1L;
            }

            @Override
            public String getName() {
                return "Nakul";
            }

            @Override
            public String getEmail() {
                return "nakul@test.com";
            }

            @Override
            public String getCurrency() {
                return "INR";
            }
        };

        when(userService.getCurrentUser())
                .thenReturn(summary);

        mockMvc.perform(
                        get("/api/user/me")
                )
                .andExpect(status().isOk());

        verify(userService)
                .getCurrentUser();
    }


    // =========================================================
    // UPDATE CURRENT USER
    // =========================================================

    @Test
    void shouldUpdateCurrentUser() throws Exception {

        User updatedUser = new User(
                "Nakul Poonia",
                "nakul@test.com",
                "USD"
        );

        updatedUser.setPasswordHash("dummy-password-hash");

        when(userService.updateCurrentUser(
                eq("Nakul Poonia"),
                eq("USD")
        )).thenReturn(updatedUser);

        String requestBody = """
                {
                    "name": "Nakul Poonia",
                    "currency": "USD"
                }
                """;

        mockMvc.perform(
                        put("/api/user/me")
                                .contentType(APPLICATION_JSON)
                                .content(requestBody)
                )
                .andExpect(status().isOk());

        verify(userService).updateCurrentUser(
                eq("Nakul Poonia"),
                eq("USD")
        );
    }


    // =========================================================
    // UPDATE CURRENT USER - VALIDATION
    // =========================================================

    @Test
    void shouldRejectInvalidUpdateCurrentUserRequest()
            throws Exception {

        String requestBody = """
                {
                    "name": "",
                    "currency": ""
                }
                """;

        mockMvc.perform(
                        put("/api/user/me")
                                .contentType(APPLICATION_JSON)
                                .content(requestBody)
                )
                .andExpect(status().isBadRequest());
    }
}
