package com.example.Spendwise_Backend.Projection;

import com.example.Spendwise_Backend.Entity.account.AccountType;

import java.math.BigDecimal;

public interface AccountSummary {

    Long getId();

    String getName();

    AccountType getType();

    BigDecimal getOpeningBalance();
}