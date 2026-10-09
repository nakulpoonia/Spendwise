package com.example.Spendwise_Backend.Controller;

import com.example.Spendwise_Backend.Entity.account.Account;
import com.example.Spendwise_Backend.Projection.AccountSummary;
import com.example.Spendwise_Backend.Request.CreateAccountRequest;
import com.example.Spendwise_Backend.Request.UpdateAccountRequest;
import com.example.Spendwise_Backend.Service.AccountService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/accounts")
public class AccountController {

    private final AccountService accountService;

    public AccountController(AccountService accountService) {
        this.accountService = accountService;
    }

//    @GetMapping("/user/{userId}")
//    public List<AccountSummary> getAllAccounts(@PathVariable Long userId) {
//        return accountService.getAccountsByUser(userId);
//    }

    @PostMapping
    public Account createAccount(
            @Valid @RequestBody CreateAccountRequest request
    ) {
        return accountService.createAccount(
                request.getName(),
                request.getType(),
                request.getOpeningBalance()
        );
    }

    @GetMapping("/{id}")
    public AccountSummary getAccountSummary(@PathVariable Long id) {
        return accountService.getAccountById(id);
    }

    @PutMapping("/{id}")
    public Account updateAccount(@PathVariable Long id, @Valid @RequestBody UpdateAccountRequest request) {
        return accountService.updateAccount(id, request.getName(), request.getType(), request.getOpeningBalance());
    }

    @GetMapping("{id}/balance")
    public BigDecimal getAccountBalance(@PathVariable Long id) {
        return accountService.getAccountBalance(id);
    }

    @GetMapping
    public List<AccountSummary> getCurrentUserAccounts() {
        return accountService.getCurrentUserAccounts();
    }
}





