package com.example.Spendwise_Backend.Repo;

import com.example.Spendwise_Backend.Entity.budget.MonthlyBudget;
import com.example.Spendwise_Backend.Projection.MonthlyBudgetSummary;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface MonthlyBudgetRepository
        extends JpaRepository<MonthlyBudget, Long> {

    Optional<MonthlyBudget> findByUserIdAndYearAndMonth(
            Long userId,
            Integer year,
            Integer month
    );

    Optional<MonthlyBudgetSummary> findProjectedByUserIdAndYearAndMonth(
            Long userId,
            Integer year,
            Integer month
    );

    Optional<MonthlyBudget> findByIdAndUserId(Long id, Long userId);
}
