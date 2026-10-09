package com.example.Spendwise_Backend.Projection;

import com.example.Spendwise_Backend.Entity.category.CategoryType;

public interface CategorySummary {

    Long getId();
    String getName();
    CategoryType getType();
}
