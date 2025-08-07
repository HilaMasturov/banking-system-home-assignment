package com.banking.transactionservice.service.impl;

import com.banking.transactionservice.dto.DepositRequestDto;
import com.banking.transactionservice.dto.TransactionResponseDto;
import com.banking.transactionservice.dto.TransferRequestDto;
import com.banking.transactionservice.dto.WithdrawRequestDto;
import com.banking.transactionservice.entity.Transaction;
import com.banking.transactionservice.entity.enums.TransactionStatus;
import com.banking.transactionservice.entity.enums.TransactionType;
import com.banking.transactionservice.exception.AccountNotFoundException;
import com.banking.transactionservice.exception.InsufficientFundsException;
import com.banking.transactionservice.exception.TransactionNotFoundException;
import com.banking.transactionservice.repository.TransactionRepository;
import com.banking.transactionservice.service.AccountServiceClient;
import com.banking.transactionservice.service.TransactionService;
import com.banking.transactionservice.util.TransactionMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class TransactionServiceImpl implements TransactionService {

    private final TransactionRepository transactionRepository;
    private final AccountServiceClient accountServiceClient;
    private final TransactionMapper transactionMapper;

    @Override
    public TransactionResponseDto deposit(DepositRequestDto request) {
        log.info("Processing deposit for account: {}, amount: {}", request.getAccountId(), request.getAmount());

        // Validate account exists
        if (!accountServiceClient.accountExists(request.getAccountId())) {
            throw new AccountNotFoundException("Account not found: " + request.getAccountId());
        }

        Transaction transaction = Transaction.builder()
                .transactionId(UUID.randomUUID().toString())
                .toAccountId(request.getAccountId())
                .amount(request.getAmount())
                .currency(request.getCurrency())
                .type(TransactionType.DEPOSIT)
                .status(TransactionStatus.COMPLETED)
                .description(request.getDescription() != null ? request.getDescription() : "Deposit")
                .createdAt(LocalDateTime.now())
                .build();

        Transaction savedTransaction = transactionRepository.save(transaction);
        log.info("Deposit completed for transaction: {}", savedTransaction.getTransactionId());

        return transactionMapper.toResponseDto(savedTransaction);
    }

    @Override
    public TransactionResponseDto withdraw(WithdrawRequestDto request) {
        log.info("Processing withdrawal for account: {}, amount: {}", request.getAccountId(), request.getAmount());

        // Validate account exists
        if (!accountServiceClient.accountExists(request.getAccountId())) {
            throw new AccountNotFoundException("Account not found: " + request.getAccountId());
        }

        // Check balance (simplified - in real implementation, this would be handled by Account Service)
        BigDecimal currentBalance = accountServiceClient.getAccountBalance(request.getAccountId());
        if (currentBalance.compareTo(request.getAmount()) < 0) {
            throw new InsufficientFundsException("Insufficient funds for withdrawal");
        }

        Transaction transaction = Transaction.builder()
                .transactionId(UUID.randomUUID().toString())
                .fromAccountId(request.getAccountId())
                .amount(request.getAmount())
                .currency(request.getCurrency())
                .type(TransactionType.WITHDRAWAL)
                .status(TransactionStatus.COMPLETED)
                .description(request.getDescription() != null ? request.getDescription() : "Withdrawal")
                .createdAt(LocalDateTime.now())
                .build();

        Transaction savedTransaction = transactionRepository.save(transaction);
        log.info("Withdrawal completed for transaction: {}", savedTransaction.getTransactionId());

        return transactionMapper.toResponseDto(savedTransaction);
    }

    @Override
    public TransactionResponseDto transfer(TransferRequestDto request) {
        log.info("Processing transfer from account: {} to account: {}, amount: {}",
                request.getFromAccountId(), request.getToAccountId(), request.getAmount());

        // Check for same account transfer FIRST (before any external calls)
        if (request.getFromAccountId().equals(request.getToAccountId())) {
            throw new IllegalArgumentException("Cannot transfer to the same account");
        }

        // Validate both accounts exist
        if (!accountServiceClient.accountExists(request.getFromAccountId())) {
            throw new AccountNotFoundException("From account not found: " + request.getFromAccountId());
        }

        if (!accountServiceClient.accountExists(request.getToAccountId())) {
            throw new AccountNotFoundException("To account not found: " + request.getToAccountId());
        }

        // Check balance
        BigDecimal currentBalance = accountServiceClient.getAccountBalance(request.getFromAccountId());
        if (currentBalance.compareTo(request.getAmount()) < 0) {
            throw new InsufficientFundsException("Insufficient funds for transfer");
        }

        Transaction transaction = Transaction.builder()
                .transactionId(UUID.randomUUID().toString())
                .fromAccountId(request.getFromAccountId())
                .toAccountId(request.getToAccountId())
                .amount(request.getAmount())
                .currency(request.getCurrency())
                .type(TransactionType.TRANSFER)
                .status(TransactionStatus.COMPLETED)
                .description(request.getDescription() != null ? request.getDescription() : "Transfer")
                .createdAt(LocalDateTime.now())
                .build();

        Transaction savedTransaction = transactionRepository.save(transaction);
        log.info("Transfer completed for transaction: {}", savedTransaction.getTransactionId());

        return transactionMapper.toResponseDto(savedTransaction);
    }

    @Override
    @Cacheable(value = "transactions", key = "#accountId + '_' + #pageable.pageNumber")
    public Page<TransactionResponseDto> getTransactionsByAccountId(String accountId, Pageable pageable) {
        log.info("Fetching transactions for account: {}", accountId);

        Page<Transaction> transactions = transactionRepository.findByAccountId(accountId, pageable);
        return transactions.map(transactionMapper::toResponseDto);
    }

    @Override
    @Cacheable(value = "transaction", key = "#transactionId")
    public TransactionResponseDto getTransactionById(String transactionId) {
        log.info("Fetching transaction: {}", transactionId);

        Transaction transaction = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new TransactionNotFoundException("Transaction not found: " + transactionId));

        return transactionMapper.toResponseDto(transaction);
    }
}