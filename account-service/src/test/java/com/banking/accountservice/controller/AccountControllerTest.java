package com.banking.accountservice.controller;

import com.banking.accountservice.dto.AccountCreateRequest;
import com.banking.accountservice.dto.AccountResponse;
import com.banking.accountservice.dto.AccountUpdateRequest;
import com.banking.accountservice.entity.enums.AccountStatus;
import com.banking.accountservice.entity.enums.AccountType;
import com.banking.accountservice.exception.AccountNotFoundException;
import com.banking.accountservice.exception.CustomerNotFoundException;
import com.banking.accountservice.service.AccountService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
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
@ActiveProfiles("test")
class AccountControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private AccountService accountService;

    @Autowired
    private ObjectMapper objectMapper;

    private AccountResponse accountResponse;
    private AccountCreateRequest createRequest;
    private AccountUpdateRequest updateRequest;

    @BeforeEach
    void setUp() {
        accountResponse = AccountResponse.builder()
                .accountId("6894577fb75681ff9f6f2729")
                .customerId("customer123")
                .accountNumber("ACC123456789")
                .accountType(AccountType.SAVINGS)
                .balance(new BigDecimal("1000.00"))
                .currency("USD")
                .status(AccountStatus.ACTIVE)
                .createdAt(LocalDateTime.of(2025, 1, 15, 10, 30))
                .updatedAt(LocalDateTime.of(2025, 1, 15, 10, 30))
                .build();

        createRequest = AccountCreateRequest.builder()
                .customerId("customer123")
                .accountType(AccountType.SAVINGS)
                .currency("USD")
                .initialDeposit(new BigDecimal("1000.00"))
                .build();

        updateRequest = AccountUpdateRequest.builder()
                .status(AccountStatus.ACTIVE)
                .build();
    }

    @Test
    void createAccount_ShouldReturnCreated_WhenValidRequest() throws Exception {
        // Given
        when(accountService.createAccount(any(AccountCreateRequest.class)))
                .thenReturn(accountResponse);

        // When & Then
        mockMvc.perform(post("/api/v1/accounts")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.accountId").value("6894577fb75681ff9f6f2729"))
                .andExpect(jsonPath("$.customerId").value("customer123"))
                .andExpect(jsonPath("$.accountNumber").value("ACC123456789"))
                .andExpect(jsonPath("$.accountType").value("SAVINGS"))
                .andExpect(jsonPath("$.balance").value(1000.00))
                .andExpect(jsonPath("$.currency").value("USD"))
                .andExpect(jsonPath("$.status").value("ACTIVE"));
    }

    @Test
    void createAccount_ShouldReturnBadRequest_WhenInvalidRequest() throws Exception {
        // Given - invalid request with missing required fields
        AccountCreateRequest invalidRequest = AccountCreateRequest.builder()
                .customerId("")
                .accountType(null)
                .currency("")
                .initialDeposit(new BigDecimal("-100.00"))
                .build();

        // When & Then
        mockMvc.perform(post("/api/v1/accounts")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void createAccount_ShouldReturnNotFound_WhenCustomerNotExists() throws Exception {
        // Given
        when(accountService.createAccount(any(AccountCreateRequest.class)))
                .thenThrow(new CustomerNotFoundException("Customer not found: customer123"));

        // When & Then
        mockMvc.perform(post("/api/v1/accounts")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createRequest)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error").value("Customer Not Found"))
                .andExpect(jsonPath("$.message").value("Customer not found: customer123"));
    }

    @Test
    void getAccount_ShouldReturnAccount_WhenAccountExists() throws Exception {
        // Given
        String accountId = "6894577fb75681ff9f6f2729";
        when(accountService.findById(accountId)).thenReturn(accountResponse);

        // When & Then
        mockMvc.perform(get("/api/v1/accounts/{accountId}", accountId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accountId").value(accountId))
                .andExpect(jsonPath("$.customerId").value("customer123"))
                .andExpect(jsonPath("$.accountNumber").value("ACC123456789"))
                .andExpect(jsonPath("$.balance").value(1000.00));
    }

    @Test
    void getAccount_ShouldReturnNotFound_WhenAccountNotExists() throws Exception {
        // Given
        String accountId = "nonexistent";
        when(accountService.findById(accountId))
                .thenThrow(new AccountNotFoundException("Account not found: " + accountId));

        // When & Then
        mockMvc.perform(get("/api/v1/accounts/{accountId}", accountId))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error").value("Account Not Found"))
                .andExpect(jsonPath("$.message").value("Account not found: nonexistent"));
    }

    @Test
    void getAccountsByCustomer_ShouldReturnAccountList_WhenCustomerHasAccounts() throws Exception {
        // Given
        String customerId = "customer123";
        AccountResponse secondAccount = AccountResponse.builder()
                .accountId("account2")
                .customerId("customer123")
                .accountNumber("ACC987654321")
                .accountType(AccountType.CHECKING)
                .balance(new BigDecimal("500.00"))
                .currency("USD")
                .status(AccountStatus.ACTIVE)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        List<AccountResponse> accounts = Arrays.asList(accountResponse, secondAccount);
        when(accountService.findByCustomerId(customerId)).thenReturn(accounts);

        // When & Then
        mockMvc.perform(get("/api/v1/accounts/customer/{customerId}", customerId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].accountId").value("6894577fb75681ff9f6f2729"))
                .andExpect(jsonPath("$[0].accountType").value("SAVINGS"))
                .andExpect(jsonPath("$[1].accountId").value("account2"))
                .andExpect(jsonPath("$[1].accountType").value("CHECKING"));
    }

    @Test
    void getAccountsByCustomer_ShouldReturnEmptyList_WhenCustomerHasNoAccounts() throws Exception {
        // Given
        String customerId = "customer-no-accounts";
        when(accountService.findByCustomerId(customerId)).thenReturn(Arrays.asList());

        // When & Then
        mockMvc.perform(get("/api/v1/accounts/customer/{customerId}", customerId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    void updateAccount_ShouldReturnUpdatedAccount_WhenValidRequest() throws Exception {
        // Given
        String accountId = "6894577fb75681ff9f6f2729";
        AccountResponse updatedResponse = AccountResponse.builder()
                .accountId(accountId)
                .customerId("customer123")
                .accountNumber("ACC123456789")
                .accountType(AccountType.SAVINGS)
                .balance(new BigDecimal("1000.00"))
                .currency("USD")
                .status(AccountStatus.BLOCKED)
                .createdAt(LocalDateTime.of(2025, 1, 15, 10, 30))
                .updatedAt(LocalDateTime.now())
                .build();

        AccountUpdateRequest updateRequest = AccountUpdateRequest.builder()
                .status(AccountStatus.BLOCKED)
                .build();

        when(accountService.updateAccount(anyString(), any(AccountUpdateRequest.class)))
                .thenReturn(updatedResponse);

        // When & Then
        mockMvc.perform(put("/api/v1/accounts/{accountId}", accountId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accountId").value(accountId))
                .andExpect(jsonPath("$.status").value("BLOCKED"));
    }

    @Test
    void updateAccount_ShouldReturnUpdatedAccount_WhenUpdatingCurrency() throws Exception {
        // Given
        String accountId = "6894577fb75681ff9f6f2729";
        AccountResponse updatedResponse = AccountResponse.builder()
                .accountId(accountId)
                .customerId("customer123")
                .accountNumber("ACC123456789")
                .accountType(AccountType.SAVINGS)
                .balance(new BigDecimal("1000.00"))
                .currency("EUR")
                .status(AccountStatus.ACTIVE)
                .createdAt(LocalDateTime.of(2025, 1, 15, 10, 30))
                .updatedAt(LocalDateTime.now())
                .build();

        AccountUpdateRequest updateRequest = AccountUpdateRequest.builder()
                .currency("EUR")
                .build();

        when(accountService.updateAccount(anyString(), any(AccountUpdateRequest.class)))
                .thenReturn(updatedResponse);

        // When & Then
        mockMvc.perform(put("/api/v1/accounts/{accountId}", accountId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accountId").value(accountId))
                .andExpect(jsonPath("$.currency").value("EUR"));
    }

    @Test
    void updateAccount_ShouldReturnUpdatedAccount_WhenUpdatingStatusAndCurrency() throws Exception {
        // Given
        String accountId = "6894577fb75681ff9f6f2729";
        AccountResponse updatedResponse = AccountResponse.builder()
                .accountId(accountId)
                .customerId("customer123")
                .accountNumber("ACC123456789")
                .accountType(AccountType.SAVINGS)
                .balance(new BigDecimal("1000.00"))
                .currency("GBP")
                .status(AccountStatus.INACTIVE)
                .createdAt(LocalDateTime.of(2025, 1, 15, 10, 30))
                .updatedAt(LocalDateTime.now())
                .build();

        AccountUpdateRequest updateRequest = AccountUpdateRequest.builder()
                .status(AccountStatus.INACTIVE)
                .currency("GBP")
                .build();

        when(accountService.updateAccount(anyString(), any(AccountUpdateRequest.class)))
                .thenReturn(updatedResponse);

        // When & Then
        mockMvc.perform(put("/api/v1/accounts/{accountId}", accountId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accountId").value(accountId))
                .andExpect(jsonPath("$.status").value("INACTIVE"))
                .andExpect(jsonPath("$.currency").value("GBP"));
    }

    @Test
    void updateAccount_ShouldReturnNotFound_WhenAccountNotExists() throws Exception {
        // Given
        String accountId = "nonexistent";
        when(accountService.updateAccount(anyString(), any(AccountUpdateRequest.class)))
                .thenThrow(new AccountNotFoundException("Account not found: " + accountId));

        // When & Then
        mockMvc.perform(put("/api/v1/accounts/{accountId}", accountId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error").value("Account Not Found"));
    }

    @Test
    void getAccountBalance_ShouldReturnBalance_WhenAccountExists() throws Exception {
        // Given
        String accountId = "6894577fb75681ff9f6f2729";
        BigDecimal balance = new BigDecimal("1000.00");
        when(accountService.findById(accountId)).thenReturn(accountResponse);
        when(accountService.getBalance(accountId)).thenReturn(balance);

        // When & Then
        mockMvc.perform(get("/api/v1/accounts/{accountId}/balance", accountId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.balance").value(1000.00))
                .andExpect(jsonPath("$.currency").value("USD"));
    }

    @Test
    void getAccountBalance_ShouldReturnNotFound_WhenAccountNotExists() throws Exception {
        // Given
        String accountId = "nonexistent";
        when(accountService.getBalance(accountId))
                .thenThrow(new AccountNotFoundException("Account not found: " + accountId));

        // When & Then
        mockMvc.perform(get("/api/v1/accounts/{accountId}/balance", accountId))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error").value("Account Not Found"));
    }
}