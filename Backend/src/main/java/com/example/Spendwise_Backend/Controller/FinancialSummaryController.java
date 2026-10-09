package com.example.Spendwise_Backend.Controller;

import com.example.Spendwise_Backend.Response.FinancialSummaryResponse;
import com.example.Spendwise_Backend.Service.FinancialSummaryService;
import org.springframework.web.bind.annotation.*;

import java.time.YearMonth;

@RestController
@RequestMapping("/api/users")
public class FinancialSummaryController {

    private final FinancialSummaryService financialSummaryService;

    public FinancialSummaryController(
            FinancialSummaryService financialSummaryService
    ) {
        this.financialSummaryService = financialSummaryService;
    }

    @GetMapping("/me/summary")
    public FinancialSummaryResponse getCurrentUserMonthlySummary(
            @RequestParam YearMonth month
    ) {
        return financialSummaryService.getCurrentUserMonthlySummary(month);
    }
}