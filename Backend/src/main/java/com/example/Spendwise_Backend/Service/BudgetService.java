package com.example.Spendwise_Backend.Service;

import com.example.Spendwise_Backend.Entity.budget.Budget;
import com.example.Spendwise_Backend.Entity.category.Category;
import com.example.Spendwise_Backend.Entity.category.CategoryType;
import com.example.Spendwise_Backend.Entity.transaction.TransactionType;
import com.example.Spendwise_Backend.Entity.user.User;
import com.example.Spendwise_Backend.Exception.ResourceNotFoundException;
import com.example.Spendwise_Backend.Projection.BudgetSummary;
import com.example.Spendwise_Backend.Projection.TransactionSummary;
import com.example.Spendwise_Backend.Repo.BudgetRepository;
import com.example.Spendwise_Backend.Repo.CategoryRepository;
import com.example.Spendwise_Backend.Repo.TransactionRepository;
import com.example.Spendwise_Backend.Repo.UserRepository;
import com.example.Spendwise_Backend.Response.BudgetProgressResponse;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.YearMonth;
import java.util.List;
import java.util.Optional;

@Service
public class BudgetService {

    private final BudgetRepository budgetRepository;
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final TransactionRepository transactionRepository;
    private final CurrentUserService currentUserService;
    private final EmailService emailService;

    public BudgetService(
            BudgetRepository budgetRepository,
            CategoryRepository categoryRepository,
            UserRepository userRepository,
            CurrentUserService currentUserService,
            TransactionRepository transactionRepository,
            EmailService emailService) {

        this.budgetRepository = budgetRepository;
        this.categoryRepository = categoryRepository;
        this.userRepository = userRepository;
        this.currentUserService = currentUserService;
        this.transactionRepository = transactionRepository;
        this.emailService = emailService;
    }

    public Budget createBudget(

            Long categoryId,
            BigDecimal budgetAmount,
            Integer year,
            Integer month
    ) {
        Long userId = currentUserService.getCurrentUserId();

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new IllegalArgumentException("User not found"));

        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() ->
                        new IllegalArgumentException("Category not found"));

        if (!category.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException(
                    "Category does not belong to this user"
            );
        }

        if (category.getType() != CategoryType.EXPENSE) {
            throw new IllegalArgumentException(
                    "Budget can only be created for expense categories"
            );
        }

        if (budgetRepository
                .findByUserIdAndCategoryIdAndYearAndMonth(
                        userId, categoryId, year, month
                ).isPresent()) {
            throw new IllegalArgumentException(
                    "Budget already exists for this category and month"
            );
        }

        Budget budget = new Budget(
                user,
                category,
                budgetAmount,
                year,
                month
        );

        return budgetRepository.save(budget);
    }

    public List<BudgetSummary> getCurrentUserBudgets() {
        Long userId = currentUserService.getCurrentUserId();

        return budgetRepository.findProjectedByUserId(userId);
    }

    public BudgetProgressResponse getBudgetProgress(Long budgetId) {

        Long userId = currentUserService.getCurrentUserId();

        Budget budget = budgetRepository.findByIdAndUserId(budgetId,userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Budget not found"));

        YearMonth yearMonth =
                YearMonth.of(budget.getYear(), budget.getMonth());

        LocalDateTime from =
                yearMonth.atDay(1).atStartOfDay();

        LocalDateTime to =
                yearMonth.atEndOfMonth().atTime(LocalTime.MAX);

        List<TransactionSummary> transactions =
                transactionRepository
                        .findByAccountUserIdAndCategoryIdOrderByTransactionDateDesc(
                                budget.getUser().getId(),
                                budget.getCategory().getId()
                        );

        BigDecimal spentAmount = BigDecimal.ZERO;

        for (TransactionSummary transaction : transactions) {

            if (transaction.getType() == TransactionType.EXPENSE
                    && !transaction.getTransactionDate().isBefore(from)
                    && !transaction.getTransactionDate().isAfter(to)) {

                spentAmount = spentAmount.add(transaction.getAmount());
            }
        }

        BigDecimal remainingAmount =
                budget.getBudgetAmount().subtract(spentAmount);

        BigDecimal percentage =
                spentAmount
                        .divide(
                                budget.getBudgetAmount(),
                                4,
                                RoundingMode.HALF_UP
                        )
                        .multiply(BigDecimal.valueOf(100));

        return new BudgetProgressResponse(
                budget.getId(),
                budget.getCategory().getName(),
                budget.getBudgetAmount(),
                spentAmount,
                remainingAmount,
                percentage
        );
    }

    public void checkAndSendCategoryBudgetAlert(Long userId, Long categoryId) {

        YearMonth currentMonth = YearMonth.now();

        Optional<Budget> budgetOptional =
                budgetRepository.findByUserIdAndCategoryIdAndYearAndMonth(
                        userId,
                        categoryId,
                        currentMonth.getYear(),
                        currentMonth.getMonthValue()
                );

        if (budgetOptional.isEmpty()) {
            return;
        }

        Budget budget = budgetOptional.get();

        if (budget.isAlertSent()) {
            return;
        }

        BudgetProgressResponse progress =
                getBudgetProgress(budget.getId());

        if (progress.getSpentAmount()
                .compareTo(progress.getBudgetAmount()) > 0) {

            emailService.sendBudgetAlert(
                    budget.getUser().getEmail(),
                    "SpendWise Budget Alert",
                    "Your " + budget.getCategory().getName()
                            + " budget has been exceeded.\n\n"
                            + "Budget: ₹" + progress.getBudgetAmount() + "\n"
                            + "Spent: ₹" + progress.getSpentAmount() + "\n"
                            + "Remaining: ₹" + progress.getRemainingAmount()
            );

            budget.setAlertSent(true);
            budgetRepository.save(budget);
        }
    }

    public void checkAndSendCategoryBudgetAlert(
            Long userId,
            Long categoryId,
            YearMonth month) {

        Optional<Budget> budgetOptional =
                budgetRepository.findByUserIdAndCategoryIdAndYearAndMonth(
                        userId,
                        categoryId,
                        month.getYear(),
                        month.getMonthValue()
                );

        if (budgetOptional.isEmpty()) {
            return;
        }

        Budget budget = budgetOptional.get();

        // Alert has already been sent
        if (budget.isAlertSent()) {
            return;
        }

        BudgetProgressResponse progress =
                getBudgetProgress(budget.getId());

        // Budget has been crossed
        if (progress.getSpentAmount()
                .compareTo(progress.getBudgetAmount()) > 0) {

            emailService.sendBudgetAlert(
                    budget.getUser().getEmail(),
                    "SpendWise Budget Alert",
                    "Your " + budget.getCategory().getName()
                            + " budget has been exceeded.\n\n"
                            + "Budget: ₹" + progress.getBudgetAmount() + "\n"
                            + "Spent: ₹" + progress.getSpentAmount() + "\n"
                            + "Remaining: ₹" + progress.getRemainingAmount()
            );

            budget.setAlertSent(true);
            budgetRepository.save(budget);
        }
    }
}