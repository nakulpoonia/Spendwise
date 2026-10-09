package com.example.Spendwise_Backend.Controller;

import com.example.Spendwise_Backend.Entity.account.Account;
import com.example.Spendwise_Backend.Entity.account.AccountType;
import com.example.Spendwise_Backend.Projection.AccountSummary;
import com.example.Spendwise_Backend.Service.AccountService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AccountController.class)
@AutoConfigureMockMvc(addFilters = false)
class AccountControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private AccountService accountService;


    // =========================================================
    // CREATE ACCOUNT
    // =========================================================

    @Test
    void shouldCreateAccount() throws Exception {

        Account account = new Account(
                null,
                "HDFC Savings",
                AccountType.BANK,
                new BigDecimal("50000.00")
        );

        when(accountService.createAccount(
                eq("HDFC Savings"),
                eq(AccountType.BANK),
                eq(new BigDecimal("50000.00"))
        )).thenReturn(account);

        String requestBody = """
            {
                "name": "HDFC Savings",
                "type": "BANK",
                "openingBalance": 50000.00
            }
            """;

        mockMvc.perform(
                        post("/api/accounts")
                                .contentType(APPLICATION_JSON)
                                .content(requestBody)
                )
                .andExpect(status().isOk());

        verify(accountService).createAccount(
                eq("HDFC Savings"),
                eq(AccountType.BANK),
                eq(new BigDecimal("50000.00"))
        );
    }


    // =========================================================
    // CREATE ACCOUNT - VALIDATION
    // =========================================================

    @Test
    void shouldRejectInvalidCreateAccountRequest() throws Exception {

        String requestBody = """
                {
                    "name": "",
                    "type": "BANK",
                    "openingBalance": -500.00
                }
                """;

        mockMvc.perform(
                        post("/api/accounts")
                                .contentType(APPLICATION_JSON)
                                .content(requestBody)
                )
                .andExpect(status().isBadRequest());
    }


    // =========================================================
    // GET ACCOUNT BY ID
    // =========================================================

    @Test
    void shouldGetAccountById() throws Exception {

        AccountSummary summary = new AccountSummary() {
            @Override
            public Long getId() {
                return 1L;
            }

            @Override
            public String getName() {
                return "HDFC Savings";
            }

            @Override
            public AccountType getType() {
                return AccountType.BANK;
            }

            @Override
            public BigDecimal getOpeningBalance() {
                return new BigDecimal("50000.00");
            }
        };

        when(accountService.getAccountById(1L))
                .thenReturn(summary);

        mockMvc.perform(
                        get("/api/accounts/1")
                )
                .andExpect(status().isOk());

        verify(accountService).getAccountById(1L);
    }


    // =========================================================
    // UPDATE ACCOUNT
    // =========================================================

    @Test
    void shouldUpdateAccount() throws Exception {

        String requestBody = """
                {
                    "name": "Updated HDFC",
                    "type": "SAVINGS",
                    "openingBalance": 60000.00
                }
                """;

        mockMvc.perform(
                        put("/api/accounts/1")
                                .contentType(APPLICATION_JSON)
                                .content(requestBody)
                )
                .andExpect(status().isOk());

        verify(accountService).updateAccount(
                eq(1L),
                eq("Updated HDFC"),
                eq(AccountType.SAVINGS),
                eq(new BigDecimal("60000.00"))
        );
    }


    // =========================================================
    // UPDATE ACCOUNT - VALIDATION
    // =========================================================

    @Test
    void shouldRejectInvalidUpdateAccountRequest() throws Exception {

        String requestBody = """
                {
                    "name": "",
                    "type": "BANK",
                    "openingBalance": -100.00
                }
                """;

        mockMvc.perform(
                        put("/api/accounts/1")
                                .contentType(APPLICATION_JSON)
                                .content(requestBody)
                )
                .andExpect(status().isBadRequest());
    }


    // =========================================================
    // GET ACCOUNT BALANCE
    // =========================================================

    @Test
    void shouldGetAccountBalance() throws Exception {

        when(accountService.getAccountBalance(1L))
                .thenReturn(new BigDecimal("47500.00"));

        mockMvc.perform(
                        get("/api/accounts/1/balance")
                )
                .andExpect(status().isOk());

        verify(accountService).getAccountBalance(1L);
    }


    // =========================================================
    // GET CURRENT USER ACCOUNTS
    // =========================================================

    @Test
    void shouldGetCurrentUserAccounts() throws Exception {

        when(accountService.getCurrentUserAccounts())
                .thenReturn(List.of());

        mockMvc.perform(
                        get("/api/accounts")
                )
                .andExpect(status().isOk());

        verify(accountService).getCurrentUserAccounts();
    }
}
