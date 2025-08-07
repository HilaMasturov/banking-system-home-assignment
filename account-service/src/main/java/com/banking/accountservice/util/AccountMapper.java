package com.banking.accountservice.util;

import com.banking.accountservice.dto.AccountCreateRequest;
import com.banking.accountservice.dto.AccountResponse;
import com.banking.accountservice.dto.AccountUpdateRequest;
import com.banking.accountservice.entity.Account;
import com.banking.accountservice.entity.enums.AccountStatus;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Component
public class AccountMapper {

    public Account toEntity(AccountCreateRequest request) {
        if (request == null) {
            return null;
        }

        return Account.builder()
                .accountId(UUID.randomUUID().toString())
                .customerId(request.getCustomerId())
                .accountNumber(generateAccountNumber())
                .accountType(request.getAccountType())
                .balance(request.getInitialDeposit() != null ? request.getInitialDeposit() : BigDecimal.ZERO)
                .currency(request.getCurrency())
                .status(AccountStatus.ACTIVE)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
    }

    public AccountResponse toResponse(Account account) {
        if (account == null) {
            return null;
        }

        return AccountResponse.builder()
                .accountId(account.getAccountId())
                .customerId(account.getCustomerId())
                .accountNumber(account.getAccountNumber())
                .accountType(account.getAccountType())
                .balance(account.getBalance())
                .currency(account.getCurrency())
                .status(account.getStatus())
                .createdAt(account.getCreatedAt())
                .updatedAt(account.getUpdatedAt())
                .build();
    }

    public Account updateEntity(Account account, AccountUpdateRequest request) {
        if (account == null || request == null) {
            return account;
        }

        Account.AccountBuilder builder = account.toBuilder();

        // Update only non-null fields from the request
        if (request.getStatus() != null) {
            builder.status(request.getStatus());
        }

        // Always update the updatedAt timestamp
        builder.updatedAt(LocalDateTime.now());

        return builder.build();
    }

    /**
     * Generate a unique account number
     * Format: ACC + 9 random digits
     *
     * @return generated account number
     */
    private String generateAccountNumber() {
        // Generate a random 9-digit number
        long randomNumber = (long) (Math.random() * 900000000L) + 100000000L;
        return "ACC" + randomNumber;
    }
}