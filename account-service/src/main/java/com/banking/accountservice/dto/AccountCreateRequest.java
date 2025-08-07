package com.banking.accountservice.dto;


import com.banking.accountservice.entity.enums.AccountType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AccountCreateRequest {

    @NotBlank(message = "Customer ID is required")
    private String customerId;

    @NotNull(message = "Account type is required")
    private AccountType accountType;

    private BigDecimal initialDeposit = BigDecimal.ZERO;

    private String currency = "USD";
}
