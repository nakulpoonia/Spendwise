package com.example.Spendwise_Backend.Service;

import com.example.Spendwise_Backend.Entity.category.Category;
import com.example.Spendwise_Backend.Entity.category.CategoryType;
import com.example.Spendwise_Backend.Entity.user.User;
import com.example.Spendwise_Backend.Exception.ResourceNotFoundException;
import com.example.Spendwise_Backend.Projection.CategorySummary;
import com.example.Spendwise_Backend.Repo.CategoryRepository;
import com.example.Spendwise_Backend.Repo.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;
@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final CurrentUserService currentUserService;

    public CategoryService(CategoryRepository categoryRepository,UserRepository userRepository,CurrentUserService currentUserService){
        this.categoryRepository=categoryRepository;
        this.userRepository=userRepository;
        this.currentUserService=currentUserService;
    }

    public List<CategorySummary> getCategoriesByUser(Long userId) {
        return categoryRepository.findByUserId(userId);
    }

    public List<CategorySummary> getCurrentUserCategoriesByType(
            CategoryType type
    ) {
        Long userId = currentUserService.getCurrentUserId();

        return categoryRepository.findByUserIdAndType(userId, type);
    }

    public Category createCategory(

            String name,
            CategoryType type
    ) {
        Long userId = currentUserService.getCurrentUserId();
        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found"));

        Category category = new Category(
                user,
                name,
                type
        );

        return categoryRepository.save(category);
    }

    public Category updateCategory(Long categoryId, String name) {

        Long userId = currentUserService.getCurrentUserId();

        Category category = categoryRepository
                .findByIdAndUserId(categoryId, userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Category not found"));

        category.setName(name);

        return categoryRepository.save(category);
    }

    public CategorySummary getCategoryById(Long categoryId) {

        Long userId = currentUserService.getCurrentUserId();

        return categoryRepository
                .findProjectedByIdAndUserId(categoryId, userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Category not found"));
    }

    public List<CategorySummary> getCurrentUserCategories() {

        Long userId = currentUserService.getCurrentUserId();

        return categoryRepository.findByUserId(userId);
    }


}
