package com.banking.accountservice.controller;

import com.banking.accountservice.dto.AccountCreateRequest;
import com.banking.accountservice.dto.AccountResponse;
import com.banking.accountservice.dto.AccountUpdateRequest;
import com.banking.accountservice.service.AccountService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/accounts")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Account Management", description = "APIs for managing customer accounts")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class AccountController {

    private final AccountService accountService;

    @PostMapping
    @Operation(summary = "Create new account", description = "Creates a new account for a customer")
    @ApiResponse(responseCode = "201", description = "Account created successfully")
    @ApiResponse(responseCode = "400", description = "Invalid request data")
    public ResponseEntity<AccountResponse> createAccount(
            @Valid @RequestBody AccountCreateRequest request) {
        log.info("Creating new account for customer: {}", request.getCustomerId());
        AccountResponse account = accountService.createAccount(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(account);
    }

    @GetMapping("/{accountId}")
    @Operation(summary = "Get account details", description = "Retrieves account information by ID")
    @ApiResponse(responseCode = "200", description = "Account found")
    @ApiResponse(responseCode = "404", description = "Account not found")
    public ResponseEntity<AccountResponse> getAccount(
            @Parameter(description = "Account ID") @PathVariable String accountId) {
        log.info("Retrieving account: {}", accountId);
        AccountResponse account = accountService.findById(accountId);
        return ResponseEntity.ok(account);
    }

    @GetMapping("/customer/{customerId}")
    @Operation(summary = "Get customer accounts", description = "Retrieves all accounts for a customer")
    @ApiResponse(responseCode = "200", description = "Accounts retrieved successfully")
    public ResponseEntity<List<AccountResponse>> getAccountsByCustomer(
            @Parameter(description = "Customer ID") @PathVariable String customerId) {
        log.info("Retrieving accounts for customer: {}", customerId);
        List<AccountResponse> accounts = accountService.findByCustomerId(customerId);
        return ResponseEntity.ok(accounts);
    }

    @PutMapping("/{accountId}")
    @Operation(summary = "Update account", description = "Updates account information")
    @ApiResponse(responseCode = "200", description = "Account updated successfully")
    @ApiResponse(responseCode = "404", description = "Account not found")
    public ResponseEntity<AccountResponse> updateAccount(
            @Parameter(description = "Account ID") @PathVariable String accountId,
            @Valid @RequestBody AccountUpdateRequest request) {
        log.info("Updating account: {}", accountId);
        AccountResponse account = accountService.updateAccount(accountId, request);
        return ResponseEntity.ok(account);
    }

    @GetMapping("/{accountId}/balance")
    @Operation(summary = "Get account balance", description = "Retrieves current account balance")
    @ApiResponse(responseCode = "200", description = "Balance retrieved successfully")
    @ApiResponse(responseCode = "404", description = "Account not found")
    public ResponseEntity<Map<String, Object>> getAccountBalance(
            @Parameter(description = "Account ID") @PathVariable String accountId) {
        log.info("Retrieving balance for account: {}", accountId);
        AccountResponse account = accountService.findById(accountId);
        BigDecimal balance = accountService.getBalance(accountId);

        Map<String, Object> balanceResponse = Map.of(
                "balance", balance,
                "currency", account.getCurrency()
        );

        return ResponseEntity.ok(balanceResponse);
    }

    @GetMapping("/{accountId}/exists")
    @Operation(summary = "Check if account exists", description = "Checks if an account exists by ID")
    @ApiResponse(responseCode = "200", description = "Account existence checked")
    public ResponseEntity<Map<String, Boolean>> accountExists(
            @Parameter(description = "Account ID") @PathVariable String accountId) {
        log.info("Checking if account exists: {}", accountId);
        boolean exists = accountService.existsById(accountId);
        return ResponseEntity.ok(Map.of("exists", exists));
    }

    @PutMapping("/{accountId}/balance")
    @Operation(summary = "Update account balance", description = "Updates account balance (used by transaction service)")
    @ApiResponse(responseCode = "200", description = "Balance updated successfully")
    @ApiResponse(responseCode = "404", description = "Account not found")
    public ResponseEntity<Void> updateAccountBalance(
            @Parameter(description = "Account ID") @PathVariable String accountId,
            @RequestBody Map<String, BigDecimal> balanceUpdate) {
        log.info("Updating balance for account: {} to {}", accountId, balanceUpdate.get("balance"));

        BigDecimal newBalance = balanceUpdate.get("balance");
        if (newBalance == null) {
            throw new IllegalArgumentException("Balance is required");
        }

        accountService.updateBalance(accountId, newBalance);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{accountId}/validate")
    @Operation(summary = "Validate account", description = "Validates account exists and is active")
    @ApiResponse(responseCode = "200", description = "Account validation result")
    public ResponseEntity<Map<String, Object>> validateAccount(
            @Parameter(description = "Account ID") @PathVariable String accountId) {
        log.info("Validating account: {}", accountId);

        try {
            AccountResponse account = accountService.findById(accountId);
            boolean isValid = account != null && "ACTIVE".equals(account.getStatus().toString());

            Map<String, Object> validationResult = Map.of(
                    "exists", true,
                    "isActive", isValid,
                    "accountType", account.getAccountType().toString(),
                    "currency", account.getCurrency()
            );

            return ResponseEntity.ok(validationResult);
        } catch (Exception e) {
            Map<String, Object> validationResult = Map.of(
                    "exists", false,
                    "isActive", false
            );
            return ResponseEntity.ok(validationResult);
        }
    }
}