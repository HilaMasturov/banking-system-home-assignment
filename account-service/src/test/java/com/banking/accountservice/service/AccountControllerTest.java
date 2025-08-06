package com.banking.accountservice.service;
import com.banking.accountservice.controller.AccountController;
import com.banking.accountservice.dto.AccountCreateRequest;
import com.banking.accountservice.dto.AccountResponse;
import com.banking.accountservice.dto.AccountUpdateRequest;
import com.banking.accountservice.model.entity.Account;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AccountController.class)
class AccountControllerTest {

    @TestConfiguration
    static class TestConfig {
        @Bean
        @Primary
        public AccountService accountService() {
            return Mockito.mock(AccountService.class);
        }
    }

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private AccountService accountService;

    private AccountResponse testAccountResponse;
    private AccountCreateRequest createRequest;

    @BeforeEach
    void setUp() {
        Mockito.reset(accountService);

        testAccountResponse = AccountResponse.builder()
                .accountId("account123")
                .customerId("customer123")
                .accountNumber("ACC123456789")
                .accountType(Account.AccountType.SAVINGS)
                .balance(new BigDecimal("1000.00"))
                .currency("USD")
                .status(Account.AccountStatus.ACTIVE)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        createRequest = new AccountCreateRequest();
        createRequest.setCustomerId("customer123");
        createRequest.setAccountType(Account.AccountType.SAVINGS);
        createRequest.setInitialDeposit(new BigDecimal("500.00"));
        createRequest.setCurrency("USD");
    }

    @Test
    void createAccount_WithValidRequest_ShouldReturnCreated() throws Exception {
        // Given
        when(accountService.createAccount(any(AccountCreateRequest.class)))
                .thenReturn(testAccountResponse);

        // When & Then
        mockMvc.perform(post("/api/v1/accounts")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.accountId").value("account123"))
                .andExpect(jsonPath("$.customerId").value("customer123"))
                .andExpect(jsonPath("$.accountNumber").value("ACC123456789"))
                .andExpect(jsonPath("$.balance").value(1000.00));
    }

    @Test
    void getAccount_WithValidId_ShouldReturnAccount() throws Exception {
        // Given
        when(accountService.findById("account123")).thenReturn(testAccountResponse);

        // When & Then
        mockMvc.perform(get("/api/v1/accounts/account123"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accountId").value("account123"))
                .andExpect(jsonPath("$.customerId").value("customer123"))
                .andExpect(jsonPath("$.accountNumber").value("ACC123456789"));
    }

    @Test
    void getAccountsByCustomer_WithValidCustomerId_ShouldReturnAccounts() throws Exception {
        // Given
        List<AccountResponse> accounts = Arrays.asList(testAccountResponse);
        when(accountService.findByCustomerId("customer123")).thenReturn(accounts);

        // When & Then
        mockMvc.perform(get("/api/v1/accounts/customer/customer123"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].accountId").value("account123"));
    }

    @Test
    void updateAccount_WithValidRequest_ShouldReturnUpdatedAccount() throws Exception {
        // Given
        AccountUpdateRequest updateRequest = new AccountUpdateRequest();
        updateRequest.setStatus(Account.AccountStatus.INACTIVE);

        when(accountService.updateAccount(anyString(), any(AccountUpdateRequest.class)))
                .thenReturn(testAccountResponse);

        // When & Then
        mockMvc.perform(put("/api/v1/accounts/account123")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accountId").value("account123"));
    }

    @Test
    void getAccountBalance_WithValidId_ShouldReturnBalance() throws Exception {
        // Given
        when(accountService.getBalance("account123")).thenReturn(new BigDecimal("1000.00"));

        // When & Then
        mockMvc.perform(get("/api/v1/accounts/account123/balance"))
                .andExpect(status().isOk())
                .andExpect(content().string("1000.00"));
    }
}