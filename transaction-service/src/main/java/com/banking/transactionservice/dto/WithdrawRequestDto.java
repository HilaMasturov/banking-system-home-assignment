package com.banking.transactionservice.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Request to withdraw money")
public class WithdrawRequestDto {

    @NotBlank(message = "Account ID is required")
    @Schema(description = "Source account ID", example = "acc_001")
    private String accountId;

    @NotNull(message = "Amount is required")
    @Positive(message = "Amount must be positive")
    @Schema(description = "Withdrawal amount", example = "100.00")
    private BigDecimal amount;

    @NotBlank(message = "Currency is required")
    @Schema(description = "Currency", example = "USD")
    private String currency;

    @Schema(description = "Transaction description", example = "ATM withdrawal")
    private String description;
}

