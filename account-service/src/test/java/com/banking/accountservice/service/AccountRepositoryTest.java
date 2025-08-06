package com.banking.accountservice.service;

import com.banking.accountservice.model.entity.Account;
import com.banking.accountservice.repository.AccountRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.data.mongo.DataMongoTest;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@DataMongoTest
class AccountRepositoryTest {

    @Autowired
    private AccountRepository accountRepository;

    private Account testAccount1;
    private Account testAccount2;

    @BeforeEach
    void setUp() {
        accountRepository.deleteAll();

        testAccount1 = Account.builder()
                .customerId("customer123")
                .accountNumber("ACC123456789")
                .accountType(Account.AccountType.SAVINGS)
                .balance(new BigDecimal("1000.00"))
                .currency("USD")
                .status(Account.AccountStatus.ACTIVE)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        testAccount2 = Account.builder()
                .customerId("customer123")
                .accountNumber("ACC987654321")
                .accountType(Account.AccountType.CHECKING)
                .balance(new BigDecimal("500.00"))
                .currency("USD")
                .status(Account.AccountStatus.ACTIVE)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        accountRepository.save(testAccount1);
        accountRepository.save(testAccount2);
    }

    @Test
    void findByCustomerId_ShouldReturnCustomerAccounts() {
        // When
        List<Account> accounts = accountRepository.findByCustomerId("customer123");

        // Then
        assertThat(accounts).hasSize(2);
        assertThat(accounts).extracting(Account::getCustomerId)
                .containsOnly("customer123");
    }

    @Test
    void findByAccountNumber_WhenExists_ShouldReturnAccount() {
        // When
        Optional<Account> found = accountRepository.findByAccountNumber("ACC123456789");

        // Then
        assertThat(found).isPresent();
        assertThat(found.get().getAccountNumber()).isEqualTo("ACC123456789");
        assertThat(found.get().getCustomerId()).isEqualTo("customer123");
    }

    @Test
    void findByAccountNumber_WhenDoesNotExist_ShouldReturnEmpty() {
        // When
        Optional<Account> found = accountRepository.findByAccountNumber("NONEXISTENT");

        // Then
        assertThat(found).isEmpty();
    }

    @Test
    void existsByAccountNumber_WhenExists_ShouldReturnTrue() {
        // When
        boolean exists = accountRepository.existsByAccountNumber("ACC123456789");

        // Then
        assertThat(exists).isTrue();
    }

    @Test
    void existsByAccountNumber_WhenDoesNotExist_ShouldReturnFalse() {
        // When
        boolean exists = accountRepository.existsByAccountNumber("NONEXISTENT");

        // Then
        assertThat(exists).isFalse();
    }
}