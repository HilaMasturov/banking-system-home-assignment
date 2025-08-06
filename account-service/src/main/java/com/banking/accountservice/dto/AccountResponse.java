package com.banking.accountservice.dto;

import com.banking.accountservice.model.entity.Account;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class AccountResponse {

    private String accountId;
    private String customerId;
    private String accountNumber;
    private Account.AccountType accountType;
    private BigDecimal balance;
    private String currency;
    private Account.AccountStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static AccountResponse from(Account account) {
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
}
