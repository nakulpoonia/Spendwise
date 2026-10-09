package com.example.Spendwise_Backend.Repo;

import com.example.Spendwise_Backend.Entity.budget.Budget;
import com.example.Spendwise_Backend.Projection.BudgetSummary;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface BudgetRepository extends JpaRepository<Budget, Long> {

    List<Budget> findByUserId(Long userId);

    Optional<Budget> findByUserIdAndCategoryIdAndYearAndMonth(
            Long userId,
            Long categoryId,
            Integer year,
            Integer month
    );

    List<BudgetSummary> findProjectedByUserId(Long userId);

    Optional<Budget> findByIdAndUserId(Long Id,Long userId);
}