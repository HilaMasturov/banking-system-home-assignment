package com.banking.accountservice.dto;

import com.banking.accountservice.entity.Account;
import com.banking.accountservice.entity.enums.AccountStatus;
import com.banking.accountservice.entity.enums.AccountType;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder(toBuilder = true)
public class AccountResponse {

    private String accountId;
    private String customerId;
    private String accountNumber;
    private AccountType accountType;
    private BigDecimal balance;
    private String currency;
    private AccountStatus status;
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
