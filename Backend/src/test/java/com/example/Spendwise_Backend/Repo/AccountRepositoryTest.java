package com.example.Spendwise_Backend.Repo;

import com.example.Spendwise_Backend.Entity.account.Account;
import com.example.Spendwise_Backend.Entity.account.AccountType;
import com.example.Spendwise_Backend.Entity.user.User;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.boot.jdbc.test.autoconfigure.AutoConfigureTestDatabase;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
@AutoConfigureTestDatabase(
        replace = AutoConfigureTestDatabase.Replace.NONE
)
class AccountRepositoryTest {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AccountRepository accountRepository;


    @Test
    void shouldSaveAndFindAccountWithUser() {

        User user = new User(
                "Nakul",
                "account" + System.currentTimeMillis() + "@test.com",
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

        Optional<Account> result =
                accountRepository.findById(account.getId());

        assertTrue(result.isPresent());

        Account savedAccount = result.get();

        assertEquals(
                "HDFC Savings",
                savedAccount.getName()
        );

        assertEquals(
                AccountType.BANK,
                savedAccount.getType()
        );

        assertEquals(
                user.getId(),
                savedAccount.getUser().getId()
        );

        assertEquals(
                new BigDecimal("50000.00"),
                savedAccount.getOpeningBalance()
        );
    }


    @Test
    void shouldRejectAccountWithoutUser() {

        Account account = new Account(
                null,
                "HDFC Savings",
                AccountType.BANK,
                new BigDecimal("50000.00")
        );

        assertThrows(
                Exception.class,
                () -> accountRepository.saveAndFlush(account)
        );
    }


    @Test
    void shouldRejectAccountWithoutName() {

        User user = new User(
                "Nakul",
                "noname" + System.currentTimeMillis() + "@test.com",
                "INR"
        );

        user.setPasswordHash("dummy-password-hash");

        user = userRepository.save(user);

        Account account = new Account(
                user,
                null,
                AccountType.BANK,
                new BigDecimal("50000.00")
        );

        assertThrows(
                Exception.class,
                () -> accountRepository.saveAndFlush(account)
        );
    }


    @Test
    void shouldRejectAccountWithoutType() {

        User user = new User(
                "Nakul",
                "notype" + System.currentTimeMillis() + "@test.com",
                "INR"
        );

        user.setPasswordHash("dummy-password-hash");

        user = userRepository.save(user);

        Account account = new Account(
                user,
                "HDFC Savings",
                null,
                new BigDecimal("50000.00")
        );

        assertThrows(
                Exception.class,
                () -> accountRepository.saveAndFlush(account)
        );
    }
}