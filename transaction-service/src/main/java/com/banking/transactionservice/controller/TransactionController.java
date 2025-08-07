package com.banking.transactionservice.controller;

import com.banking.transactionservice.dto.DepositRequestDto;
import com.banking.transactionservice.dto.TransactionResponseDto;
import com.banking.transactionservice.dto.TransferRequestDto;
import com.banking.transactionservice.dto.WithdrawRequestDto;
import com.banking.transactionservice.service.TransactionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
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
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/transactions")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Transaction Management", description = "APIs for processing transactions")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class TransactionController {

    private final TransactionService transactionService;

    @PostMapping("/deposit")
    @Operation(summary = "Deposit money", description = "Deposits money into an account")
    @ApiResponse(responseCode = "201", description = "Deposit processed successfully")
    @ApiResponse(responseCode = "400", description = "Invalid deposit request")
    @ApiResponse(responseCode = "404", description = "Account not found")
    public ResponseEntity<TransactionResponseDto> deposit(
            @Valid @RequestBody DepositRequestDto request) {
        log.info("Processing deposit of {} {} to account: {}",
                request.getAmount(), request.getCurrency(), request.getAccountId());
        TransactionResponseDto transaction = transactionService.deposit(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(transaction);
    }

    @PostMapping("/withdraw")
    @Operation(summary = "Withdraw money", description = "Withdraws money from an account")
    @ApiResponse(responseCode = "201", description = "Withdrawal processed successfully")
    @ApiResponse(responseCode = "400", description = "Invalid withdrawal request or insufficient funds")
    @ApiResponse(responseCode = "404", description = "Account not found")
    public ResponseEntity<TransactionResponseDto> withdraw(
            @Valid @RequestBody WithdrawRequestDto request) {
        log.info("Processing withdrawal of {} {} from account: {}",
                request.getAmount(), request.getCurrency(), request.getAccountId());
        TransactionResponseDto transaction = transactionService.withdraw(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(transaction);
    }

    @PostMapping("/transfer")
    @Operation(summary = "Transfer money", description = "Transfers money between accounts")
    @ApiResponse(responseCode = "201", description = "Transfer processed successfully")
    @ApiResponse(responseCode = "400", description = "Invalid transfer request or insufficient funds")
    @ApiResponse(responseCode = "404", description = "Account not found")
    public ResponseEntity<TransactionResponseDto> transfer(
            @Valid @RequestBody TransferRequestDto request) {
        log.info("Processing transfer of {} {} from account: {} to account: {}",
                request.getAmount(), request.getCurrency(),
                request.getFromAccountId(), request.getToAccountId());
        TransactionResponseDto transaction = transactionService.transfer(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(transaction);
    }

    @GetMapping("/account/{accountId}")
    @Operation(summary = "Get transaction history", description = "Retrieves paginated transaction history for an account")
    @ApiResponse(responseCode = "200", description = "Transaction history retrieved successfully")
    @ApiResponse(responseCode = "404", description = "Account not found")
    public ResponseEntity<List<TransactionResponseDto>> getTransactionHistory(
            @Parameter(description = "Account ID") @PathVariable String accountId,
            @Parameter(description = "Page number") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "20") int size,
            @Parameter(description = "Sort by field") @RequestParam(defaultValue = "createdAt") String sortBy,
            @Parameter(description = "Sort direction") @RequestParam(defaultValue = "desc") String sortDirection) {

        log.info("Retrieving transaction history for account: {}, page: {}, size: {}",
                accountId, page, size);

        Sort sort = Sort.by(Sort.Direction.fromString(sortDirection), sortBy);
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<TransactionResponseDto> transactionPage = transactionService.getTransactionsByAccountId(accountId, pageable);

        // Return the content as a list for simplicity with frontend
        // In production, you might want to return the full Page object with metadata
        return ResponseEntity.ok(transactionPage.getContent());
    }

    @GetMapping("/account/{accountId}/paginated")
    @Operation(summary = "Get paginated transaction history", description = "Retrieves paginated transaction history with metadata")
    @ApiResponse(responseCode = "200", description = "Transaction history retrieved successfully")
    public ResponseEntity<Page<TransactionResponseDto>> getPaginatedTransactionHistory(
            @Parameter(description = "Account ID") @PathVariable String accountId,
            @Parameter(description = "Page number") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "20") int size,
            @Parameter(description = "Sort by field") @RequestParam(defaultValue = "createdAt") String sortBy,
            @Parameter(description = "Sort direction") @RequestParam(defaultValue = "desc") String sortDirection) {

        log.info("Retrieving paginated transaction history for account: {}, page: {}, size: {}",
                accountId, page, size);

        Sort sort = Sort.by(Sort.Direction.fromString(sortDirection), sortBy);
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<TransactionResponseDto> transactionPage = transactionService.getTransactionsByAccountId(accountId, pageable);
        return ResponseEntity.ok(transactionPage);
    }

    @GetMapping("/{transactionId}")
    @Operation(summary = "Get transaction details", description = "Retrieves details of a specific transaction")
    @ApiResponse(responseCode = "200", description = "Transaction found")
    @ApiResponse(responseCode = "404", description = "Transaction not found")
    public ResponseEntity<TransactionResponseDto> getTransaction(
            @Parameter(description = "Transaction ID") @PathVariable String transactionId) {
        log.info("Retrieving transaction: {}", transactionId);
        TransactionResponseDto transaction = transactionService.getTransactionById(transactionId);
        return ResponseEntity.ok(transaction);
    }
}