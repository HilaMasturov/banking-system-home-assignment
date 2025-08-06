package com.banking.accountservice.model.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "accounts")
public class Account {

    @Id
    private String accountId;

    @NotBlank(message = "Customer ID is required")
    @Indexed
    private String customerId;

    @NotBlank(message = "Account number is required")
    @Indexed(unique = true)
    private String accountNumber;

    @NotNull(message = "Account type is required")
    private AccountType accountType;

    @NotNull(message = "Balance is required")
    @DecimalMin(value = "0.0", message = "Balance cannot be negative")
    @Builder.Default
    private BigDecimal balance = BigDecimal.ZERO;

    @NotBlank(message = "Currency is required")
    @Builder.Default
    private String currency = "USD";

    @NotNull(message = "Account status is required")
    @Builder.Default
    private AccountStatus status = AccountStatus.ACTIVE;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();

    public enum AccountType {
        SAVINGS,
        CHECKING
    }

    public enum AccountStatus {
        ACTIVE,
        INACTIVE,
        BLOCKED
    }
}