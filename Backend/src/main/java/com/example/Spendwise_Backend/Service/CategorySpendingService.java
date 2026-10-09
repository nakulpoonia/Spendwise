package com.example.Spendwise_Backend.Service;

import com.example.Spendwise_Backend.Entity.account.Account;
import com.example.Spendwise_Backend.Entity.transaction.Transaction;
import com.example.Spendwise_Backend.Entity.transaction.TransactionType;
import com.example.Spendwise_Backend.Repo.AccountRepository;
import com.example.Spendwise_Backend.Repo.TransactionRepository;
import com.example.Spendwise_Backend.Response.CategorySpendingResponse;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class CategorySpendingService {

    private final AccountRepository accountRepository;
    private final TransactionRepository transactionRepository;

    public CategorySpendingService(
            AccountRepository accountRepository,
            TransactionRepository transactionRepository
    ) {
        this.accountRepository = accountRepository;
        this.transactionRepository = transactionRepository;
    }

    public List<CategorySpendingResponse> getCategorySpending(Long userId) {

        List<Account> accounts = accountRepository.findEntitiesByUserId(userId);

        Map<String, BigDecimal> spendingByCategory = new HashMap<>();

        for (Account account : accounts) {

            List<Transaction> transactions =
                    transactionRepository.findByAccountId(account.getId());

            for (Transaction transaction : transactions) {

                if (transaction.getType() == TransactionType.EXPENSE) {

                    String categoryName =
                            transaction.getCategory().getName();

                    BigDecimal currentAmount =
                            spendingByCategory.getOrDefault(
                                    categoryName,
                                    BigDecimal.ZERO
                            );

                    spendingByCategory.put(
                            categoryName,
                            currentAmount.add(transaction.getAmount())
                    );
                }
            }
        }

        List<CategorySpendingResponse> response = new ArrayList<>();

        for (Map.Entry<String, BigDecimal> entry
                : spendingByCategory.entrySet()) {

            response.add(
                    new CategorySpendingResponse(
                            entry.getKey(),
                            entry.getValue()
                    )
            );
        }

        return response;
    }
}