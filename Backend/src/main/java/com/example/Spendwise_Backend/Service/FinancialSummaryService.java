package com.example.Spendwise_Backend.Service;

import com.example.Spendwise_Backend.Entity.transaction.TransactionDirection;
import com.example.Spendwise_Backend.Entity.transaction.TransactionType;
import com.example.Spendwise_Backend.Projection.AccountSummary;
import com.example.Spendwise_Backend.Projection.TransactionSummary;
import com.example.Spendwise_Backend.Repo.AccountRepository;
import com.example.Spendwise_Backend.Repo.TransactionRepository;
import com.example.Spendwise_Backend.Response.FinancialSummaryResponse;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.List;

@Service
public class FinancialSummaryService {

    private final AccountRepository accountRepository;
    private final TransactionRepository transactionRepository;
    private final CurrentUserService currentUserService;

    public FinancialSummaryService(
            AccountRepository accountRepository,
            TransactionRepository transactionRepository,
            CurrentUserService currentUserService
    ) {
        this.accountRepository = accountRepository;
        this.transactionRepository = transactionRepository;
        this.currentUserService = currentUserService;
    }

    public FinancialSummaryResponse getMonthlySummary(
            Long userId,
            YearMonth month
    ) {
        List<AccountSummary> accounts =
                accountRepository.findByUserId(userId);

        LocalDateTime from = month.atDay(1).atStartOfDay();
        LocalDateTime to = month.atEndOfMonth().atTime(23, 59, 59);

        BigDecimal totalBalance = BigDecimal.ZERO;
        BigDecimal totalIncome = BigDecimal.ZERO;
        BigDecimal totalExpense = BigDecimal.ZERO;

        for (AccountSummary account : accounts) {

            /*
             * Calculate current balance of this account.
             *
             * Current Balance =
             * Opening Balance + IN transactions - OUT transactions
             */
            BigDecimal accountBalance = account.getOpeningBalance();

            List<TransactionSummary> allTransactions =
                    transactionRepository
                            .findByAccountIdOrderByTransactionDateDesc(
                                    account.getId()
                            );

            for (TransactionSummary transaction : allTransactions) {

                if (transaction.getDirection() == TransactionDirection.IN) {
                    accountBalance =
                            accountBalance.add(transaction.getAmount());

                } else if (transaction.getDirection() == TransactionDirection.OUT) {
                    accountBalance =
                            accountBalance.subtract(transaction.getAmount());
                }
            }

            totalBalance = totalBalance.add(accountBalance);

            /*
             * Calculate monthly income and expense.
             */
            List<TransactionSummary> monthlyTransactions =
                    transactionRepository
                            .findByAccountIdAndTransactionDateBetweenOrderByTransactionDateDesc(
                                    account.getId(),
                                    from,
                                    to
                            );

            for (TransactionSummary transaction : monthlyTransactions) {

                if (transaction.getType() == TransactionType.INCOME) {

                    totalIncome =
                            totalIncome.add(transaction.getAmount());

                } else if (transaction.getType() == TransactionType.EXPENSE) {

                    totalExpense =
                            totalExpense.add(transaction.getAmount());
                }
            }
        }

        BigDecimal net = totalIncome.subtract(totalExpense);

        return new FinancialSummaryResponse(
                totalBalance,
                totalIncome,
                totalExpense,
                net
        );
    }

    public FinancialSummaryResponse getCurrentUserMonthlySummary(
            YearMonth month
    ) {
        Long userId = currentUserService.getCurrentUserId();

        return getMonthlySummary(userId, month);
    }
}