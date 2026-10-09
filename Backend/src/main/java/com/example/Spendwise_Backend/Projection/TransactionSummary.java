package com.example.Spendwise_Backend.Projection;

import com.example.Spendwise_Backend.Entity.transaction.TransactionDirection;
import com.example.Spendwise_Backend.Entity.transaction.TransactionType;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public interface TransactionSummary {

    Long getId();

    BigDecimal getAmount();

    TransactionType getType();

    TransactionDirection getDirection();

    String getDescription();

    LocalDateTime getTransactionDate();
}