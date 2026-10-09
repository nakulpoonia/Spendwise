package com.example.Spendwise_Backend.Controller;

import com.example.Spendwise_Backend.Entity.category.Category;
import com.example.Spendwise_Backend.Entity.category.CategoryType;
import com.example.Spendwise_Backend.Projection.CategorySummary;
import com.example.Spendwise_Backend.Request.CreateCategoryRequest;
import com.example.Spendwise_Backend.Request.UpdateCategoryRequest;
import com.example.Spendwise_Backend.Service.CategoryService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {

    private final CategoryService categoryService;

    public CategoryController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }

//    @GetMapping("/user/{userId}")
//    public List<CategorySummary> getCategoriesByUser(
//            @PathVariable Long userId) {
//
//        return categoryService.getCategoriesByUser(userId);
//    }

    @GetMapping("/type/{type}")
    public List<CategorySummary> getCurrentUserCategoriesByType(
            @PathVariable CategoryType type
    ) {
        return categoryService.getCurrentUserCategoriesByType(type);
    }

    @PostMapping
    public Category createCategory(

            @Valid @RequestBody CreateCategoryRequest request
    ) {
        return categoryService.createCategory(
                request.getName(),
                request.getType()
        );
    }

    @PutMapping("/{id}")
    public Category updateCategory(@PathVariable Long id, @Valid @RequestBody UpdateCategoryRequest request){
        return categoryService.updateCategory(id,request.getName());
    }

    @GetMapping("/{id}")
    public CategorySummary getCategoryById(@PathVariable Long id) {
        return categoryService.getCategoryById(id);
    }

    @GetMapping
    public List<CategorySummary> getCurrentUserCategories() {
        return categoryService.getCurrentUserCategories();
    }




}
