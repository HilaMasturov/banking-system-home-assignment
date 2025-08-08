package com.banking.transactionservice.controller;

import com.banking.transactionservice.dto.DepositRequestDto;
import com.banking.transactionservice.dto.TransactionResponseDto;
import com.banking.transactionservice.dto.TransferRequestDto;
import com.banking.transactionservice.dto.WithdrawRequestDto;
import com.banking.transactionservice.entity.enums.TransactionStatus;
import com.banking.transactionservice.entity.enums.TransactionType;
import com.banking.transactionservice.exception.AccountNotFoundException;
import com.banking.transactionservice.exception.InsufficientFundsException;
import com.banking.transactionservice.exception.TransactionNotFoundException;
import com.banking.transactionservice.service.TransactionService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.data.domain.PageImpl;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(TransactionController.class)
class TransactionControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private TransactionService transactionService;

    @Autowired
    private ObjectMapper objectMapper;

    private TransactionResponseDto transactionResponse;

    @BeforeEach
    void setUp() {
        transactionResponse = TransactionResponseDto.builder()
                .transactionId("txn1")
                .toAccountId("account1")
                .amount(new BigDecimal("1000.00"))
                .currency("USD")
                .type(TransactionType.DEPOSIT)
                .status(TransactionStatus.COMPLETED)
                .description("Initial deposit")
                .createdAt(LocalDateTime.of(2025, 1, 15, 12, 0))
                .build();
    }

    @Test
    void deposit_ShouldReturnCreated_WhenValidRequest() throws Exception {
        // Given
        DepositRequestDto request = new DepositRequestDto();
        request.setAccountId("account1");
        request.setAmount(new BigDecimal("1000.00"));
        request.setCurrency("USD");
        request.setDescription("Initial deposit");

        when(transactionService.deposit(any(DepositRequestDto.class))).thenReturn(transactionResponse);

        // When & Then
        mockMvc.perform(post("/api/v1/transactions/deposit")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.transactionId").value("txn1"))
                .andExpect(jsonPath("$.amount").value(1000.00))
                .andExpect(jsonPath("$.type").value("DEPOSIT"))
                .andExpect(jsonPath("$.status").value("COMPLETED"))
                .andExpect(jsonPath("$.description").value("Initial deposit"));
    }

    @Test
    void deposit_ShouldReturnBadRequest_WhenInvalidAmount() throws Exception {
        // Given
        DepositRequestDto request = new DepositRequestDto();
        request.setAccountId("account1");
        request.setAmount(new BigDecimal("-100.00"));
        request.setCurrency("USD");

        // When & Then
        mockMvc.perform(post("/api/v1/transactions/deposit")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void withdraw_ShouldReturnCreated_WhenValidRequest() throws Exception {
        // Given
        WithdrawRequestDto request = new WithdrawRequestDto();
        request.setAccountId("account1");
        request.setAmount(new BigDecimal("500.00"));
        request.setCurrency("USD");

        TransactionResponseDto withdrawResponse = TransactionResponseDto.builder()
                .transactionId("txn2")
                .fromAccountId("account1")
                .amount(new BigDecimal("500.00"))
                .currency("USD")
                .type(TransactionType.WITHDRAWAL)
                .status(TransactionStatus.COMPLETED)
                .description("Withdrawal")
                .createdAt(LocalDateTime.now())
                .build();

        when(transactionService.withdraw(any(WithdrawRequestDto.class))).thenReturn(withdrawResponse);

        // When & Then
        mockMvc.perform(post("/api/v1/transactions/withdraw")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.transactionId").value("txn2"))
                .andExpect(jsonPath("$.type").value("WITHDRAWAL"))
                .andExpect(jsonPath("$.amount").value(500.00));
    }

    @Test
    void withdraw_ShouldReturnBadRequest_WhenInsufficientFunds() throws Exception {
        // Given
        WithdrawRequestDto request = new WithdrawRequestDto();
        request.setAccountId("account1");
        request.setAmount(new BigDecimal("2000.00"));
        request.setCurrency("USD");

        when(transactionService.withdraw(any(WithdrawRequestDto.class)))
                .thenThrow(new InsufficientFundsException("Insufficient funds for withdrawal"));

        // When & Then
        mockMvc.perform(post("/api/v1/transactions/withdraw")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Insufficient Funds"))
                .andExpect(jsonPath("$.message").value("Insufficient funds for withdrawal"));
    }

    @Test
    void transfer_ShouldReturnCreated_WhenValidRequest() throws Exception {
        // Given
        TransferRequestDto request = new TransferRequestDto();
        request.setFromAccountId("account1");
        request.setToAccountId("account2");
        request.setAmount(new BigDecimal("300.00"));
        request.setCurrency("USD");
        request.setDescription("Transfer to friend");

        TransactionResponseDto transferResponse = TransactionResponseDto.builder()
                .transactionId("txn3")
                .fromAccountId("account1")
                .toAccountId("account2")
                .amount(new BigDecimal("300.00"))
                .currency("USD")
                .type(TransactionType.TRANSFER)
                .status(TransactionStatus.COMPLETED)
                .description("Transfer to friend")
                .createdAt(LocalDateTime.now())
                .build();

        when(transactionService.transfer(any(TransferRequestDto.class))).thenReturn(transferResponse);

        // When & Then
        mockMvc.perform(post("/api/v1/transactions/transfer")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.transactionId").value("txn3"))
                .andExpect(jsonPath("$.type").value("TRANSFER"))
                .andExpect(jsonPath("$.fromAccountId").value("account1"))
                .andExpect(jsonPath("$.toAccountId").value("account2"))
                .andExpect(jsonPath("$.amount").value(300.00));
    }

    @Test
    void transfer_ShouldReturnNotFound_WhenAccountNotExists() throws Exception {
        // Given
        TransferRequestDto request = new TransferRequestDto();
        request.setFromAccountId("nonexistent");
        request.setToAccountId("account2");
        request.setAmount(new BigDecimal("300.00"));
        request.setCurrency("USD");

        when(transactionService.transfer(any(TransferRequestDto.class)))
                .thenThrow(new AccountNotFoundException("Account not found: nonexistent"));

        // When & Then
        mockMvc.perform(post("/api/v1/transactions/transfer")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error").value("Account Not Found"))
                .andExpect(jsonPath("$.message").value("Account not found: nonexistent"));
    }

    @Test
    void getTransactionHistory_ShouldReturnPagedTransactions() throws Exception {
        // Given
        String accountId = "account1";
        PageImpl<TransactionResponseDto> page = new PageImpl<>(List.of(transactionResponse));

        when(transactionService.getTransactionsByAccountId(anyString(), any()))
                .thenReturn(page);

        // When & Then
        mockMvc.perform(get("/api/v1/transactions/account/{accountId}", accountId)
                        .param("page", "0")
                        .param("size", "10")
                        .param("sortBy", "createdAt")
                        .param("sortDir", "desc"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].transactionId").value("txn1"))
                .andExpect(jsonPath("$[0].amount").value(1000.00));
    }

    @Test
    void getTransactionHistory_ShouldReturnEmptyPage_WhenNoTransactions() throws Exception {
        // Given
        String accountId = "account-empty";
        PageImpl<TransactionResponseDto> emptyPage = new PageImpl<>(List.of());

        when(transactionService.getTransactionsByAccountId(anyString(), any()))
                .thenReturn(emptyPage);

        // When & Then
        mockMvc.perform(get("/api/v1/transactions/account/{accountId}", accountId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isEmpty());
    }

    @Test
    void getTransactionById_ShouldReturnTransaction_WhenExists() throws Exception {
        // Given
        String transactionId = "txn1";
        when(transactionService.getTransactionById(transactionId)).thenReturn(transactionResponse);

        // When & Then
        mockMvc.perform(get("/api/v1/transactions/{transactionId}", transactionId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.transactionId").value("txn1"))
                .andExpect(jsonPath("$.amount").value(1000.00))
                .andExpect(jsonPath("$.type").value("DEPOSIT"))
                .andExpect(jsonPath("$.status").value("COMPLETED"));
    }

    @Test
    void getTransactionById_ShouldReturnNotFound_WhenTransactionNotExists() throws Exception {
        // Given
        String transactionId = "nonexistent";
        when(transactionService.getTransactionById(transactionId))
                .thenThrow(new TransactionNotFoundException("Transaction not found: " + transactionId));

        // When & Then
        mockMvc.perform(get("/api/v1/transactions/{transactionId}", transactionId))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error").value("Transaction Not Found"))
                .andExpect(jsonPath("$.message").value("Transaction not found: nonexistent"));
    }

    @Test
    void deposit_ShouldReturnNotFound_WhenAccountNotExists() throws Exception {
        // Given
        DepositRequestDto request = new DepositRequestDto();
        request.setAccountId("nonexistent");
        request.setAmount(new BigDecimal("1000.00"));
        request.setCurrency("USD");

        when(transactionService.deposit(any(DepositRequestDto.class)))
                .thenThrow(new AccountNotFoundException("Account not found: nonexistent"));

        // When & Then
        mockMvc.perform(post("/api/v1/transactions/deposit")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error").value("Account Not Found"));
    }

    @Test
    void withdraw_ShouldReturnNotFound_WhenAccountNotExists() throws Exception {
        // Given
        WithdrawRequestDto request = new WithdrawRequestDto();
        request.setAccountId("nonexistent");
        request.setAmount(new BigDecimal("500.00"));
        request.setCurrency("USD");

        when(transactionService.withdraw(any(WithdrawRequestDto.class)))
                .thenThrow(new AccountNotFoundException("Account not found: nonexistent"));

        // When & Then
        mockMvc.perform(post("/api/v1/transactions/withdraw")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error").value("Account Not Found"));
    }

    @Test
    void allEndpoints_ShouldHandleInternalServerError() throws Exception {
        // Given
        DepositRequestDto request = new DepositRequestDto();
        request.setAccountId("account1");
        request.setAmount(new BigDecimal("1000.00"));
        request.setCurrency("USD");

        when(transactionService.deposit(any(DepositRequestDto.class)))
                .thenThrow(new RuntimeException("Database connection failed"));

        // When & Then
        mockMvc.perform(post("/api/v1/transactions/deposit")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.error").value("Internal Server Error"))
                .andExpect(jsonPath("$.status").value(500));
    }




}