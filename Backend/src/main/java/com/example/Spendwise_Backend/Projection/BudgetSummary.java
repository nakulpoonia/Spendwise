package com.example.Spendwise_Backend.Projection;

import java.math.BigDecimal;

public interface BudgetSummary {

    Long getId();

    BudgetCategorySummary getCategory();

    BigDecimal getBudgetAmount();

    Integer getYear();

    Integer getMonth();
}

