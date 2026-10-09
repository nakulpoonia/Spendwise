package com.example.Spendwise_Backend.Controller;

import com.example.Spendwise_Backend.Response.FinancialSummaryResponse;
import com.example.Spendwise_Backend.Service.FinancialSummaryService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.YearMonth;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(FinancialSummaryController.class)
@AutoConfigureMockMvc(addFilters = false)
class FinancialSummaryControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private FinancialSummaryService financialSummaryService;


    // =========================================================
    // GET CURRENT USER MONTHLY SUMMARY
    // =========================================================

    @Test
    void shouldGetCurrentUserMonthlySummary() throws Exception {

        FinancialSummaryResponse response =
                new FinancialSummaryResponse(
                        new BigDecimal("60000.00"),  // totalBalance
                        new BigDecimal("50000.00"),  // totalIncome
                        new BigDecimal("20000.00"),  // totalExpense
                        new BigDecimal("30000.00")   // net
                );

        when(financialSummaryService.getCurrentUserMonthlySummary(
                eq(YearMonth.of(2026, 10))
        )).thenReturn(response);

        mockMvc.perform(
                        get("/api/users/me/summary")
                                .param("month", "2026-10")
                )
                .andExpect(status().isOk());

        verify(financialSummaryService)
                .getCurrentUserMonthlySummary(
                        eq(YearMonth.of(2026, 10))
                );
    }


    // =========================================================
    // MISSING MONTH
    // =========================================================

    @Test
    void shouldRejectMissingMonth() throws Exception {

        mockMvc.perform(
                        get("/api/users/me/summary")
                )
                .andExpect(status().isBadRequest());
    }


    // =========================================================
    // INVALID MONTH FORMAT
    // =========================================================

    @Test
    void shouldRejectInvalidMonthFormat() throws Exception {

        mockMvc.perform(
                        get("/api/users/me/summary")
                                .param("month", "October-2026")
                )
                .andExpect(status().isBadRequest());
    }
}