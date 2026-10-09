package com.example.Spendwise_Backend.Repo;

import com.example.Spendwise_Backend.Entity.account.Account;
import com.example.Spendwise_Backend.Entity.account.AccountType;
import com.example.Spendwise_Backend.Entity.transaction.Transaction;
import com.example.Spendwise_Backend.Entity.transaction.TransactionDirection;
import com.example.Spendwise_Backend.Entity.transaction.TransactionType;
import com.example.Spendwise_Backend.Entity.user.User;
import com.example.Spendwise_Backend.Projection.TransactionSummary;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.boot.jdbc.test.autoconfigure.AutoConfigureTestDatabase;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
@AutoConfigureTestDatabase(
        replace = AutoConfigureTestDatabase.Replace.NONE
)
class TransactionRepositoryTest {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AccountRepository accountRepository;

    @Autowired
    private TransactionRepository transactionRepository;


    @Test
    void shouldFindTransactionsByAccountIdOrderedByDate() {

        User user = new User(
                "Nakul",
                "nakul" + System.currentTimeMillis() + "@test.com",
                "INR"
        );

        user.setPasswordHash("dummy-password-hash");

        user = userRepository.save(user);

        Account account = new Account(
                user,
                "HDFC Savings",
                AccountType.BANK,
                new BigDecimal("50000.00")
        );

        account = accountRepository.save(account);

        Transaction older = new Transaction(
                account,
                null,
                new BigDecimal("500.00"),
                TransactionType.EXPENSE,
                TransactionDirection.OUT,
                null,
                "Older expense",
                LocalDateTime.of(2026, 9, 10, 10, 0)
        );

        Transaction newer = new Transaction(
                account,
                null,
                new BigDecimal("1000.00"),
                TransactionType.EXPENSE,
                TransactionDirection.OUT,
                null,
                "Newer expense",
                LocalDateTime.of(2026, 9, 14, 10, 0)
        );

        older = transactionRepository.save(older);
        newer = transactionRepository.save(newer);

        List<TransactionSummary> transactions =
                transactionRepository.findByAccountIdOrderByTransactionDateDesc(
                        account.getId()
                );

        assertEquals(2, transactions.size());

        assertEquals(
                newer.getId(),
                transactions.get(0).getId()
        );

        assertEquals(
                older.getId(),
                transactions.get(1).getId()
        );
    }


    @Test
    void shouldReturnEmptyListForAccountWithNoTransactions() {

        User user = new User(
                "Nakul",
                "empty" + System.currentTimeMillis() + "@test.com",
                "INR"
        );

        user.setPasswordHash("dummy-password-hash");

        user = userRepository.save(user);

        Account account = new Account(
                user,
                "Empty Account",
                AccountType.BANK,
                new BigDecimal("0.00")
        );

        account = accountRepository.save(account);

        List<TransactionSummary> transactions =
                transactionRepository.findByAccountIdOrderByTransactionDateDesc(
                        account.getId()
                );

        assertNotNull(transactions);
        assertTrue(transactions.isEmpty());
    }


    @Test
    void shouldOnlyReturnTransactionsForRequestedAccount() {

        User user = new User(
                "Nakul",
                "isolation" + System.currentTimeMillis() + "@test.com",
                "INR"
        );

        user.setPasswordHash("dummy-password-hash");

        user = userRepository.save(user);

        Account firstAccount = new Account(
                user,
                "HDFC Savings",
                AccountType.BANK,
                new BigDecimal("50000.00")
        );

        Account secondAccount = new Account(
                user,
                "SBI Savings",
                AccountType.SAVINGS,
                new BigDecimal("20000.00")
        );

        firstAccount = accountRepository.save(firstAccount);
        secondAccount = accountRepository.save(secondAccount);

        Transaction firstTransaction = new Transaction(
                firstAccount,
                null,
                new BigDecimal("1000.00"),
                TransactionType.EXPENSE,
                TransactionDirection.OUT,
                null,
                "HDFC expense",
                LocalDateTime.of(2026, 9, 14, 10, 0)
        );

        Transaction secondTransaction = new Transaction(
                secondAccount,
                null,
                new BigDecimal("2000.00"),
                TransactionType.EXPENSE,
                TransactionDirection.OUT,
                null,
                "SBI expense",
                LocalDateTime.of(2026, 9, 14, 11, 0)
        );

        firstTransaction = transactionRepository.save(firstTransaction);
        transactionRepository.save(secondTransaction);

        List<TransactionSummary> transactions =
                transactionRepository.findByAccountIdOrderByTransactionDateDesc(
                        firstAccount.getId()
                );

        assertEquals(1, transactions.size());

        assertEquals(
                firstTransaction.getId(),
                transactions.get(0).getId()
        );
    }
}