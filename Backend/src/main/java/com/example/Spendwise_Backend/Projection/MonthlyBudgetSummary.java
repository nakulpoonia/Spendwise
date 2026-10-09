package com.example.Spendwise_Backend.Projection;

import java.math.BigDecimal;

public interface MonthlyBudgetSummary {

    Long getId();

    BigDecimal getBudgetAmount();

    Integer getYear();

    Integer getMonth();
}