package com.banking.accountservice.service.impl;

import com.banking.accountservice.dto.AccountCreateRequest;
import com.banking.accountservice.dto.AccountResponse;
import com.banking.accountservice.dto.AccountUpdateRequest;
import com.banking.accountservice.entity.Account;
import com.banking.accountservice.entity.Customer;
import com.banking.accountservice.exception.AccountNotFoundException;
import com.banking.accountservice.exception.CustomerNotFoundException;
import com.banking.accountservice.repository.AccountRepository;
import com.banking.accountservice.repository.CustomerRepository;
import com.banking.accountservice.service.AccountService;
import com.banking.accountservice.util.AccountMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class AccountServiceImpl implements AccountService {

    private final AccountRepository accountRepository;
    private final CustomerRepository customerRepository;
    private final AccountMapper accountMapper;

    @Override
    public AccountResponse createAccount(AccountCreateRequest request) {
        log.info("Creating account for customer: {}", request.getCustomerId());

        // Validate that customer exists
        Customer customer = customerRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new CustomerNotFoundException("Customer not found: " + request.getCustomerId()));

        // Convert request to entity
        Account account = accountMapper.toEntity(request);

        // Save the account
        Account savedAccount = accountRepository.save(account);
        log.info("Account created successfully with ID: {} for customer: {}",
                savedAccount.getAccountId(), request.getCustomerId());

        // Convert to response DTO
        return accountMapper.toResponse(savedAccount);
    }

    @Override
    @Cacheable(value = "accounts", key = "#accountId")
    public AccountResponse findById(String accountId) {
        log.info("Finding account by ID: {}", accountId);

        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new AccountNotFoundException("Account not found: " + accountId));

        return accountMapper.toResponse(account);
    }

    @Override
    @Cacheable(value = "customerAccounts", key = "#customerId")
    public List<AccountResponse> findByCustomerId(String customerId) {
        log.info("Finding accounts for customer: {}", customerId);

        List<Account> accounts = accountRepository.findByCustomerId(customerId);

        return accounts.stream()
                .map(accountMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public AccountResponse updateAccount(String accountId, AccountUpdateRequest request) {
        log.info("Updating account: {}", accountId);

        // Find existing account
        Account existingAccount = accountRepository.findById(accountId)
                .orElseThrow(() -> new AccountNotFoundException("Account not found: " + accountId));

        // Update the account
        Account updatedAccount = accountMapper.updateEntity(existingAccount, request);

        // Save the updated account
        Account savedAccount = accountRepository.save(updatedAccount);
        log.info("Account updated successfully: {}", accountId);

        return accountMapper.toResponse(savedAccount);
    }

    @Override
    @Cacheable(value = "accountBalance", key = "#accountId")
    public BigDecimal getBalance(String accountId) {
        log.info("Getting balance for account: {}", accountId);

        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new AccountNotFoundException("Account not found: " + accountId));

        return account.getBalance();
    }

    @Override
    public void updateBalance(String accountId, BigDecimal newBalance) {
        log.info("Updating balance for account: {} to: {}", accountId, newBalance);

        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new AccountNotFoundException("Account not found: " + accountId));

        Account updatedAccount = account.toBuilder()
                .balance(newBalance)
                .updatedAt(java.time.LocalDateTime.now())
                .build();

        accountRepository.save(updatedAccount);
        log.info("Balance updated successfully for account: {}", accountId);
    }

    @Override
    public boolean existsById(String accountId) {
        return accountRepository.existsById(accountId);
    }
}