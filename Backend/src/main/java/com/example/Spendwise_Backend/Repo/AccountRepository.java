package com.example.Spendwise_Backend.Repo;

import com.example.Spendwise_Backend.Entity.account.Account;
import com.example.Spendwise_Backend.Entity.transaction.Transaction;
import com.example.Spendwise_Backend.Projection.AccountSummary;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AccountRepository extends JpaRepository<Account,Long> {
    List<AccountSummary> findByUserId(Long userId);
    Optional<AccountSummary> findProjectedByIdAndUserId(
            Long id,
            Long userId
    );

    List<Account> findEntitiesByUserId(Long userId);

    Optional<Account> findByIdAndUserId(Long id, Long userId);




}
