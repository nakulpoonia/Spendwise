package com.example.Spendwise_Backend.Controller;

import com.example.Spendwise_Backend.Entity.account.Account;
import com.example.Spendwise_Backend.Entity.category.Category;
import com.example.Spendwise_Backend.Entity.transaction.Transaction;
import com.example.Spendwise_Backend.Projection.CategorySummary;
import com.example.Spendwise_Backend.Projection.TransactionSummary;
import com.example.Spendwise_Backend.Repo.AccountRepository;
import com.example.Spendwise_Backend.Repo.CategoryRepository;
import com.example.Spendwise_Backend.Request.CreateExpenseRequest;
import com.example.Spendwise_Backend.Request.CreateIncomeRequest;
import com.example.Spendwise_Backend.Request.CreateTransferRequest;
import com.example.Spendwise_Backend.Request.UpdateTransactionRequest;
import com.example.Spendwise_Backend.Service.CurrentUserService;
import com.example.Spendwise_Backend.Service.TransactionService;
import com.example.Spendwise_Backend.Service.UserService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/transactions")
public class TransactionController {

    private final TransactionService transactionService;
    private final AccountRepository accountRepository;
    private final CategoryRepository categoryRepository;
    private final CurrentUserService currentUserService;

    public TransactionController(
            TransactionService transactionService,
            AccountRepository accountRepository,
            CategoryRepository categoryRepository,
            CurrentUserService currentUserService
    ) {
        this.transactionService = transactionService;
        this.accountRepository = accountRepository;
        this.categoryRepository = categoryRepository;
        this.currentUserService=currentUserService;
    }

    @PostMapping("/income")
    public Transaction createIncome(
            @Valid @RequestBody CreateIncomeRequest request
    ) {

        long userId = currentUserService.getCurrentUserId();

        Account account = accountRepository.findByIdAndUserId(request.getAccountId(),userId)
                .orElseThrow(() ->
                        new IllegalArgumentException("Account not found"));

        Category category = categoryRepository.findByIdAndUserId(request.getCategoryId(),userId)
                .orElseThrow(() ->
                        new IllegalArgumentException("Category not found"));

        return transactionService.createIncome(
                account,
                category,
                request.getAmount(),
                request.getDescription(),
                request.getTransactionDate()
        );
    }

    @PostMapping("/expense")
    public Transaction createExpense(
            @Valid @RequestBody CreateExpenseRequest request) {

        Long userId = currentUserService.getCurrentUserId();

        Account account = accountRepository
                .findByIdAndUserId(request.getAccountId(), userId)
                .orElseThrow(() ->
                        new RuntimeException("Account not found"));

        Category category = categoryRepository
                .findByIdAndUserId(request.getCategoryId(), userId)
                .orElseThrow(() ->
                        new RuntimeException("Category not found"));

        return transactionService.createExpense(
                account,
                category,
                request.getAmount(),
                request.getDescription(),
                request.getTransactionDate()
        );
    }

    @PostMapping("/transfer")
    public void createTransfer(
            @Valid @RequestBody CreateTransferRequest request
    ) {

        Long userId=currentUserService.getCurrentUserId();
        Account sourceAccount = accountRepository.findByIdAndUserId(
                request.getSourceAccountId(),userId
        ).orElseThrow(() ->
                new IllegalArgumentException("Source account not found"));

        Account destinationAccount = accountRepository.findByIdAndUserId(
                request.getDestinationAccountId(),userId
        ).orElseThrow(() ->
                new IllegalArgumentException("Destination account not found"));

        transactionService.createTransfer(
                sourceAccount,
                destinationAccount,
                request.getAmount(),
                request.getDescription(),
                request.getTransactionDate()
        );
    }

    @GetMapping("/account/{accountId}")
    public List<TransactionSummary> getTransactionsByAccount(
            @PathVariable Long accountId) {

        return transactionService.getTransactionsByAccount(accountId);
    }

    @GetMapping("/{id}")
    public TransactionSummary getTransactionById(@PathVariable Long id) {
        return transactionService.getTransactionById(id);
    }

    @PutMapping("/{id}")
    public Transaction updateTransaction(
            @PathVariable Long id,
            @Valid @RequestBody UpdateTransactionRequest request
    ) {
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() ->
                        new IllegalArgumentException("Category not found"));

        return transactionService.updateTransaction(
                id,
                request.getAmount(),
                category,
                request.getDescription(),
                request.getTransactionDate()
        );
    }

    @DeleteMapping("/{id}")
    public void deleteTransaction(@PathVariable Long id) {
        transactionService.deleteTransaction(id);
    }

    @DeleteMapping("/transfer/{id}")
    public void deleteTransfer(@PathVariable Long id) {
        transactionService.deleteTransfer(id);
    }

    @GetMapping("account/{accountId}/category/{categoryId}")
    public List<TransactionSummary> getCategorySummary(@PathVariable Long accountId, @PathVariable Long categoryId){
        return transactionService.getTransactionByAccountAndCategory(accountId,categoryId);
    }

    @GetMapping("/account/{accountId}/date")
    public List<TransactionSummary> getTransactionsByAccountAndDate(
            @PathVariable Long accountId,
            @RequestParam LocalDateTime from,
            @RequestParam LocalDateTime to
    ) {
        return transactionService.getTransactionsByAccountAndDate(
                accountId,
                from,
                to
        );
    }

    @GetMapping("/account/{accountId}/category/{categoryId}/date")
    public List<TransactionSummary> getTransactionsByAccountAndCategoryAndDate(
            @PathVariable Long accountId,
            @PathVariable Long categoryId,
            @RequestParam LocalDateTime from,
            @RequestParam LocalDateTime to
    ) {
        return transactionService.getTransactionsByAccountAndCategoryAndDate(
                accountId,
                categoryId,
                from,
                to
        );
    }

    @GetMapping("/category/{categoryId}")
    public List<TransactionSummary> getCurrentUserTransactionsByCategory(
            @PathVariable Long categoryId
    ) {
        return transactionService
                .getCurrentUserTransactionsByCategory(categoryId);
    }

    @GetMapping("/recent")
    public Page<TransactionSummary> getRecentTransactions(
            @RequestParam(defaultValue = "5") int limit
    ) {

        Pageable pageable = PageRequest.of(0, limit);

        return transactionService.getRecentTransactions(pageable);
    }




}