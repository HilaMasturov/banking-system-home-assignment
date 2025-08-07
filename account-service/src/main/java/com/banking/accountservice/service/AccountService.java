package com.banking.accountservice.service;

import com.banking.accountservice.dto.AccountCreateRequest;
import com.banking.accountservice.dto.AccountResponse;
import com.banking.accountservice.dto.AccountUpdateRequest;

import java.math.BigDecimal;
import java.util.List;

public interface AccountService {

    AccountResponse createAccount(AccountCreateRequest request);

    AccountResponse findById(String accountId);

    List<AccountResponse> findByCustomerId(String customerId);

    AccountResponse updateAccount(String accountId, AccountUpdateRequest request);

    BigDecimal getBalance(String accountId);

    void updateBalance(String accountId, BigDecimal newBalance);

    boolean existsById(String accountId);
}