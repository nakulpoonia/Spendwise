package com.example.Spendwise_Backend.Controller;

import com.example.Spendwise_Backend.Entity.category.Category;
import com.example.Spendwise_Backend.Entity.category.CategoryType;
import com.example.Spendwise_Backend.Projection.CategorySummary;
import com.example.Spendwise_Backend.Service.CategoryService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(CategoryController.class)
@AutoConfigureMockMvc(addFilters = false)
class CategoryControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private CategoryService categoryService;


    // =========================================================
    // CREATE CATEGORY
    // =========================================================

    @Test
    void shouldCreateCategory() throws Exception {

        String requestBody = """
                {
                    "name": "Food",
                    "type": "EXPENSE"
                }
                """;

        mockMvc.perform(
                        post("/api/categories")
                                .contentType(APPLICATION_JSON)
                                .content(requestBody)
                )
                .andExpect(status().isOk());

        verify(categoryService).createCategory(
                eq("Food"),
                eq(CategoryType.EXPENSE)
        );
    }


    // =========================================================
    // CREATE CATEGORY - VALIDATION
    // =========================================================

    @Test
    void shouldRejectInvalidCreateCategoryRequest() throws Exception {

        String requestBody = """
                {
                    "name": "",
                    "type": null
                }
                """;

        mockMvc.perform(
                        post("/api/categories")
                                .contentType(APPLICATION_JSON)
                                .content(requestBody)
                )
                .andExpect(status().isBadRequest());
    }


    // =========================================================
    // GET CURRENT USER CATEGORIES
    // =========================================================

    @Test
    void shouldGetCurrentUserCategories() throws Exception {

        when(categoryService.getCurrentUserCategories())
                .thenReturn(List.of());

        mockMvc.perform(
                        get("/api/categories")
                )
                .andExpect(status().isOk());

        verify(categoryService)
                .getCurrentUserCategories();
    }


    // =========================================================
    // GET CATEGORY BY ID
    // =========================================================

    @Test
    void shouldGetCategoryById() throws Exception {

        CategorySummary summary = new CategorySummary() {

            @Override
            public Long getId() {
                return 1L;
            }

            @Override
            public String getName() {
                return "Food";
            }

            @Override
            public CategoryType getType() {
                return CategoryType.EXPENSE;
            }
        };

        when(categoryService.getCategoryById(1L))
                .thenReturn(summary);

        mockMvc.perform(
                        get("/api/categories/1")
                )
                .andExpect(status().isOk());

        verify(categoryService)
                .getCategoryById(1L);
    }


    // =========================================================
    // GET CATEGORIES BY TYPE
    // =========================================================

    @Test
    void shouldGetCategoriesByType() throws Exception {

        when(categoryService.getCurrentUserCategoriesByType(
                CategoryType.EXPENSE
        )).thenReturn(List.of());

        mockMvc.perform(
                        get("/api/categories/type/EXPENSE")
                )
                .andExpect(status().isOk());

        verify(categoryService)
                .getCurrentUserCategoriesByType(
                        CategoryType.EXPENSE
                );
    }


    // =========================================================
    // UPDATE CATEGORY
    // =========================================================

    @Test
    void shouldUpdateCategory() throws Exception {

        String requestBody = """
                {
                    "name": "Dining"
                }
                """;

        mockMvc.perform(
                        put("/api/categories/1")
                                .contentType(APPLICATION_JSON)
                                .content(requestBody)
                )
                .andExpect(status().isOk());

        verify(categoryService)
                .updateCategory(
                        eq(1L),
                        eq("Dining")
                );
    }


    // =========================================================
    // UPDATE CATEGORY - VALIDATION
    // =========================================================

    @Test
    void shouldRejectInvalidUpdateCategoryRequest() throws Exception {

        String requestBody = """
                {
                    "name": ""
                }
                """;

        mockMvc.perform(
                        put("/api/categories/1")
                                .contentType(APPLICATION_JSON)
                                .content(requestBody)
                )
                .andExpect(status().isBadRequest());
    }
}
