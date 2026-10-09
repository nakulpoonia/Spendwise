package com.example.Spendwise_Backend.Service;

import com.example.Spendwise_Backend.Entity.account.Account;
import com.example.Spendwise_Backend.Entity.account.AccountType;
import com.example.Spendwise_Backend.Entity.category.Category;
import com.example.Spendwise_Backend.Entity.category.CategoryType;
import com.example.Spendwise_Backend.Entity.transaction.Transaction;
import com.example.Spendwise_Backend.Entity.transaction.TransactionDirection;
import com.example.Spendwise_Backend.Entity.transaction.TransactionType;
import com.example.Spendwise_Backend.Entity.user.User;
import com.example.Spendwise_Backend.Repo.CategoryRepository;
import com.example.Spendwise_Backend.Repo.TransactionRepository;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TransactionServiceTest {

    @Mock
    private TransactionRepository transactionRepository;

    @Mock
    private CurrentUserService currentUserService;

    @Mock
    private BudgetService budgetService;

    @Mock
    private MonthlyBudgetService monthlyBudgetService;

    @Mock
    private CategoryRepository categoryRepository;

    @Mock
    private User user;

    private TransactionService transactionService;

    @BeforeEach
    void setUp() {



        transactionService = new TransactionService(
                transactionRepository,
                currentUserService,
                budgetService,
                monthlyBudgetService,
                categoryRepository
        );
    }

    @Test
    void shouldCreateIncome() {



        LocalDateTime transactionDate =
                LocalDateTime.of(2026, 10, 5, 10, 0);

        Account account = new Account(
                user,
                "HDFC Savings",
                AccountType.BANK,
                new BigDecimal("50000.00")
        );

        Category category = new Category(
                user,
                "Salary",
                CategoryType.INCOME
        );

        Transaction savedTransaction = new Transaction(
                account,
                category,
                new BigDecimal("60000.00"),
                TransactionType.INCOME,
                TransactionDirection.IN,
                null,
                "September salary",
                transactionDate
        );

        when(transactionRepository.save(any(Transaction.class)))
                .thenReturn(savedTransaction);

        Transaction result = transactionService.createIncome(
                account,
                category,
                new BigDecimal("60000.00"),
                "September salary",
                transactionDate
        );

        assertNotNull(result);

        assertEquals(
                TransactionType.INCOME,
                result.getType()
        );

        assertEquals(
                TransactionDirection.IN,
                result.getDirection()
        );

        assertEquals(
                new BigDecimal("60000.00"),
                result.getAmount()
        );

        verify(transactionRepository)
                .save(any(Transaction.class));
    }

    @Test
    void shouldCreateExpense() {

        when(currentUserService.getCurrentUserId()).thenReturn(1L);
        when(user.getId()).thenReturn(1L);

        LocalDateTime transactionDate =
                LocalDateTime.of(2026, 10, 5, 12, 0);

        Account account = new Account(
                user,
                "HDFC Savings",
                AccountType.BANK,
                new BigDecimal("50000.00")
        );

        Category category = new Category(
                user,
                "Food",
                CategoryType.EXPENSE
        );

        Transaction savedTransaction = new Transaction(
                account,
                category,
                new BigDecimal("500.00"),
                TransactionType.EXPENSE,
                TransactionDirection.OUT,
                null,
                "Lunch",
                transactionDate
        );

        when(transactionRepository.save(any(Transaction.class)))
                .thenReturn(savedTransaction);

        Transaction result = transactionService.createExpense(
                account,
                category,
                new BigDecimal("500.00"),
                "Lunch",
                transactionDate
        );

        assertNotNull(result);

        assertEquals(
                TransactionType.EXPENSE,
                result.getType()
        );

        assertEquals(
                TransactionDirection.OUT,
                result.getDirection()
        );

        assertEquals(
                new BigDecimal("500.00"),
                result.getAmount()
        );

        verify(transactionRepository)
                .save(any(Transaction.class));

        verify(budgetService)
                .checkAndSendCategoryBudgetAlert(
                        1L,
                        category.getId(),
                        YearMonth.from(transactionDate)
                );

        verify(monthlyBudgetService)
                .checkAndSendMonthlyBudgetAlert(
                        1L,
                        YearMonth.from(transactionDate)
                );
    }

    @Test
    void shouldRejectInvalidIncomeAmount() {

        Account account = new Account(
                user,
                "HDFC Savings",
                AccountType.BANK,
                new BigDecimal("50000.00")
        );

        Category category = new Category(
                user,
                "Salary",
                CategoryType.INCOME
        );

        assertThrows(
                IllegalArgumentException.class,
                () -> transactionService.createIncome(
                        account,
                        category,
                        BigDecimal.ZERO,
                        "Salary",
                        LocalDateTime.now()
                )
        );

        verify(transactionRepository, never())
                .save(any(Transaction.class));
    }

    @Test
    void shouldRejectIncomeWithoutCategory() {

        Account account = new Account(
                user,
                "HDFC Savings",
                AccountType.BANK,
                new BigDecimal("50000.00")
        );

        assertThrows(
                IllegalArgumentException.class,
                () -> transactionService.createIncome(
                        account,
                        null,
                        new BigDecimal("60000.00"),
                        "September salary",
                        LocalDateTime.now()
                )
        );

        verify(transactionRepository, never())
                .save(any(Transaction.class));
    }

    @Test
    void shouldCreateTransfer() {

        when(currentUserService.getCurrentUserId()).thenReturn(1L);
        when(user.getId()).thenReturn(1L);

        LocalDateTime transactionDate =
                LocalDateTime.of(2026, 10, 5, 15, 0);

        Account sourceAccount = new Account(
                user,
                "HDFC Savings",
                AccountType.BANK,
                new BigDecimal("50000.00")
        );

        Account destinationAccount = new Account(
                user,
                "SBI Savings",
                AccountType.SAVINGS,
                new BigDecimal("20000.00")
        );

        sourceAccount.setId(1L);
        destinationAccount.setId(2L);

        transactionService.createTransfer(
                sourceAccount,
                destinationAccount,
                new BigDecimal("10000.00"),
                "Transfer to savings",
                transactionDate
        );

        ArgumentCaptor<Transaction> transactionCaptor =
                ArgumentCaptor.forClass(Transaction.class);

        verify(transactionRepository, times(2))
                .save(transactionCaptor.capture());

        List<Transaction> transactions =
                transactionCaptor.getAllValues();

        assertEquals(2, transactions.size());

        Transaction outgoing = transactions.get(0);
        Transaction incoming = transactions.get(1);

        assertEquals(
                TransactionType.TRANSFER,
                outgoing.getType()
        );

        assertEquals(
                TransactionDirection.OUT,
                outgoing.getDirection()
        );

        assertEquals(
                TransactionDirection.IN,
                incoming.getDirection()
        );

        assertEquals(
                new BigDecimal("10000.00"),
                outgoing.getAmount()
        );

        assertEquals(
                new BigDecimal("10000.00"),
                incoming.getAmount()
        );

        assertNotNull(outgoing.getTransferId());

        assertEquals(
                outgoing.getTransferId(),
                incoming.getTransferId()
        );
    }

    @Test
    void shouldRejectTransferToSameAccount() {

        Account account = new Account(
                user,
                "HDFC Savings",
                AccountType.BANK,
                new BigDecimal("50000.00")
        );

        account.setId(1L);

        assertThrows(
                IllegalArgumentException.class,
                () -> transactionService.createTransfer(
                        account,
                        account,
                        new BigDecimal("10000.00"),
                        "Invalid transfer",
                        LocalDateTime.now()
                )
        );

        verify(transactionRepository, never())
                .save(any(Transaction.class));
    }

    @Test
    void shouldRejectIncomeWithNullAmount() {

        Account account = new Account(
                user,
                "HDFC Savings",
                AccountType.BANK,
                new BigDecimal("50000.00")
        );

        Category category = new Category(
                user,
                "Salary",
                CategoryType.INCOME
        );

        assertThrows(
                IllegalArgumentException.class,
                () -> transactionService.createIncome(
                        account,
                        category,
                        null,
                        "September salary",
                        LocalDateTime.now()
                )
        );

        verify(transactionRepository, never())
                .save(any(Transaction.class));
    }
}