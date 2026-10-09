package com.example.Spendwise_Backend.Controller;

import com.example.Spendwise_Backend.Entity.budget.MonthlyBudget;
import com.example.Spendwise_Backend.Projection.MonthlyBudgetSummary;
import com.example.Spendwise_Backend.Request.CreateMonthlyBudgetRequest;
import com.example.Spendwise_Backend.Response.MonthlyBudgetProgressResponse;
import com.example.Spendwise_Backend.Service.MonthlyBudgetService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/monthly-budgets")
public class MonthlyBudgetController {

    private final MonthlyBudgetService monthlyBudgetService;

    public MonthlyBudgetController(
            MonthlyBudgetService monthlyBudgetService
    ) {
        this.monthlyBudgetService = monthlyBudgetService;
    }

    @PostMapping()
    public MonthlyBudget createMonthlyBudget(

            @Valid @RequestBody CreateMonthlyBudgetRequest request
    ) {
        return monthlyBudgetService.createMonthlyBudget(
                request.getBudgetAmount(),
                request.getYear(),
                request.getMonth()
        );
    }

    @GetMapping()
    public MonthlyBudgetSummary getMonthlyBudgetSummary( @RequestParam Integer year,@RequestParam Integer month){
        return monthlyBudgetService.getMonthlyBudget(year,month);
    }

    @GetMapping("/progress")
    public MonthlyBudgetProgressResponse getMonthlyBudgetProgress(

            @RequestParam Integer year,
            @RequestParam Integer month
    ) {
        return monthlyBudgetService.getMonthlyBudgetProgress(

                year,
                month
        );
    }
}