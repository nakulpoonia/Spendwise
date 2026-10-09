package com.example.Spendwise_Backend.Repo;

import com.example.Spendwise_Backend.Entity.transaction.Transaction;
import com.example.Spendwise_Backend.Projection.TransactionSummary;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    List<TransactionSummary> findByAccountIdAndAccountUserIdOrderByTransactionDateDesc(
            Long accountId,
            Long userId
    );

    Optional<TransactionSummary> findProjectedByIdAndAccountUserId(
            Long id,
            Long userId
    );

    List<Transaction> findByTransferId(String transferId);

    List<TransactionSummary> findByAccountIdAndCategoryIdOrderByTransactionDateDesc(Long AccountId, Long categoryId);

    List<TransactionSummary> findByAccountIdAndTransactionDateBetweenOrderByTransactionDateDesc(
            Long accountId,
            LocalDateTime from,
            LocalDateTime to
    );

    List<TransactionSummary> findByAccountIdAndCategoryIdAndTransactionDateBetweenOrderByTransactionDateDesc(
            Long accountId,
            Long categoryId,
            LocalDateTime from,
            LocalDateTime to
    );

    List<Transaction> findByAccountId(Long accountId);

    List<TransactionSummary> findByAccountUserIdAndCategoryIdOrderByTransactionDateDesc(
            Long userId,
            Long categoryId
    );

    Optional<Transaction> findByIdAndAccountUserId(
            Long id,
            Long userId
    );

    List<TransactionSummary>
    findByAccountIdAndCategoryIdAndAccountUserIdOrderByTransactionDateDesc(
            Long accountId,
            Long categoryId,
            Long userId
    );

    List<TransactionSummary>
    findByAccountIdAndCategoryIdAndAccountUserIdAndTransactionDateBetweenOrderByTransactionDateDesc(
            Long accountId,
            Long categoryId,
            Long userId,
            LocalDateTime from,
            LocalDateTime to
    );

    List<TransactionSummary>
    findByAccountIdAndAccountUserIdAndTransactionDateBetweenOrderByTransactionDateDesc(
            Long accountId,
            Long userId,
            LocalDateTime from,
            LocalDateTime to
    );


    List<TransactionSummary> findByAccountIdOrderByTransactionDateDesc(Long id);

    Page<TransactionSummary> findByAccountUserIdOrderByTransactionDateDesc(
            Long userId,
            Pageable pageable
    );
}
