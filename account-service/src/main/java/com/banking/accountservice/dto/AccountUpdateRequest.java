package com.banking.accountservice.dto;


import com.banking.accountservice.entity.Account;
import com.banking.accountservice.entity.enums.AccountStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AccountUpdateRequest {
    private AccountStatus status;
    private String currency;
}