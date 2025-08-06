package com.banking.accountservice.service;

import com.banking.accountservice.dto.AccountCreateRequest;
import com.banking.accountservice.dto.AccountResponse;
import com.banking.accountservice.dto.AccountUpdateRequest;
import com.banking.accountservice.exception.AccountNotFoundException;
import com.banking.accountservice.model.entity.Account;
import com.banking.accountservice.model.entity.Customer;
import com.banking.accountservice.repository.AccountRepository;
import com.banking.accountservice.util.AccountNumberGenerator;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AccountServiceTest {

    @Mock
    private AccountRepository accountRepository;

    @Mock
    private CustomerService customerService;

    @Mock
    private AccountNumberGenerator accountNumberGenerator;

    @InjectMocks
    private AccountService accountService;

    private Account testAccount;
    private Customer testCustomer;
    private AccountCreateRequest createRequest;

    @BeforeEach
    void setUp() {
        testCustomer = Customer.builder()
                .customerId("customer123")
                .firstName("John")
                .lastName("Doe")
                .email("john.doe@example.com")
                .phoneNumber("+1234567890")
                .createdAt(LocalDateTime.now())
                .build();

        testAccount = Account.builder()
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
    void findById_WhenAccountExists_ShouldReturnAccount() {
        // Given
        when(accountRepository.findById("account123")).thenReturn(Optional.of(testAccount));

        // When
        AccountResponse result = accountService.findById("account123");

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getAccountId()).isEqualTo("account123");
        assertThat(result.getCustomerId()).isEqualTo("customer123");
        assertThat(result.getAccountNumber()).isEqualTo("ACC123456789");
        assertThat(result.getBalance()).isEqualTo(new BigDecimal("1000.00"));

        verify(accountRepository).findById("account123");
    }

    @Test
    void findById_WhenAccountDoesNotExist_ShouldThrowException() {
        // Given
        when(accountRepository.findById("nonexistent")).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> accountService.findById("nonexistent"))
                .isInstanceOf(AccountNotFoundException.class)
                .hasMessage("Account not found with ID: nonexistent");

        verify(accountRepository).findById("nonexistent");
    }

    @Test
    void findByCustomerId_WhenCustomerExists_ShouldReturnAccounts() {
        // Given
        List<Account> accounts = Arrays.asList(testAccount);
        when(customerService.findById("customer123")).thenReturn(testCustomer);
        when(accountRepository.findByCustomerId("customer123")).thenReturn(accounts);

        // When
        List<AccountResponse> result = accountService.findByCustomerId("customer123");

        // Then
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getAccountId()).isEqualTo("account123");

        verify(customerService).findById("customer123");
        verify(accountRepository).findByCustomerId("customer123");
    }

    @Test
    void createAccount_WithValidRequest_ShouldCreateAccount() {
        // Given
        when(customerService.findById("customer123")).thenReturn(testCustomer);
        when(accountNumberGenerator.generateAccountNumber()).thenReturn("ACC123456789");
        when(accountRepository.existsByAccountNumber("ACC123456789")).thenReturn(false);
        when(accountRepository.save(any(Account.class))).thenReturn(testAccount);

        // When
        AccountResponse result = accountService.createAccount(createRequest);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getAccountId()).isEqualTo("account123");
        assertThat(result.getCustomerId()).isEqualTo("customer123");
        assertThat(result.getAccountNumber()).isEqualTo("ACC123456789");

        verify(customerService).findById("customer123");
        verify(accountNumberGenerator).generateAccountNumber();
        verify(accountRepository).existsByAccountNumber("ACC123456789");
        verify(accountRepository).save(any(Account.class));
    }

    @Test
    void updateAccount_WithValidRequest_ShouldUpdateAccount() {
        // Given
        AccountUpdateRequest updateRequest = new AccountUpdateRequest();
        updateRequest.setStatus(Account.AccountStatus.INACTIVE);

        when(accountRepository.findById("account123")).thenReturn(Optional.of(testAccount));
        when(accountRepository.save(any(Account.class))).thenReturn(testAccount);

        // When
        AccountResponse result = accountService.updateAccount("account123", updateRequest);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getAccountId()).isEqualTo("account123");

        verify(accountRepository).findById("account123");
        verify(accountRepository).save(any(Account.class));
    }

    @Test
    void getBalance_WhenAccountExists_ShouldReturnBalance() {
        // Given
        when(accountRepository.findById("account123")).thenReturn(Optional.of(testAccount));

        // When
        BigDecimal balance = accountService.getBalance("account123");

        // Then
        assertThat(balance).isEqualTo(new BigDecimal("1000.00"));

        verify(accountRepository).findById("account123");
    }

    @Test
    void updateBalance_WhenAccountExists_ShouldUpdateBalance() {
        // Given
        BigDecimal newBalance = new BigDecimal("1500.00");
        when(accountRepository.findById("account123")).thenReturn(Optional.of(testAccount));
        when(accountRepository.save(any(Account.class))).thenReturn(testAccount);

        // When
        accountService.updateBalance("account123", newBalance);

        // Then
        verify(accountRepository).findById("account123");
        verify(accountRepository).save(any(Account.class));
    }
}