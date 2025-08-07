package com.banking.transactionservice.service;

import com.banking.transactionservice.dto.DepositRequestDto;
import com.banking.transactionservice.dto.TransactionResponseDto;
import com.banking.transactionservice.dto.TransferRequestDto;
import com.banking.transactionservice.dto.WithdrawRequestDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface TransactionService {
    TransactionResponseDto deposit(DepositRequestDto request);
    TransactionResponseDto withdraw(WithdrawRequestDto request);
    TransactionResponseDto transfer(TransferRequestDto request);
    Page<TransactionResponseDto> getTransactionsByAccountId(String accountId, Pageable pageable);
    TransactionResponseDto getTransactionById(String transactionId);
}