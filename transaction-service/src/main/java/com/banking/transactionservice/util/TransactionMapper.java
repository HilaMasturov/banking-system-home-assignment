package com.banking.transactionservice.util;

import com.banking.transactionservice.dto.TransactionResponseDto;
import com.banking.transactionservice.entity.Transaction;
import org.springframework.stereotype.Component;

@Component
public class TransactionMapper {

    public TransactionResponseDto toResponseDto(Transaction transaction) {
        return TransactionResponseDto.builder()
                .transactionId(transaction.getTransactionId())
                .fromAccountId(transaction.getFromAccountId())
                .toAccountId(transaction.getToAccountId())
                .amount(transaction.getAmount())
                .currency(transaction.getCurrency())
                .type(transaction.getType())
                .status(transaction.getStatus())
                .description(transaction.getDescription())
                .createdAt(transaction.getCreatedAt())
                .build();
    }
}