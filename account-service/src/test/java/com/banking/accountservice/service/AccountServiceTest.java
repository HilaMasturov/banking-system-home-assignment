package com.banking.accountservice.service;

import com.banking.accountservice.dto.AccountCreateRequest;
import com.banking.accountservice.dto.AccountResponse;
import com.banking.accountservice.dto.AccountUpdateRequest;
import com.banking.accountservice.entity.Account;
import com.banking.accountservice.entity.Customer;
import com.banking.accountservice.entity.enums.AccountStatus;
import com.banking.accountservice.entity.enums.AccountType;
import com.banking.accountservice.exception.AccountNotFoundException;
import com.banking.accountservice.exception.CustomerNotFoundException;
import com.banking.accountservice.repository.AccountRepository;
import com.banking.accountservice.repository.CustomerRepository;
import com.banking.accountservice.service.impl.AccountServiceImpl;
import com.banking.accountservice.util.AccountMapper;
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
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AccountServiceTest {

    @Mock
    private AccountRepository accountRepository;

    @Mock
    private CustomerRepository customerRepository;

    @Mock
    private AccountMapper accountMapper;

    @InjectMocks
    private AccountServiceImpl accountService;

    private Customer customer;
    private Account account;
    private AccountCreateRequest createRequest;
    private AccountResponse accountResponse;

    @BeforeEach
    void setUp() {
        customer = Customer.builder()
                .customerId("customer123")
                .firstName("John")
                .lastName("Doe")
                .email("john.doe@example.com")
                .phoneNumber("+1234567890")
                .createdAt(LocalDateTime.now())
                .build();

        account = Account.builder()
                .accountId("6894577fb75681ff9f6f2729")
                .customerId("customer123")
                .accountNumber("ACC123456789")
                .accountType(AccountType.SAVINGS)
                .balance(new BigDecimal("1000.00"))
                .currency("USD")
                .status(AccountStatus.ACTIVE)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        createRequest = AccountCreateRequest.builder()
                .customerId("customer123")
                .accountType(AccountType.SAVINGS)
                .currency("USD")
                .initialDeposit(new BigDecimal("1000.00"))
                .build();

        accountResponse = AccountResponse.builder()
                .accountId("6894577fb75681ff9f6f2729")
                .customerId("customer123")
                .accountNumber("ACC123456789")
                .accountType(AccountType.SAVINGS)
                .balance(new BigDecimal("1000.00"))
                .currency("USD")
                .status(AccountStatus.ACTIVE)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
    }

    @Test
    void createAccount_ShouldCreateAccount_WhenCustomerExists() {
        // Given
        when(customerRepository.findById("customer123")).thenReturn(Optional.of(customer));
        when(accountMapper.toEntity(createRequest)).thenReturn(account);
        when(accountRepository.save(any(Account.class))).thenReturn(account); // Use any(Account.class)
        when(accountMapper.toResponse(account)).thenReturn(accountResponse);

        // When
        AccountResponse result = accountService.createAccount(createRequest);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getCustomerId()).isEqualTo("customer123");
        assertThat(result.getAccountType()).isEqualTo(AccountType.SAVINGS);
        assertThat(result.getBalance()).isEqualByComparingTo(new BigDecimal("1000.00"));

        verify(customerRepository).findById("customer123");
        verify(accountMapper).toEntity(createRequest);
        verify(accountRepository).save(any(Account.class)); // Use any(Account.class)
        verify(accountMapper).toResponse(account);
    }

    @Test
    void createAccount_ShouldThrowException_WhenCustomerNotFound() {
        // Given
        when(customerRepository.findById("customer123")).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> accountService.createAccount(createRequest))
                .isInstanceOf(CustomerNotFoundException.class)
                .hasMessage("Customer not found: customer123");

        verify(customerRepository).findById("customer123");
        verify(accountRepository, never()).save(any());
    }

    @Test
    void findById_ShouldReturnAccount_WhenAccountExists() {
        // Given
        when(accountRepository.findById("6894577fb75681ff9f6f2729")).thenReturn(Optional.of(account));
        when(accountMapper.toResponse(account)).thenReturn(accountResponse);

        // When
        AccountResponse result = accountService.findById("6894577fb75681ff9f6f2729");

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getAccountId()).isEqualTo("6894577fb75681ff9f6f2729");
        verify(accountRepository).findById("6894577fb75681ff9f6f2729");
        verify(accountMapper).toResponse(account);
    }

    @Test
    void findById_ShouldThrowException_WhenAccountNotFound() {
        // Given
        when(accountRepository.findById("nonexistent")).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> accountService.findById("nonexistent"))
                .isInstanceOf(AccountNotFoundException.class)
                .hasMessage("Account not found: nonexistent");
    }

    @Test
    void findByCustomerId_ShouldReturnAccountList_WhenAccountsExist() {
        // Given
        List<Account> accounts = Arrays.asList(account);
        when(accountRepository.findByCustomerId("customer123")).thenReturn(accounts);
        when(accountMapper.toResponse(account)).thenReturn(accountResponse);

        // When
        List<AccountResponse> result = accountService.findByCustomerId("customer123");

        // Then
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getCustomerId()).isEqualTo("customer123");
        verify(accountRepository).findByCustomerId("customer123");
        verify(accountMapper).toResponse(account);
    }

    @Test
    void updateAccount_ShouldUpdateAndReturnAccount_WhenAccountExists() {
        // Given
        AccountUpdateRequest updateRequest = AccountUpdateRequest.builder()
                .status(AccountStatus.BLOCKED)
                .build();

        Account updatedAccount = account.toBuilder()
                .status(AccountStatus.BLOCKED)
                .updatedAt(LocalDateTime.now())
                .build();

        AccountResponse updatedResponse = accountResponse.toBuilder()
                .status(AccountStatus.BLOCKED)
                .build();

        when(accountRepository.findById("6894577fb75681ff9f6f2729")).thenReturn(Optional.of(account));
        when(accountMapper.updateEntity(account, updateRequest)).thenReturn(updatedAccount);
        when(accountRepository.save(any(Account.class))).thenReturn(updatedAccount); // Use any(Account.class)
        when(accountMapper.toResponse(updatedAccount)).thenReturn(updatedResponse);

        // When
        AccountResponse result = accountService.updateAccount("6894577fb75681ff9f6f2729", updateRequest);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getStatus()).isEqualTo(AccountStatus.BLOCKED);
        verify(accountRepository).findById("6894577fb75681ff9f6f2729");
        verify(accountMapper).updateEntity(account, updateRequest);
        verify(accountRepository).save(any(Account.class)); // Use any(Account.class)
        verify(accountMapper).toResponse(updatedAccount);
    }

    @Test
    void updateAccount_ShouldThrowException_WhenAccountNotFound() {
        // Given
        AccountUpdateRequest updateRequest = AccountUpdateRequest.builder()
                .status(AccountStatus.BLOCKED)
                .build();

        when(accountRepository.findById("nonexistent")).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> accountService.updateAccount("nonexistent", updateRequest))
                .isInstanceOf(AccountNotFoundException.class)
                .hasMessage("Account not found: nonexistent");

        verify(accountRepository).findById("nonexistent");
        verify(accountRepository, never()).save(any());
    }

    @Test
    void getBalance_ShouldReturnBalance_WhenAccountExists() {
        // Given
        when(accountRepository.findById("6894577fb75681ff9f6f2729")).thenReturn(Optional.of(account));

        // When
        BigDecimal result = accountService.getBalance("6894577fb75681ff9f6f2729");

        // Then
        assertThat(result).isEqualByComparingTo(new BigDecimal("1000.00"));
        verify(accountRepository).findById("6894577fb75681ff9f6f2729");
    }

    @Test
    void getBalance_ShouldThrowException_WhenAccountNotFound() {
        // Given
        when(accountRepository.findById("nonexistent")).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> accountService.getBalance("nonexistent"))
                .isInstanceOf(AccountNotFoundException.class)
                .hasMessage("Account not found: nonexistent");
    }

    @Test
    void updateBalance_ShouldUpdateBalance_WhenAccountExists() {
        // Given
        BigDecimal newBalance = new BigDecimal("1500.00");
        Account updatedAccount = account.toBuilder()
                .balance(newBalance)
                .updatedAt(LocalDateTime.now())
                .build();

        when(accountRepository.findById("6894577fb75681ff9f6f2729")).thenReturn(Optional.of(account));
        when(accountRepository.save(any(Account.class))).thenReturn(updatedAccount); // Use any(Account.class)

        // When
        accountService.updateBalance("6894577fb75681ff9f6f2729", newBalance);

        // Then
        verify(accountRepository).findById("6894577fb75681ff9f6f2729");
        verify(accountRepository).save(any(Account.class)); // Use any(Account.class)
    }

    @Test
    void updateBalance_ShouldThrowException_WhenAccountNotFound() {
        // Given
        BigDecimal newBalance = new BigDecimal("1500.00");
        when(accountRepository.findById("nonexistent")).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> accountService.updateBalance("nonexistent", newBalance))
                .isInstanceOf(AccountNotFoundException.class)
                .hasMessage("Account not found: nonexistent");

        verify(accountRepository).findById("nonexistent");
        verify(accountRepository, never()).save(any());
    }

    @Test
    void existsById_ShouldReturnTrue_WhenAccountExists() {
        // Given
        when(accountRepository.existsById("6894577fb75681ff9f6f2729")).thenReturn(true);

        // When
        boolean result = accountService.existsById("6894577fb75681ff9f6f2729");

        // Then
        assertThat(result).isTrue();
        verify(accountRepository).existsById("6894577fb75681ff9f6f2729");
    }

    @Test
    void existsById_ShouldReturnFalse_WhenAccountDoesNotExist() {
        // Given
        when(accountRepository.existsById("nonexistent")).thenReturn(false);

        // When
        boolean result = accountService.existsById("nonexistent");

        // Then
        assertThat(result).isFalse();
        verify(accountRepository).existsById("nonexistent");
    }
}