package com.example.Spendwise_Backend.Controller;

import com.example.Spendwise_Backend.Entity.budget.Budget;
import com.example.Spendwise_Backend.Entity.category.CategoryType;
import com.example.Spendwise_Backend.Projection.BudgetSummary;
import com.example.Spendwise_Backend.Service.BudgetService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.List;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(BudgetController.class)
@AutoConfigureMockMvc(addFilters = false)
class BudgetControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private BudgetService budgetService;


    // =========================================================
    // CREATE BUDGET
    // =========================================================

    @Test
    void shouldCreateBudget() throws Exception {

        String requestBody = """
                {
                    "categoryId": 1,
                    "budgetAmount": 10000.00,
                    "year": 2026,
                    "month": 10
                }
                """;

        mockMvc.perform(
                        post("/api/budgets")
                                .contentType(APPLICATION_JSON)
                                .content(requestBody)
                )
                .andExpect(status().isOk());

        verify(budgetService).createBudget(
                eq(1L),
                eq(new BigDecimal("10000.00")),
                eq(2026),
                eq(10)
        );
    }


    // =========================================================
    // CREATE BUDGET - VALIDATION
    // =========================================================

    @Test
    void shouldRejectInvalidCreateBudgetRequest() throws Exception {

        String requestBody = """
                {
                    "categoryId": null,
                    "budgetAmount": -1000.00,
                    "year": null,
                    "month": null
                }
                """;

        mockMvc.perform(
                        post("/api/budgets")
                                .contentType(APPLICATION_JSON)
                                .content(requestBody)
                )
                .andExpect(status().isBadRequest());
    }


    // =========================================================
    // GET CURRENT USER BUDGETS
    // =========================================================

    @Test
    void shouldGetCurrentUserBudgets() throws Exception {

        when(budgetService.getCurrentUserBudgets())
                .thenReturn(List.of());

        mockMvc.perform(
                        get("/api/budgets")
                )
                .andExpect(status().isOk());

        verify(budgetService)
                .getCurrentUserBudgets();
    }


    // =========================================================
    // GET BUDGET PROGRESS
    // =========================================================

    @Test
    void shouldGetBudgetProgress() throws Exception {

        when(budgetService.getBudgetProgress(1L))
                .thenReturn(null);

        mockMvc.perform(
                        get("/api/budgets/1/progress")
                )
                .andExpect(status().isOk());

        verify(budgetService)
                .getBudgetProgress(1L);
    }
}
