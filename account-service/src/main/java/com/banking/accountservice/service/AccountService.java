package com.banking.accountservice.service;

import com.banking.accountservice.dto.AccountCreateRequest;
import com.banking.accountservice.dto.AccountResponse;
import com.banking.accountservice.dto.AccountUpdateRequest;
import com.banking.accountservice.exception.AccountNotFoundException;
import com.banking.accountservice.model.entity.Account;
import com.banking.accountservice.repository.AccountRepository;
import com.banking.accountservice.util.AccountNumberGenerator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AccountService {

    private final AccountRepository accountRepository;
    private final CustomerService customerService;
    private final AccountNumberGenerator accountNumberGenerator;

    @Cacheable(value = "accounts", key = "#accountId")
    public AccountResponse findById(String accountId) {
        log.debug("Finding account by ID: {}", accountId);
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new AccountNotFoundException("Account not found with ID: " + accountId));
        return AccountResponse.from(account);
    }

    public List<AccountResponse> findByCustomerId(String customerId) {
        log.debug("Finding accounts for customer: {}", customerId);

        // Verify customer exists
        customerService.findById(customerId);

        return accountRepository.findByCustomerId(customerId)
                .stream()
                .map(AccountResponse::from)
                .collect(Collectors.toList());
    }

    @Transactional
    public AccountResponse createAccount(AccountCreateRequest request) {
        log.debug("Creating account for customer: {}", request.getCustomerId());

        // Verify customer exists
        customerService.findById(request.getCustomerId());

        String accountNumber;
        do {
            accountNumber = accountNumberGenerator.generateAccountNumber();
        } while (accountRepository.existsByAccountNumber(accountNumber));

        Account account = Account.builder()
                .customerId(request.getCustomerId())
                .accountNumber(accountNumber)
                .accountType(request.getAccountType())
                .balance(request.getInitialDeposit())
                .currency(request.getCurrency())
                .status(Account.AccountStatus.ACTIVE)
                .build();

        Account savedAccount = accountRepository.save(account);
        log.info("Created account with ID: {} and number: {}", savedAccount.getAccountId(), savedAccount.getAccountNumber());

        return AccountResponse.from(savedAccount);
    }

    @CacheEvict(value = "accounts", key = "#accountId")
    @Transactional
    public AccountResponse updateAccount(String accountId, AccountUpdateRequest request) {
        log.debug("Updating account: {}", accountId);

        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new AccountNotFoundException("Account not found with ID: " + accountId));

        if (request.getStatus() != null) {
            account.setStatus(request.getStatus());
        }

        if (request.getCurrency() != null) {
            account.setCurrency(request.getCurrency());
        }

        account.setUpdatedAt(LocalDateTime.now());

        Account updatedAccount = accountRepository.save(account);
        log.info("Updated account with ID: {}", updatedAccount.getAccountId());

        return AccountResponse.from(updatedAccount);
    }

    @Cacheable(value = "accounts", key = "#accountId + '_balance'")
    public BigDecimal getBalance(String accountId) {
        log.debug("Getting balance for account: {}", accountId);
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new AccountNotFoundException("Account not found with ID: " + accountId));
        return account.getBalance();
    }

    @CacheEvict(value = "accounts", allEntries = true)
    @Transactional
    public void updateBalance(String accountId, BigDecimal newBalance) {
        log.debug("Updating balance for account: {} to: {}", accountId, newBalance);

        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new AccountNotFoundException("Account not found with ID: " + accountId));

        account.setBalance(newBalance);
        account.setUpdatedAt(LocalDateTime.now());

        accountRepository.save(account);
        log.info("Updated balance for account: {} to: {}", accountId, newBalance);
    }
}