package com.example.Spendwise_Backend.Controller;

import com.example.Spendwise_Backend.Entity.account.Account;
import com.example.Spendwise_Backend.Entity.account.AccountType;
import com.example.Spendwise_Backend.Entity.category.Category;
import com.example.Spendwise_Backend.Entity.category.CategoryType;
import com.example.Spendwise_Backend.Entity.transaction.Transaction;
import com.example.Spendwise_Backend.Entity.transaction.TransactionDirection;
import com.example.Spendwise_Backend.Entity.transaction.TransactionType;
import com.example.Spendwise_Backend.Projection.TransactionSummary;
import com.example.Spendwise_Backend.Repo.AccountRepository;
import com.example.Spendwise_Backend.Repo.CategoryRepository;
import com.example.Spendwise_Backend.Service.CurrentUserService;
import com.example.Spendwise_Backend.Service.TransactionService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(TransactionController.class)
@AutoConfigureMockMvc(addFilters = false)
class TransactionControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private TransactionService transactionService;

    @MockitoBean
    private AccountRepository accountRepository;

    @MockitoBean
    private CategoryRepository categoryRepository;

    @MockitoBean
    private CurrentUserService currentUserService;


    // =========================================================
    // CREATE INCOME
    // =========================================================

    @Test
    void shouldCreateIncome() throws Exception {

        Account account = new Account(
                null,
                "HDFC Savings",
                AccountType.BANK,
                new BigDecimal("50000.00")
        );

        Category category = new Category(
                null,
                "Salary",
                CategoryType.INCOME
        );

        Transaction transaction = new Transaction(
                account,
                category,
                new BigDecimal("50000.00"),
                TransactionType.INCOME,
                TransactionDirection.IN,
                null,
                "Salary",
                LocalDateTime.of(2026, 10, 5, 10, 0)
        );

        when(currentUserService.getCurrentUserId())
                .thenReturn(1L);

        when(accountRepository.findByIdAndUserId(1L, 1L))
                .thenReturn(Optional.of(account));

        when(categoryRepository.findByIdAndUserId(2L, 1L))
                .thenReturn(Optional.of(category));

        when(transactionService.createIncome(
                eq(account),
                eq(category),
                eq(new BigDecimal("50000.00")),
                eq("Salary"),
                eq(LocalDateTime.of(2026, 10, 5, 10, 0))
        )).thenReturn(transaction);

        String requestBody = """
                {
                    "accountId": 1,
                    "categoryId": 2,
                    "amount": 50000.00,
                    "description": "Salary",
                    "transactionDate": "2026-10-05T10:00:00"
                }
                """;

        mockMvc.perform(
                        post("/api/transactions/income")
                                .contentType(APPLICATION_JSON)
                                .content(requestBody)
                )
                .andExpect(status().isOk());

        verify(transactionService).createIncome(
                eq(account),
                eq(category),
                eq(new BigDecimal("50000.00")),
                eq("Salary"),
                eq(LocalDateTime.of(2026, 10, 5, 10, 0))
        );
    }


    // =========================================================
    // CREATE EXPENSE
    // =========================================================

    @Test
    void shouldCreateExpense() throws Exception {

        Account account = new Account(
                null,
                "HDFC Savings",
                AccountType.BANK,
                new BigDecimal("50000.00")
        );

        Category category = new Category(
                null,
                "Food",
                CategoryType.EXPENSE
        );

        Transaction transaction = new Transaction(
                account,
                category,
                new BigDecimal("500.00"),
                TransactionType.EXPENSE,
                TransactionDirection.OUT,
                null,
                "Lunch",
                LocalDateTime.of(2026, 10, 5, 13, 0)
        );

        when(currentUserService.getCurrentUserId())
                .thenReturn(1L);

        when(accountRepository.findByIdAndUserId(1L, 1L))
                .thenReturn(Optional.of(account));

        when(categoryRepository.findByIdAndUserId(2L, 1L))
                .thenReturn(Optional.of(category));

        when(transactionService.createExpense(
                eq(account),
                eq(category),
                eq(new BigDecimal("500.00")),
                eq("Lunch"),
                eq(LocalDateTime.of(2026, 10, 5, 13, 0))
        )).thenReturn(transaction);

        String requestBody = """
                {
                    "accountId": 1,
                    "categoryId": 2,
                    "amount": 500.00,
                    "description": "Lunch",
                    "transactionDate": "2026-10-05T13:00:00"
                }
                """;

        mockMvc.perform(
                        post("/api/transactions/expense")
                                .contentType(APPLICATION_JSON)
                                .content(requestBody)
                )
                .andExpect(status().isOk());

        verify(transactionService).createExpense(
                eq(account),
                eq(category),
                eq(new BigDecimal("500.00")),
                eq("Lunch"),
                eq(LocalDateTime.of(2026, 10, 5, 13, 0))
        );
    }


    // =========================================================
    // CREATE TRANSFER
    // =========================================================

    @Test
    void shouldCreateTransfer() throws Exception {

        Account sourceAccount = new Account(
                null,
                "HDFC Savings",
                AccountType.BANK,
                new BigDecimal("50000.00")
        );

        Account destinationAccount = new Account(
                null,
                "SBI Savings",
                AccountType.SAVINGS,
                new BigDecimal("20000.00")
        );

        when(currentUserService.getCurrentUserId())
                .thenReturn(1L);

        when(accountRepository.findByIdAndUserId(1L, 1L))
                .thenReturn(Optional.of(sourceAccount));

        when(accountRepository.findByIdAndUserId(2L, 1L))
                .thenReturn(Optional.of(destinationAccount));

        String requestBody = """
                {
                    "sourceAccountId": 1,
                    "destinationAccountId": 2,
                    "amount": 10000.00,
                    "description": "Savings transfer",
                    "transactionDate": "2026-10-05T15:00:00"
                }
                """;

        mockMvc.perform(
                        post("/api/transactions/transfer")
                                .contentType(APPLICATION_JSON)
                                .content(requestBody)
                )
                .andExpect(status().isOk());

        verify(transactionService).createTransfer(
                eq(sourceAccount),
                eq(destinationAccount),
                eq(new BigDecimal("10000.00")),
                eq("Savings transfer"),
                eq(LocalDateTime.of(2026, 10, 5, 15, 0))
        );
    }


    // =========================================================
    // GET TRANSACTIONS BY ACCOUNT
    // =========================================================

    @Test
    void shouldGetTransactionsByAccount() throws Exception {

        when(transactionService.getTransactionsByAccount(1L))
                .thenReturn(List.of());

        mockMvc.perform(
                        get("/api/transactions/account/1")
                )
                .andExpect(status().isOk());

        verify(transactionService)
                .getTransactionsByAccount(1L);
    }


    // =========================================================
    // GET TRANSACTION BY ID
    // =========================================================

    @Test
    void shouldGetTransactionById() throws Exception {

        when(transactionService.getTransactionById(1L))
                .thenReturn(null);

        mockMvc.perform(
                        get("/api/transactions/1")
                )
                .andExpect(status().isOk());

        verify(transactionService)
                .getTransactionById(1L);
    }


    // =========================================================
    // UPDATE TRANSACTION
    // =========================================================

    @Test
    void shouldUpdateTransaction() throws Exception {

        Category category = new Category(
                null,
                "Food",
                CategoryType.EXPENSE
        );

        when(categoryRepository.findById(2L))
                .thenReturn(Optional.of(category));

        mockMvc.perform(
                        put("/api/transactions/1")
                                .contentType(APPLICATION_JSON)
                                .content("""
                                        {
                                            "amount": 750.00,
                                            "categoryId": 2,
                                            "description": "Dinner",
                                            "transactionDate": "2026-10-05T20:00:00"
                                        }
                                        """)
                )
                .andExpect(status().isOk());

        verify(transactionService).updateTransaction(
                eq(1L),
                eq(new BigDecimal("750.00")),
                eq(category),
                eq("Dinner"),
                eq(LocalDateTime.of(2026, 10, 5, 20, 0))
        );
    }


    // =========================================================
    // DELETE TRANSACTION
    // =========================================================

    @Test
    void shouldDeleteTransaction() throws Exception {

        mockMvc.perform(
                        delete("/api/transactions/1")
                )
                .andExpect(status().isOk());

        verify(transactionService)
                .deleteTransaction(1L);
    }


    // =========================================================
    // DELETE TRANSFER
    // =========================================================

    @Test
    void shouldDeleteTransfer() throws Exception {

        mockMvc.perform(
                        delete("/api/transactions/transfer/1")
                )
                .andExpect(status().isOk());

        verify(transactionService)
                .deleteTransfer(1L);
    }


    // =========================================================
    // GET TRANSACTIONS BY ACCOUNT + CATEGORY
    // =========================================================

    @Test
    void shouldGetTransactionsByAccountAndCategory() throws Exception {

        when(transactionService.getTransactionByAccountAndCategory(1L, 2L))
                .thenReturn(List.of());

        mockMvc.perform(
                        get("/api/transactions/account/1/category/2")
                )
                .andExpect(status().isOk());

        verify(transactionService)
                .getTransactionByAccountAndCategory(1L, 2L);
    }


    // =========================================================
    // GET TRANSACTIONS BY ACCOUNT + DATE
    // =========================================================

    @Test
    void shouldGetTransactionsByAccountAndDate() throws Exception {

        LocalDateTime from =
                LocalDateTime.of(2026, 10, 1, 0, 0);

        LocalDateTime to =
                LocalDateTime.of(2026, 10, 5, 23, 59);

        when(transactionService.getTransactionsByAccountAndDate(
                1L,
                from,
                to
        )).thenReturn(List.of());

        mockMvc.perform(
                        get("/api/transactions/account/1/date")
                                .param("from", "2026-10-01T00:00:00")
                                .param("to", "2026-10-05T23:59:00")
                )
                .andExpect(status().isOk());

        verify(transactionService)
                .getTransactionsByAccountAndDate(
                        1L,
                        from,
                        to
                );
    }


    // =========================================================
    // GET TRANSACTIONS BY ACCOUNT + CATEGORY + DATE
    // =========================================================

    @Test
    void shouldGetTransactionsByAccountAndCategoryAndDate()
            throws Exception {

        LocalDateTime from =
                LocalDateTime.of(2026, 10, 1, 0, 0);

        LocalDateTime to =
                LocalDateTime.of(2026, 10, 5, 23, 59);

        when(transactionService
                .getTransactionsByAccountAndCategoryAndDate(
                        1L,
                        2L,
                        from,
                        to
                )).thenReturn(List.of());

        mockMvc.perform(
                        get("/api/transactions/account/1/category/2/date")
                                .param("from", "2026-10-01T00:00:00")
                                .param("to", "2026-10-05T23:59:00")
                )
                .andExpect(status().isOk());

        verify(transactionService)
                .getTransactionsByAccountAndCategoryAndDate(
                        1L,
                        2L,
                        from,
                        to
                );
    }


    // =========================================================
    // GET CURRENT USER TRANSACTIONS BY CATEGORY
    // =========================================================

    @Test
    void shouldGetCurrentUserTransactionsByCategory()
            throws Exception {

        when(transactionService
                .getCurrentUserTransactionsByCategory(2L))
                .thenReturn(List.of());

        mockMvc.perform(
                        get("/api/transactions/category/2")
                )
                .andExpect(status().isOk());

        verify(transactionService)
                .getCurrentUserTransactionsByCategory(2L);
    }


    // =========================================================
    // CREATE EXPENSE - VALIDATION
    // =========================================================

    @Test
    void shouldRejectInvalidExpenseRequest() throws Exception {

        String requestBody = """
                {
                    "accountId": 1,
                    "categoryId": 2,
                    "amount": -500.00,
                    "description": "Lunch",
                    "transactionDate": "2026-10-05T13:00:00"
                }
                """;

        mockMvc.perform(
                        post("/api/transactions/expense")
                                .contentType(APPLICATION_JSON)
                                .content(requestBody)
                )
                .andExpect(status().isBadRequest());
    }


    // =========================================================
    // CREATE TRANSFER - VALIDATION
    // =========================================================

    @Test
    void shouldRejectInvalidTransferRequest() throws Exception {

        String requestBody = """
                {
                    "sourceAccountId": 1,
                    "destinationAccountId": 2,
                    "amount": 0,
                    "description": "Transfer",
                    "transactionDate": "2026-10-05T15:00:00"
                }
                """;

        mockMvc.perform(
                        post("/api/transactions/transfer")
                                .contentType(APPLICATION_JSON)
                                .content(requestBody)
                )
                .andExpect(status().isBadRequest());
    }
}
