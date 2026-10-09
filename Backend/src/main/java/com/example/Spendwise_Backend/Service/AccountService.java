package com.example.Spendwise_Backend.Service;

import com.example.Spendwise_Backend.Entity.account.Account;
import com.example.Spendwise_Backend.Entity.account.AccountType;
import com.example.Spendwise_Backend.Entity.transaction.Transaction;
import com.example.Spendwise_Backend.Entity.transaction.TransactionDirection;
import com.example.Spendwise_Backend.Entity.user.User;
import com.example.Spendwise_Backend.Exception.ResourceNotFoundException;
import com.example.Spendwise_Backend.Projection.AccountSummary;
import com.example.Spendwise_Backend.Repo.AccountRepository;
import com.example.Spendwise_Backend.Repo.TransactionRepository;
import com.example.Spendwise_Backend.Repo.UserRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
public class AccountService {

    private final AccountRepository accountRepository;
    private final UserRepository userRepository;
    private final TransactionRepository transactionRepository;
    private final CurrentUserService currentUserService;

    public AccountService(AccountRepository accountRepository, UserRepository userRepository, TransactionRepository transactionRepository,CurrentUserService currentUserService) {
        this.accountRepository = accountRepository;
        this.userRepository = userRepository;
        this.transactionRepository=transactionRepository;
        this.currentUserService=currentUserService;
    }

    public List<AccountSummary> getAccountsByUser(Long userId) {
        return accountRepository.findByUserId(userId);
    }

    public List<AccountSummary> getCurrentUserAccounts() {
        Long userId = currentUserService.getCurrentUserId();

        return accountRepository.findByUserId(userId);
    }

    public Account createAccount(
            String name,
            AccountType type,
            BigDecimal openingBalance
    ) {
        Long userId = currentUserService.getCurrentUserId();

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found"));

        Account account = new Account(
                user,
                name,
                type,
                openingBalance
        );

        return accountRepository.save(account);
    }

    public AccountSummary getAccountById(Long accountId) {

        Long userId = currentUserService.getCurrentUserId();

        return accountRepository
                .findProjectedByIdAndUserId(accountId, userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Account not found"));
    }

    public Account updateAccount(
            Long accountId,
            String name,
            AccountType type,
            BigDecimal openingBalance
    ) {

        Long userId = currentUserService.getCurrentUserId();

        Account account = accountRepository
                .findByIdAndUserId(accountId, userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Account not found"));

        account.setName(name);
        account.setType(type);
        account.setOpeningBalance(openingBalance);

        return accountRepository.save(account);
    }
    public BigDecimal getAccountBalance(Long accountId) {

        Long userId = currentUserService.getCurrentUserId();

        Account account = accountRepository
                .findByIdAndUserId(accountId, userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Account not found"));

        List<Transaction> transactions =
                transactionRepository.findByAccountId(accountId);

        BigDecimal balance = account.getOpeningBalance();

        for (Transaction transaction : transactions) {

            if (transaction.getDirection() == TransactionDirection.IN) {
                balance = balance.add(transaction.getAmount());

            } else if (transaction.getDirection() == TransactionDirection.OUT) {
                balance = balance.subtract(transaction.getAmount());
            }
        }

        return balance;
    }


}
