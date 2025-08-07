package com.banking.transactionservice.service;

import com.banking.transactionservice.dto.AccountDto;

import java.math.BigDecimal;

public interface AccountServiceClient {

    boolean accountExists(String accountId);

    BigDecimal getAccountBalance(String accountId);

    void updateAccountBalance(String accountId, BigDecimal newBalance);

    AccountDto getAccount(String accountId);
}