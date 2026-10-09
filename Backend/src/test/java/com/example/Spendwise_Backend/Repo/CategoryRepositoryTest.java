package com.example.Spendwise_Backend.Repo;

import com.example.Spendwise_Backend.Entity.category.Category;
import com.example.Spendwise_Backend.Entity.category.CategoryType;
import com.example.Spendwise_Backend.Entity.user.User;
import com.example.Spendwise_Backend.Projection.CategorySummary;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.boot.jdbc.test.autoconfigure.AutoConfigureTestDatabase;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
@AutoConfigureTestDatabase(
        replace = AutoConfigureTestDatabase.Replace.NONE
)
class CategoryRepositoryTest {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CategoryRepository categoryRepository;


    @Test
    void shouldFindCategoriesByUserId() {

        User user = new User(
                "Nakul",
                "category" + System.currentTimeMillis() + "@test.com",
                "INR"
        );

        user.setPasswordHash("dummy-password-hash");

        user = userRepository.save(user);

        Category salary = new Category(
                user,
                "Salary",
                CategoryType.INCOME
        );

        Category food = new Category(
                user,
                "Food",
                CategoryType.EXPENSE
        );

        categoryRepository.save(salary);
        categoryRepository.save(food);

        List<CategorySummary> categories =
                categoryRepository.findByUserId(user.getId());

        assertEquals(2, categories.size());

        assertTrue(
                categories.stream()
                        .anyMatch(c -> c.getName().equals("Salary"))
        );

        assertTrue(
                categories.stream()
                        .anyMatch(c -> c.getName().equals("Food"))
        );
    }


    @Test
    void shouldFindCategoriesByUserIdAndType() {

        User user = new User(
                "Nakul",
                "categorytype" + System.currentTimeMillis() + "@test.com",
                "INR"
        );

        user.setPasswordHash("dummy-password-hash");

        user = userRepository.save(user);

        Category salary = new Category(
                user,
                "Salary",
                CategoryType.INCOME
        );

        Category bonus = new Category(
                user,
                "Bonus",
                CategoryType.INCOME
        );

        Category food = new Category(
                user,
                "Food",
                CategoryType.EXPENSE
        );

        categoryRepository.save(salary);
        categoryRepository.save(bonus);
        categoryRepository.save(food);

        List<CategorySummary> incomeCategories =
                categoryRepository.findByUserIdAndType(
                        user.getId(),
                        CategoryType.INCOME
                );

        assertEquals(2, incomeCategories.size());

        assertTrue(
                incomeCategories.stream()
                        .allMatch(c -> c.getType() == CategoryType.INCOME)
        );
    }
}