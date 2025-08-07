package com.banking.transactionservice.dto;

import lombok.Data;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

@Data
public class TransferRequestDto {
    @NotBlank(message = "From Account ID is required")
    private String fromAccountId;

    @NotBlank(message = "To Account ID is required")
    private String toAccountId;

    @NotNull(message = "Amount is required")
    @DecimalMin(value = "0.01", message = "Amount must be greater than 0")
    private BigDecimal amount;

    @NotBlank(message = "Currency is required")
    private String currency;

    private String description;
}