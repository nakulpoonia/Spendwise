package com.example.Spendwise_Backend.Controller;

import com.example.Spendwise_Backend.Entity.budget.Budget;
import com.example.Spendwise_Backend.Projection.BudgetSummary;
import com.example.Spendwise_Backend.Request.CreateBudgetRequest;
import com.example.Spendwise_Backend.Response.BudgetProgressResponse;
import com.example.Spendwise_Backend.Service.BudgetService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/budgets")
public class BudgetController {

    private final BudgetService budgetService;

    public BudgetController(BudgetService budgetService) {
        this.budgetService = budgetService;
    }

    @PostMapping()
    public Budget createBudget(

            @Valid @RequestBody CreateBudgetRequest request
    ) {
        return budgetService.createBudget(
                request.getCategoryId(),
                request.getBudgetAmount(),
                request.getYear(),
                request.getMonth()
        );
    }

    @GetMapping()
    public List<BudgetSummary> getBudgetSummary(){
        return budgetService.getCurrentUserBudgets();
    }

    @GetMapping("/{budgetId}/progress")
    public BudgetProgressResponse getBudgetProgress(
            @PathVariable Long budgetId
    ) {
        return budgetService.getBudgetProgress(budgetId);
    }
}