package com.banking.transactionservice.controller;

import com.banking.transactionservice.dto.DepositRequestDto;
import com.banking.transactionservice.dto.TransactionResponseDto;
import com.banking.transactionservice.dto.TransferRequestDto;
import com.banking.transactionservice.dto.WithdrawRequestDto;
import com.banking.transactionservice.service.TransactionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/v1/transactions")
@RequiredArgsConstructor
@Validated
@Tag(name = "Transaction Management", description = "APIs for managing banking transactions")
public class TransactionController {

    private final TransactionService transactionService;

    @PostMapping("/deposit")
    @Operation(summary = "Deposit money to account")
    public ResponseEntity<TransactionResponseDto> deposit(@Valid @RequestBody DepositRequestDto request) {
        log.info("Received deposit request for account: {}", request.getAccountId());
        TransactionResponseDto response = transactionService.deposit(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PostMapping("/withdraw")
    @Operation(summary = "Withdraw money from account")
    public ResponseEntity<TransactionResponseDto> withdraw(@Valid @RequestBody WithdrawRequestDto request) {
        log.info("Received withdrawal request for account: {}", request.getAccountId());
        TransactionResponseDto response = transactionService.withdraw(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PostMapping("/transfer")
    @Operation(summary = "Transfer money between accounts")
    public ResponseEntity<TransactionResponseDto> transfer(@Valid @RequestBody TransferRequestDto request) {
        log.info("Received transfer request from account: {} to account: {}",
                request.getFromAccountId(), request.getToAccountId());
        TransactionResponseDto response = transactionService.transfer(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/account/{accountId}")
    @Operation(summary = "Get transaction history for account")
    public ResponseEntity<Page<TransactionResponseDto>> getTransactionHistory(
            @Parameter(description = "Account ID") @PathVariable String accountId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {

        log.info("Fetching transaction history for account: {}", accountId);

        Sort.Direction direction = sortDir.equalsIgnoreCase("asc") ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));

        Page<TransactionResponseDto> transactions = transactionService.getTransactionsByAccountId(accountId, pageable);
        return ResponseEntity.ok(transactions);
    }

    @GetMapping("/{transactionId}")
    @Operation(summary = "Get transaction details by ID")
    public ResponseEntity<TransactionResponseDto> getTransactionById(
            @Parameter(description = "Transaction ID") @PathVariable String transactionId) {

        log.info("Fetching transaction details for ID: {}", transactionId);
        TransactionResponseDto response = transactionService.getTransactionById(transactionId);
        return ResponseEntity.ok(response);
    }
}