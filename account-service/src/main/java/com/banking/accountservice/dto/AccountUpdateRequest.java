package com.banking.accountservice.dto;


import com.banking.accountservice.model.entity.Account;
import lombok.Data;

@Data
public class AccountUpdateRequest {
    private Account.AccountStatus status;
    private String currency;
}