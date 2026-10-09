package com.example.Spendwise_Backend.Request;

import com.example.Spendwise_Backend.Entity.account.AccountType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

import java.math.BigDecimal;

public class UpdateAccountRequest {

    @NotBlank
    private String name;

    @NotNull
    private AccountType type;

    @NotNull
    @PositiveOrZero
    private BigDecimal openingBalance;

    public UpdateAccountRequest() {
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public AccountType getType() {
        return type;
    }

    public void setType(AccountType type) {
        this.type = type;
    }

    public BigDecimal getOpeningBalance() {
        return openingBalance;
    }

    public void setOpeningBalance(BigDecimal openingBalance) {
        this.openingBalance = openingBalance;
    }
}