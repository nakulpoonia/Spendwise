package com.example.Spendwise_Backend.Controller;

import com.example.Spendwise_Backend.Entity.budget.MonthlyBudget;
import com.example.Spendwise_Backend.Projection.MonthlyBudgetSummary;
import com.example.Spendwise_Backend.Service.MonthlyBudgetService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(MonthlyBudgetController.class)
@AutoConfigureMockMvc(addFilters = false)
class MonthlyBudgetControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private MonthlyBudgetService monthlyBudgetService;


    // =========================================================
    // CREATE MONTHLY BUDGET
    // =========================================================

    @Test
    void shouldCreateMonthlyBudget() throws Exception {

        MonthlyBudget monthlyBudget = new MonthlyBudget(
                null,
                new BigDecimal("20000.00"),
                2026,
                10
        );

        when(monthlyBudgetService.createMonthlyBudget(
                eq(new BigDecimal("20000.00")),
                eq(2026),
                eq(10)
        )).thenReturn(monthlyBudget);

        String requestBody = """
                {
                    "budgetAmount": 20000.00,
                    "year": 2026,
                    "month": 10
                }
                """;

        mockMvc.perform(
                        post("/api/monthly-budgets")
                                .contentType(APPLICATION_JSON)
                                .content(requestBody)
                )
                .andExpect(status().isOk());

        verify(monthlyBudgetService).createMonthlyBudget(
                eq(new BigDecimal("20000.00")),
                eq(2026),
                eq(10)
        );
    }


    // =========================================================
    // CREATE MONTHLY BUDGET - VALIDATION
    // =========================================================

    @Test
    void shouldRejectInvalidCreateMonthlyBudgetRequest()
            throws Exception {

        String requestBody = """
                {
                    "budgetAmount": -5000.00,
                    "year": null,
                    "month": null
                }
                """;

        mockMvc.perform(
                        post("/api/monthly-budgets")
                                .contentType(APPLICATION_JSON)
                                .content(requestBody)
                )
                .andExpect(status().isBadRequest());
    }


    // =========================================================
    // GET MONTHLY BUDGET
    // =========================================================

    @Test
    void shouldGetMonthlyBudget() throws Exception {

        MonthlyBudgetSummary summary = new MonthlyBudgetSummary() {

            @Override
            public Long getId() {
                return 1L;
            }

            @Override
            public BigDecimal getBudgetAmount() {
                return new BigDecimal("20000.00");
            }

            @Override
            public Integer getYear() {
                return 2026;
            }

            @Override
            public Integer getMonth() {
                return 10;
            }
        };

        when(monthlyBudgetService.getMonthlyBudget(2026, 10))
                .thenReturn(summary);

        mockMvc.perform(
                        get("/api/monthly-budgets")
                                .param("year", "2026")
                                .param("month", "10")
                )
                .andExpect(status().isOk());

        verify(monthlyBudgetService)
                .getMonthlyBudget(2026, 10);
    }


    // =========================================================
    // GET MONTHLY BUDGET PROGRESS
    // =========================================================

    @Test
    void shouldGetMonthlyBudgetProgress() throws Exception {

        when(monthlyBudgetService.getMonthlyBudgetProgress(2026, 10))
                .thenReturn(null);

        mockMvc.perform(
                        get("/api/monthly-budgets/progress")
                                .param("year", "2026")
                                .param("month", "10")
                )
                .andExpect(status().isOk());

        verify(monthlyBudgetService)
                .getMonthlyBudgetProgress(2026, 10);
    }


    // =========================================================
    // GET MONTHLY BUDGET - MISSING PARAMETERS
    // =========================================================

    @Test
    void shouldRejectMonthlyBudgetWithoutParameters()
            throws Exception {

        mockMvc.perform(
                        get("/api/monthly-budgets")
                )
                .andExpect(status().isBadRequest());
    }


    // =========================================================
    // GET MONTHLY BUDGET PROGRESS - MISSING PARAMETERS
    // =========================================================

    @Test
    void shouldRejectMonthlyBudgetProgressWithoutParameters()
            throws Exception {

        mockMvc.perform(
                        get("/api/monthly-budgets/progress")
                )
                .andExpect(status().isBadRequest());
    }
}