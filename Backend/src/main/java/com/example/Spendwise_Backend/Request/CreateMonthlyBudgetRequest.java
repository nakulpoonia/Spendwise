package com.example.Spendwise_Backend.Request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;

public class CreateMonthlyBudgetRequest {

    @NotNull
    @Positive
    private BigDecimal budgetAmount;

    @NotNull
    private Integer year;

    @NotNull
    private Integer month;

    public CreateMonthlyBudgetRequest() {
    }

    public BigDecimal getBudgetAmount() {
        return budgetAmount;
    }

    public void setBudgetAmount(BigDecimal budgetAmount) {
        this.budgetAmount = budgetAmount;
    }

    public Integer getYear() {
        return year;
    }

    public void setYear(Integer year) {
        this.year = year;
    }

    public Integer getMonth() {
        return month;
    }

    public void setMonth(Integer month) {
        this.month = month;
    }
}