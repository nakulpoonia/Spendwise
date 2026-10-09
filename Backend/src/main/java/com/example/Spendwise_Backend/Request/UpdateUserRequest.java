package com.example.Spendwise_Backend.Request;

import jakarta.validation.constraints.NotBlank;

public class UpdateUserRequest {

    @NotBlank
    private String name;

    @NotBlank
    private String currency;

    public UpdateUserRequest() {
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getCurrency() {
        return currency;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }
}