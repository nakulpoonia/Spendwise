package com.example.Spendwise_Backend.Response;

public class UserResponse {

    private Long id;
    private String name;
    private String email;
    private String currency;

    public UserResponse() {
    }

    public UserResponse(
            Long id,
            String name,
            String email,
            String currency
    ) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.currency = currency;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getCurrency() {
        return currency;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }
}