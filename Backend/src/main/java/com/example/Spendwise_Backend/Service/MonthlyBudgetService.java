package com.example.Spendwise_Backend.Service;

import com.example.Spendwise_Backend.Entity.account.Account;
import com.example.Spendwise_Backend.Entity.budget.MonthlyBudget;
import com.example.Spendwise_Backend.Entity.transaction.Transaction;
import com.example.Spendwise_Backend.Entity.transaction.TransactionType;
import com.example.Spendwise_Backend.Entity.user.User;
import com.example.Spendwise_Backend.Projection.MonthlyBudgetSummary;
import com.example.Spendwise_Backend.Repo.AccountRepository;
import com.example.Spendwise_Backend.Repo.MonthlyBudgetRepository;
import com.example.Spendwise_Backend.Repo.TransactionRepository;
import com.example.Spendwise_Backend.Repo.UserRepository;
import com.example.Spendwise_Backend.Response.MonthlyBudgetProgressResponse;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.YearMonth;
import java.util.List;
import java.util.Optional;

@Service
public class MonthlyBudgetService {

    private final MonthlyBudgetRepository monthlyBudgetRepository;
    private final UserRepository userRepository;
    private final AccountRepository accountRepository;
    private final TransactionRepository transactionRepository;
    private final CurrentUserService currentUserService;
    private final EmailService emailService;

    public MonthlyBudgetService(
            MonthlyBudgetRepository monthlyBudgetRepository,
            UserRepository userRepository,
            AccountRepository accountRepository,
            TransactionRepository transactionRepository,
            CurrentUserService currentUserService,
            EmailService emailService
    ) {
        this.monthlyBudgetRepository = monthlyBudgetRepository;
        this.userRepository = userRepository;
        this.accountRepository = accountRepository;
        this.transactionRepository = transactionRepository;
        this.currentUserService = currentUserService;
        this.emailService=emailService;
    }

    public MonthlyBudget createMonthlyBudget(
            BigDecimal budgetAmount,
            Integer year,
            Integer month
    ) {
        Long userId = currentUserService.getCurrentUserId();

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new IllegalArgumentException("User not found"));

        if (monthlyBudgetRepository
                .findByUserIdAndYearAndMonth(userId, year, month)
                .isPresent()) {
            throw new IllegalArgumentException(
                    "Monthly budget already exists for this month"
            );
        }

        MonthlyBudget monthlyBudget = new MonthlyBudget(
                user,
                budgetAmount,
                year,
                month
        );

        return monthlyBudgetRepository.save(monthlyBudget);
    }





    public MonthlyBudgetSummary getMonthlyBudget(

            Integer year,
            Integer month
    ) {

        Long userId = currentUserService.getCurrentUserId();

        return monthlyBudgetRepository
                .findProjectedByUserIdAndYearAndMonth(
                        userId,
                        year,
                        month
                )
                .orElseThrow(() ->
                        new IllegalArgumentException("Monthly budget not found"));
    }

    public MonthlyBudgetProgressResponse getMonthlyBudgetProgress(

            Integer year,
            Integer month
    ) {

        Long userId = currentUserService.getCurrentUserId();

        MonthlyBudget monthlyBudget =
                monthlyBudgetRepository
                        .findByUserIdAndYearAndMonth(userId, year, month)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Monthly budget not found"
                                ));

        List<Account> accounts =
                accountRepository.findEntitiesByUserId(userId);

        LocalDateTime from =
                LocalDate.of(year, month, 1).atStartOfDay();

        LocalDateTime to =
                YearMonth.of(year, month)
                        .atEndOfMonth()
                        .atTime(LocalTime.MAX);

        BigDecimal spentAmount = BigDecimal.ZERO;

        for (Account account : accounts) {

            List<Transaction> transactions =
                    transactionRepository.findByAccountId(account.getId());

            for (Transaction transaction : transactions) {

                if (transaction.getType() == TransactionType.EXPENSE
                        && !transaction.getTransactionDate().isBefore(from)
                        && !transaction.getTransactionDate().isAfter(to)) {

                    spentAmount =
                            spentAmount.add(transaction.getAmount());
                }
            }
        }

        BigDecimal remainingAmount =
                monthlyBudget.getBudgetAmount()
                        .subtract(spentAmount);

        BigDecimal percentage =
                spentAmount
                        .divide(
                                monthlyBudget.getBudgetAmount(),
                                4,
                                RoundingMode.HALF_UP
                        )
                        .multiply(BigDecimal.valueOf(100));

        return new MonthlyBudgetProgressResponse(
                monthlyBudget.getId(),
                monthlyBudget.getBudgetAmount(),
                spentAmount,
                remainingAmount,
                percentage,
                year,
                month
        );
    }

    public void checkAndSendMonthlyBudgetAlert(
            Long userId,
            YearMonth month) {

        Optional<MonthlyBudget> budgetOptional =
                monthlyBudgetRepository.findByUserIdAndYearAndMonth(
                        userId,
                        month.getYear(),
                        month.getMonthValue()
                );

        if (budgetOptional.isEmpty()) {
            return;
        }

        MonthlyBudget budget = budgetOptional.get();

        // Alert has already been sent
        if (budget.isAlertSent()) {
            return;
        }

        MonthlyBudgetProgressResponse progress =
                getMonthlyBudgetProgress(

                        month.getYear(),
                        month.getMonthValue()
                );

        // Monthly budget has been crossed
        if (progress.getSpentAmount()
                .compareTo(progress.getBudgetAmount()) > 0) {

            emailService.sendBudgetAlert(
                    budget.getUser().getEmail(),
                    "SpendWise Monthly Budget Alert",
                    "Your monthly spending budget has been exceeded.\n\n"
                            + "Budget: ₹" + progress.getBudgetAmount() + "\n"
                            + "Spent: ₹" + progress.getSpentAmount() + "\n"
                            + "Remaining: ₹" + progress.getRemainingAmount()
                            + "\n\n"
                            + "Month: "
                            + month.getMonthValue()
                            + "/" + month.getYear()
            );

            budget.setAlertSent(true);
            monthlyBudgetRepository.save(budget);
        }
    }
}