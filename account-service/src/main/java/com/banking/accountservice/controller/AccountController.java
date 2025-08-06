package com.banking.accountservice.controller;

import com.banking.accountservice.dto.AccountCreateRequest;
import com.banking.accountservice.dto.AccountResponse;
import com.banking.accountservice.dto.AccountUpdateRequest;
import com.banking.accountservice.service.AccountService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.math.BigDecimal;
import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/v1/accounts")
@RequiredArgsConstructor
@Tag(name = "Account Management", description = "Operations for managing bank accounts")
public class AccountController {

    private final AccountService accountService;

    @Operation(summary = "Create a new account")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Account created successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid request data"),
            @ApiResponse(responseCode = "404", description = "Customer not found")
    })
    @PostMapping
    public ResponseEntity<AccountResponse> createAccount(
            @Valid @RequestBody AccountCreateRequest request) {
        log.info("Creating account for customer: {}", request.getCustomerId());
        AccountResponse response = accountService.createAccount(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @Operation(summary = "Get account details by ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Account found"),
            @ApiResponse(responseCode = "404", description = "Account not found")
    })
    @GetMapping("/{accountId}")
    public ResponseEntity<AccountResponse> getAccount(
            @Parameter(description = "Account ID") @PathVariable String accountId) {
        log.info("Getting account details for ID: {}", accountId);
        AccountResponse response = accountService.findById(accountId);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Get all accounts for a customer")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Accounts found"),
            @ApiResponse(responseCode = "404", description = "Customer not found")
    })
    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<AccountResponse>> getAccountsByCustomer(
            @Parameter(description = "Customer ID") @PathVariable String customerId) {
        log.info("Getting accounts for customer: {}", customerId);
        List<AccountResponse> response = accountService.findByCustomerId(customerId);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Update account details")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Account updated successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid request data"),
            @ApiResponse(responseCode = "404", description = "Account not found")
    })
    @PutMapping("/{accountId}")
    public ResponseEntity<AccountResponse> updateAccount(
            @Parameter(description = "Account ID") @PathVariable String accountId,
            @Valid @RequestBody AccountUpdateRequest request) {
        log.info("Updating account: {}", accountId);
        AccountResponse response = accountService.updateAccount(accountId, request);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Get account balance")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Balance retrieved successfully"),
            @ApiResponse(responseCode = "404", description = "Account not found")
    })
    @GetMapping("/{accountId}/balance")
    public ResponseEntity<BigDecimal> getAccountBalance(
            @Parameter(description = "Account ID") @PathVariable String accountId) {
        log.info("Getting balance for account: {}", accountId);
        BigDecimal balance = accountService.getBalance(accountId);
        return ResponseEntity.ok(balance);
    }
}