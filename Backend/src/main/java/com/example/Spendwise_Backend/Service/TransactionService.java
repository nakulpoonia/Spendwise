package com.example.Spendwise_Backend.Service;

import com.example.Spendwise_Backend.Entity.account.Account;
import com.example.Spendwise_Backend.Entity.category.Category;
import com.example.Spendwise_Backend.Entity.category.CategoryType;
import com.example.Spendwise_Backend.Entity.transaction.Transaction;
import com.example.Spendwise_Backend.Exception.ResourceNotFoundException;
import com.example.Spendwise_Backend.Projection.TransactionSummary;
import com.example.Spendwise_Backend.Repo.AccountRepository;
import com.example.Spendwise_Backend.Repo.CategoryRepository;
import com.example.Spendwise_Backend.Repo.TransactionRepository;
import com.example.Spendwise_Backend.Entity.transaction.TransactionDirection;
import com.example.Spendwise_Backend.Entity.transaction.TransactionType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.List;
import java.util.UUID;

@Service
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final CurrentUserService currentUserService;
    private final BudgetService budgetService;
    private final MonthlyBudgetService monthlyBudgetService;
    private final CategoryRepository categoryRepository;


    public TransactionService(TransactionRepository transactionRepository,
                              CurrentUserService currentUserService,
                              BudgetService budgetService,
                              MonthlyBudgetService monthlyBudgetService,
                              CategoryRepository categoryRepository) {
        this.transactionRepository = transactionRepository;
        this.currentUserService=currentUserService;
        this.budgetService= budgetService;
        this.monthlyBudgetService=monthlyBudgetService;
        this.categoryRepository=categoryRepository;


    }



    public Transaction createIncome(
            Account account,
            Category category,
            BigDecimal amount,
            String description,
            LocalDateTime transactionDate
    ) {

        // 1. Validate amount
        validateAmount(amount);

        // 2. Category must exist
        if (category == null) {
            throw new IllegalArgumentException(
                    "Income must have a category"
            );
        }

        // 3. Get current logged-in user
        Long userId = currentUserService.getCurrentUserId();

        // 4. Check account ownership
        if (!account.getUser().getId().equals(userId)) {
            throw new ResourceNotFoundException("Account not found");
        }

        // 5. Check category ownership
        if (!category.getUser().getId().equals(userId)) {
            throw new ResourceNotFoundException("Category not found");
        }

        // 6. Check category type
        if (category.getType() != CategoryType.INCOME) {
            throw new IllegalArgumentException(
                    "Category must be an income category"
            );
        }

        // 7. Create transaction
        Transaction transaction = new Transaction(
                account,
                category,
                amount,
                TransactionType.INCOME,
                TransactionDirection.IN,
                null,
                description,
                transactionDate
        );

        return transactionRepository.save(transaction);
    }

    public Transaction createExpense(
            Account account,
            Category category,
            BigDecimal amount,
            String description,
            LocalDateTime transactionDate
    ) {

        Long userId = currentUserService.getCurrentUserId();

        if (!account.getUser().getId().equals(userId)) {
            throw new RuntimeException("Account does not belong to current user");
        }

        if (category == null) {
            throw new IllegalArgumentException(
                    "Expense must have a category"
            );
        }

        if (!category.getUser().getId().equals(userId)) {
            throw new RuntimeException("Category does not belong to current user");
        }

        if (category.getType() != CategoryType.EXPENSE) {
            throw new IllegalArgumentException(
                    "Category must be an expense category"
            );
        }

        validateAmount(amount);

        Transaction transaction = new Transaction(
                account,
                category,
                amount,
                TransactionType.EXPENSE,
                TransactionDirection.OUT,
                null,
                description,
                transactionDate
        );

        Transaction savedTransaction =
                transactionRepository.save(transaction);

        YearMonth month = YearMonth.from(transactionDate);

        budgetService.checkAndSendCategoryBudgetAlert(
                userId,
                category.getId(),
                month
        );

        monthlyBudgetService.checkAndSendMonthlyBudgetAlert(
                userId,
                month
        );

        return savedTransaction;
    }


    @Transactional
    public void createTransfer(
            Account sourceAccount,
            Account destinationAccount,
            BigDecimal amount,
            String description,
            LocalDateTime transactionDate
    ) {

        Long userId = currentUserService.getCurrentUserId();

        if (!sourceAccount.getUser().getId().equals(userId)
                || !destinationAccount.getUser().getId().equals(userId)) {

            throw new RuntimeException(
                    "You can only transfer between your own accounts"
            );
        }

        validateAmount(amount);

        if (sourceAccount.getId().equals(destinationAccount.getId())) {
            throw new IllegalArgumentException(
                    "Source and destination accounts must be different"
            );
        }

        String transferId = UUID.randomUUID().toString();

        Transaction outgoingTransaction = new Transaction(
                sourceAccount,
                null,
                amount,
                TransactionType.TRANSFER,
                TransactionDirection.OUT,
                transferId,
                description,
                transactionDate
        );

        Transaction incomingTransaction = new Transaction(
                destinationAccount,
                null,
                amount,
                TransactionType.TRANSFER,
                TransactionDirection.IN,
                transferId,
                description,
                transactionDate
        );

        transactionRepository.save(outgoingTransaction);
        transactionRepository.save(incomingTransaction);
    }

    private void validateAmount(BigDecimal amount) {

        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException(
                    "Amount must be greater than zero"
            );
        }
    }

    public List<TransactionSummary> getTransactionsByAccount(Long accountId) {
        Long userId = currentUserService.getCurrentUserId();
        return transactionRepository
                .findByAccountIdAndAccountUserIdOrderByTransactionDateDesc(accountId,userId);
    }

    public TransactionSummary getTransactionById(Long transactionId) {

        Long userId = currentUserService.getCurrentUserId();

        return transactionRepository
                .findProjectedByIdAndAccountUserId(transactionId, userId)
                .orElseThrow(() ->
                        new RuntimeException("Transaction not found"));
    }



    public Transaction updateTransaction(
            Long transactionId,
            BigDecimal amount,
            Category category,
            String description,
            LocalDateTime transactionDate
    ) {
        Long userId = currentUserService.getCurrentUserId();

        Transaction transaction = transactionRepository
                .findByIdAndAccountUserId(transactionId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found"));

        Category verifiedCategory = categoryRepository
                .findByIdAndUserId(category.getId(), userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Category not found"));

        if (transaction.getType() == TransactionType.TRANSFER) {
            throw new IllegalArgumentException(
                    "Transfer transactions cannot be updated using this endpoint"
            );
        }



        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Amount must be greater than zero");
        }

        if (category == null) {
            throw new IllegalArgumentException(
                    "Income and expense transactions must have a category"
            );
        }



        transaction.setAmount(amount);
        transaction.setCategory(verifiedCategory);
        transaction.setDescription(description);
        transaction.setTransactionDate(transactionDate);

        return transactionRepository.save(transaction);
    }

    public void deleteTransaction(Long transactionId) {

        Long userId = currentUserService.getCurrentUserId();

        Transaction transaction = transactionRepository
                .findByIdAndAccountUserId(transactionId, userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Transaction not found"));

        if (transaction.getType() == TransactionType.TRANSFER) {
            throw new IllegalArgumentException(
                    "Use transfer delete endpoint for transfer transactions"
            );
        }

        transactionRepository.delete(transaction);
    }

    @Transactional
    public void deleteTransfer(Long transactionId) {

        Long userId = currentUserService.getCurrentUserId();

        Transaction transaction = transactionRepository
                .findByIdAndAccountUserId(transactionId, userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Transaction not found"));

        if (transaction.getType() != TransactionType.TRANSFER) {
            throw new IllegalArgumentException(
                    "Transaction is not a transfer"
            );
        }

        String transferId = transaction.getTransferId();

        List<Transaction> transferTransactions =
                transactionRepository.findByTransferId(transferId);

        transactionRepository.deleteAll(transferTransactions);
    }


    public List<TransactionSummary> getTransactionByAccountAndCategory(Long accountId, Long categoryId) {

        Long userId = currentUserService.getCurrentUserId();

        return transactionRepository
                .findByAccountIdAndCategoryIdAndAccountUserIdOrderByTransactionDateDesc(
                        accountId,
                        categoryId,
                        userId
                );

    }

    public List<TransactionSummary> getTransactionsByAccountAndDate(
            Long accountId,
            LocalDateTime from,
            LocalDateTime to
    ) {

        Long userId = currentUserService.getCurrentUserId();

        return transactionRepository
                .findByAccountIdAndAccountUserIdAndTransactionDateBetweenOrderByTransactionDateDesc(
                        accountId,
                        userId,
                        from,
                        to
                );
    }

    public List<TransactionSummary> getTransactionsByAccountAndCategoryAndDate(
            Long accountId,
            Long categoryId,
            LocalDateTime from,
            LocalDateTime to
    ) {
        Long userId = currentUserService.getCurrentUserId();

        return transactionRepository
                .findByAccountIdAndCategoryIdAndAccountUserIdAndTransactionDateBetweenOrderByTransactionDateDesc(
                        accountId,
                        categoryId,
                        userId,
                        from,
                        to
                );
    }

    public List<TransactionSummary> getCurrentUserTransactionsByCategory(
            Long categoryId
    ) {

        Long userId = currentUserService.getCurrentUserId();

        categoryRepository
                .findByIdAndUserId(categoryId, userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Category not found"));

        return transactionRepository
                .findByAccountUserIdAndCategoryIdOrderByTransactionDateDesc(
                        userId,
                        categoryId
                );
    }

    public Page<TransactionSummary> getRecentTransactions(Pageable pageable) {

        Long userId = currentUserService.getCurrentUserId();

        return transactionRepository
                .findByAccountUserIdOrderByTransactionDateDesc(
                        userId,
                        pageable
                );
    }

}
