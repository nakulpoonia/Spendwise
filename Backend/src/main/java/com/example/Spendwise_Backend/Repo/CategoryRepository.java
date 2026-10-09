package com.example.Spendwise_Backend.Repo;

import com.example.Spendwise_Backend.Entity.category.Category;
import com.example.Spendwise_Backend.Entity.category.CategoryType;
import com.example.Spendwise_Backend.Projection.CategorySummary;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface  CategoryRepository extends JpaRepository<Category, Long> {

    List<CategorySummary> findByUserId(Long userId);

    List<CategorySummary> findByUserIdAndType(Long userId, CategoryType type);

    Optional<CategorySummary> findProjectedById(Long id);

    Optional<CategorySummary> findProjectedByIdAndUserId(
            Long id,
            Long userId
    );

    Optional<Category> findByIdAndUserId(Long id, Long userId);

    List<Category> findProjectedByUserIdAndType(Long userId, CategoryType type);
}