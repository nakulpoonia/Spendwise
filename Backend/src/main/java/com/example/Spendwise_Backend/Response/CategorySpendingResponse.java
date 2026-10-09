package com.example.Spendwise_Backend.Response;

import java.math.BigDecimal;

public class CategorySpendingResponse {

    private String categoryName;
    private BigDecimal amount;

    public CategorySpendingResponse() {
    }

    public CategorySpendingResponse(String categoryName, BigDecimal amount) {
        this.categoryName = categoryName;
        this.amount = amount;
    }

    public String getCategoryName() {
        return categoryName;
    }

    public void setCategoryName(String categoryName) {
        this.categoryName = categoryName;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }
}