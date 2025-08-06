package com.banking.accountservice.dto;


import com.banking.accountservice.model.entity.Account;
import lombok.Data;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

@Data
public class AccountCreateRequest {

    @NotBlank(message = "Customer ID is required")
    private String customerId;

    @NotNull(message = "Account type is required")
    private Account.AccountType accountType;

    private BigDecimal initialDeposit = BigDecimal.ZERO;

    private String currency = "USD";
}
