package com.example.Spendwise_Backend.Controller;

import com.example.Spendwise_Backend.Response.CategorySpendingResponse;
import com.example.Spendwise_Backend.Service.CategorySpendingService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class CategorySpendingController {

    private final CategorySpendingService categorySpendingService;

    public CategorySpendingController(
            CategorySpendingService categorySpendingService
    ) {
        this.categorySpendingService = categorySpendingService;
    }

    @GetMapping("/{userId}/category-spending")
    public List<CategorySpendingResponse> getCategorySpending(
            @PathVariable Long userId
    ) {
        return categorySpendingService.getCategorySpending(userId);
    }
}