package com.banking.transactionservice.service;


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
import com.banking.transactionservice.service.impl.TransactionServiceImpl;
import com.banking.transactionservice.util.TransactionMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TransactionServiceImplTest {

    @Mock
    private TransactionRepository transactionRepository;

    @Mock
    private AccountServiceClient accountServiceClient;

    @Mock
    private TransactionMapper transactionMapper;

    @InjectMocks
    private TransactionServiceImpl transactionService;

    private DepositRequestDto depositRequest;
    private WithdrawRequestDto withdrawRequest;
    private TransferRequestDto transferRequest;
    private Transaction transaction;
    private TransactionResponseDto transactionResponse;

    @BeforeEach
    void setUp() {
        depositRequest = new DepositRequestDto();
        depositRequest.setAccountId("account1");
        depositRequest.setAmount(new BigDecimal("1000.00"));
        depositRequest.setCurrency("USD");
        depositRequest.setDescription("Initial deposit");

        withdrawRequest = new WithdrawRequestDto();
        withdrawRequest.setAccountId("account1");
        withdrawRequest.setAmount(new BigDecimal("500.00"));
        withdrawRequest.setCurrency("USD");
        withdrawRequest.setDescription("ATM withdrawal");

        transferRequest = new TransferRequestDto();
        transferRequest.setFromAccountId("account1");
        transferRequest.setToAccountId("account2");
        transferRequest.setAmount(new BigDecimal("300.00"));
        transferRequest.setCurrency("USD");
        transferRequest.setDescription("Transfer to friend");

        transaction = Transaction.builder()
                .transactionId("txn1")
                .toAccountId("account1")
                .amount(new BigDecimal("1000.00"))
                .currency("USD")
                .type(TransactionType.DEPOSIT)
                .status(TransactionStatus.COMPLETED)
                .description("Initial deposit")
                .createdAt(LocalDateTime.of(2025, 1, 15, 12, 0))
                .build();

        transactionResponse = TransactionResponseDto.builder()
                .transactionId("txn1")
                .toAccountId("account1")
                .amount(new BigDecimal("1000.00"))
                .currency("USD")
                .type(TransactionType.DEPOSIT)
                .status(TransactionStatus.COMPLETED)
                .description("Initial deposit")
                .createdAt(LocalDateTime.of(2025, 1, 15, 12, 0))
                .build();
    }

    @Test
    void deposit_ShouldCreateDepositTransaction_WhenAccountExists() {
        // Given
        when(accountServiceClient.accountExists("account1")).thenReturn(true);
        when(accountServiceClient.getAccountBalance("account1")).thenReturn(new BigDecimal("500.00"));
        when(transactionRepository.save(any(Transaction.class))).thenReturn(transaction);
        when(transactionMapper.toResponseDto(transaction)).thenReturn(transactionResponse);

        // When
        TransactionResponseDto result = transactionService.deposit(depositRequest);

        // Then
        assertThat(result).isEqualTo(transactionResponse);
        assertThat(result.getType()).isEqualTo(TransactionType.DEPOSIT);
        assertThat(result.getStatus()).isEqualTo(TransactionStatus.COMPLETED);
        assertThat(result.getAmount()).isEqualByComparingTo(new BigDecimal("1000.00"));

        verify(accountServiceClient).accountExists("account1");
        verify(accountServiceClient).getAccountBalance("account1");
        verify(accountServiceClient).updateAccountBalance("account1", new BigDecimal("1500.00"));
        verify(transactionRepository).save(any(Transaction.class));
        verify(transactionMapper).toResponseDto(transaction);
    }

    @Test
    void deposit_ShouldThrowException_WhenAccountNotFound() {
        // Given
        when(accountServiceClient.accountExists("account1")).thenReturn(false);

        // When & Then
        assertThatThrownBy(() -> transactionService.deposit(depositRequest))
                .isInstanceOf(AccountNotFoundException.class)
                .hasMessage("Account not found: account1");

        verify(transactionRepository, never()).save(any());
    }

    @Test
    void withdraw_ShouldCreateWithdrawalTransaction_WhenSufficientFunds() {
        // Given
        when(accountServiceClient.accountExists("account1")).thenReturn(true);
        when(accountServiceClient.getAccountBalance("account1")).thenReturn(new BigDecimal("1000.00"));

        Transaction withdrawalTransaction = Transaction.builder()
                .transactionId("txn2")
                .fromAccountId("account1")
                .amount(new BigDecimal("500.00"))
                .currency("USD")
                .type(TransactionType.WITHDRAWAL)
                .status(TransactionStatus.COMPLETED)
                .description("ATM withdrawal")
                .createdAt(LocalDateTime.now())
                .build();

        TransactionResponseDto withdrawalResponse = TransactionResponseDto.builder()
                .transactionId("txn2")
                .fromAccountId("account1")
                .amount(new BigDecimal("500.00"))
                .currency("USD")
                .type(TransactionType.WITHDRAWAL)
                .status(TransactionStatus.COMPLETED)
                .description("ATM withdrawal")
                .createdAt(LocalDateTime.now())
                .build();

        when(transactionRepository.save(any(Transaction.class))).thenReturn(withdrawalTransaction);
        when(transactionMapper.toResponseDto(withdrawalTransaction)).thenReturn(withdrawalResponse);

        // When
        TransactionResponseDto result = transactionService.withdraw(withdrawRequest);

        // Then
        assertThat(result).isEqualTo(withdrawalResponse);
        assertThat(result.getType()).isEqualTo(TransactionType.WITHDRAWAL);
        assertThat(result.getAmount()).isEqualByComparingTo(new BigDecimal("500.00"));

        verify(accountServiceClient).accountExists("account1");
        verify(accountServiceClient).getAccountBalance("account1");
        verify(transactionRepository).save(any(Transaction.class));
    }

    @Test
    void withdraw_ShouldThrowException_WhenInsufficientFunds() {
        // Given
        when(accountServiceClient.accountExists("account1")).thenReturn(true);
        when(accountServiceClient.getAccountBalance("account1")).thenReturn(new BigDecimal("100.00"));

        // When & Then
        assertThatThrownBy(() -> transactionService.withdraw(withdrawRequest))
                .isInstanceOf(InsufficientFundsException.class)
                .hasMessage("Insufficient funds for withdrawal");

        verify(transactionRepository, never()).save(any());
    }

    @Test
    void withdraw_ShouldThrowException_WhenAccountNotFound() {
        // Given
        when(accountServiceClient.accountExists("account1")).thenReturn(false);

        // When & Then
        assertThatThrownBy(() -> transactionService.withdraw(withdrawRequest))
                .isInstanceOf(AccountNotFoundException.class)
                .hasMessage("Account not found: account1");

        verify(accountServiceClient, never()).getAccountBalance(anyString());
        verify(transactionRepository, never()).save(any());
    }

    @Test
    void transfer_ShouldCreateTransferTransaction_WhenValidAccounts() {
        // Given
        when(accountServiceClient.accountExists("account1")).thenReturn(true);
        when(accountServiceClient.accountExists("account2")).thenReturn(true);
        when(accountServiceClient.getAccountBalance("account1")).thenReturn(new BigDecimal("1000.00"));
        when(accountServiceClient.getAccountBalance("account2")).thenReturn(new BigDecimal("500.00"));

        Transaction transferTransaction = Transaction.builder()
                .transactionId("txn3")
                .fromAccountId("account1")
                .toAccountId("account2")
                .amount(new BigDecimal("300.00"))
                .currency("USD")
                .type(TransactionType.TRANSFER)
                .status(TransactionStatus.COMPLETED)
                .description("Transfer to friend")
                .createdAt(LocalDateTime.now())
                .build();

        TransactionResponseDto transferResponse = TransactionResponseDto.builder()
                .transactionId("txn3")
                .fromAccountId("account1")
                .toAccountId("account2")
                .amount(new BigDecimal("300.00"))
                .currency("USD")
                .type(TransactionType.TRANSFER)
                .status(TransactionStatus.COMPLETED)
                .description("Transfer to friend")
                .createdAt(LocalDateTime.now())
                .build();

        when(transactionRepository.save(any(Transaction.class))).thenReturn(transferTransaction);
        when(transactionMapper.toResponseDto(transferTransaction)).thenReturn(transferResponse);

        // When
        TransactionResponseDto result = transactionService.transfer(transferRequest);

        // Then
        assertThat(result).isEqualTo(transferResponse);
        assertThat(result.getType()).isEqualTo(TransactionType.TRANSFER);
        assertThat(result.getFromAccountId()).isEqualTo("account1");
        assertThat(result.getToAccountId()).isEqualTo("account2");

        verify(accountServiceClient).accountExists("account1");
        verify(accountServiceClient).accountExists("account2");
        verify(accountServiceClient).getAccountBalance("account1");
        verify(accountServiceClient).getAccountBalance("account2");
        verify(accountServiceClient).updateAccountBalance("account1", new BigDecimal("700.00"));
        verify(accountServiceClient).updateAccountBalance("account2", new BigDecimal("800.00"));
        verify(transactionRepository).save(any(Transaction.class));
    }

    @Test
    void transfer_ShouldThrowException_WhenFromAccountNotFound() {
        // Given
        when(accountServiceClient.accountExists("account1")).thenReturn(false);

        // When & Then
        assertThatThrownBy(() -> transactionService.transfer(transferRequest))
                .isInstanceOf(AccountNotFoundException.class)
                .hasMessage("From account not found: account1");

        verify(accountServiceClient, never()).accountExists("account2");
        verify(transactionRepository, never()).save(any());
    }

    @Test
    void transfer_ShouldThrowException_WhenToAccountNotFound() {
        // Given
        when(accountServiceClient.accountExists("account1")).thenReturn(true);
        when(accountServiceClient.accountExists("account2")).thenReturn(false);

        // When & Then
        assertThatThrownBy(() -> transactionService.transfer(transferRequest))
                .isInstanceOf(AccountNotFoundException.class)
                .hasMessage("To account not found: account2");

        verify(accountServiceClient, never()).getAccountBalance(anyString());
        verify(transactionRepository, never()).save(any());
    }

    @Test
    void transfer_ShouldThrowException_WhenInsufficientFunds() {
        // Given
        when(accountServiceClient.accountExists("account1")).thenReturn(true);
        when(accountServiceClient.accountExists("account2")).thenReturn(true);
        when(accountServiceClient.getAccountBalance("account1")).thenReturn(new BigDecimal("100.00"));

        // When & Then
        assertThatThrownBy(() -> transactionService.transfer(transferRequest))
                .isInstanceOf(InsufficientFundsException.class)
                .hasMessage("Insufficient funds for transfer");

        verify(transactionRepository, never()).save(any());
    }

    @Test
    void transfer_ShouldThrowException_WhenSameFromAndToAccount() {
        // Given
        TransferRequestDto sameAccountRequest = new TransferRequestDto();
        sameAccountRequest.setFromAccountId("account1");
        sameAccountRequest.setToAccountId("account1");
        sameAccountRequest.setAmount(new BigDecimal("300.00"));
        sameAccountRequest.setCurrency("USD");

        // No mocks needed because the validation happens before external calls

        // When & Then
        assertThatThrownBy(() -> transactionService.transfer(sameAccountRequest))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Cannot transfer to the same account");

        // Verify no external service calls were made
        verify(accountServiceClient, never()).accountExists(anyString());
        verify(accountServiceClient, never()).getAccountBalance(anyString());
        verify(transactionRepository, never()).save(any());
    }

    @Test
    void getTransactionsByAccountId_ShouldReturnPagedTransactions() {
        // Given
        String accountId = "account1";
        Pageable pageable = PageRequest.of(0, 10);
        Page<Transaction> transactionPage = new PageImpl<>(List.of(transaction));

        when(transactionRepository.findByAccountId(accountId, pageable)).thenReturn(transactionPage);
        when(transactionMapper.toResponseDto(transaction)).thenReturn(transactionResponse);

        // When
        Page<TransactionResponseDto> result = transactionService.getTransactionsByAccountId(accountId, pageable);

        // Then
        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0)).isEqualTo(transactionResponse);
        assertThat(result.getTotalElements()).isEqualTo(1);

        verify(transactionRepository).findByAccountId(accountId, pageable);
        verify(transactionMapper).toResponseDto(transaction);
    }

    @Test
    void getTransactionById_ShouldReturnTransaction_WhenExists() {
        // Given
        String transactionId = "txn1";
        when(transactionRepository.findById(transactionId)).thenReturn(Optional.of(transaction));
        when(transactionMapper.toResponseDto(transaction)).thenReturn(transactionResponse);

        // When
        TransactionResponseDto result = transactionService.getTransactionById(transactionId);

        // Then
        assertThat(result).isEqualTo(transactionResponse);
        assertThat(result.getTransactionId()).isEqualTo("txn1");

        verify(transactionRepository).findById(transactionId);
        verify(transactionMapper).toResponseDto(transaction);
    }

    @Test
    void getTransactionById_ShouldThrowException_WhenNotFound() {
        // Given
        String transactionId = "nonexistent";
        when(transactionRepository.findById(transactionId)).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> transactionService.getTransactionById(transactionId))
                .isInstanceOf(TransactionNotFoundException.class)
                .hasMessage("Transaction not found: nonexistent");

        verify(transactionMapper, never()).toResponseDto(any());
    }

    @Test
    void getTransactionsByAccountId_ShouldReturnEmptyPage_WhenNoTransactions() {
        // Given
        String accountId = "account-empty";
        Pageable pageable = PageRequest.of(0, 10);
        Page<Transaction> emptyPage = new PageImpl<>(List.of());

        when(transactionRepository.findByAccountId(accountId, pageable)).thenReturn(emptyPage);

        // When
        Page<TransactionResponseDto> result = transactionService.getTransactionsByAccountId(accountId, pageable);

        // Then
        assertThat(result.getContent()).isEmpty();
        assertThat(result.getTotalElements()).isEqualTo(0);

        verify(transactionRepository).findByAccountId(accountId, pageable);
        verify(transactionMapper, never()).toResponseDto(any());
    }

    @Test
    void deposit_ShouldHandleNullDescription() {
        // Given
        depositRequest.setDescription(null);
        when(accountServiceClient.accountExists("account1")).thenReturn(true);
        when(accountServiceClient.getAccountBalance("account1")).thenReturn(new BigDecimal("500.00"));
        when(transactionRepository.save(any(Transaction.class))).thenReturn(transaction);
        when(transactionMapper.toResponseDto(transaction)).thenReturn(transactionResponse);

        // When
        TransactionResponseDto result = transactionService.deposit(depositRequest);

        // Then
        assertThat(result).isEqualTo(transactionResponse);
        verify(accountServiceClient).accountExists("account1");
        verify(accountServiceClient).getAccountBalance("account1");
        verify(accountServiceClient).updateAccountBalance("account1", new BigDecimal("1500.00"));
        verify(transactionRepository).save(any(Transaction.class));
    }

    @Test
    void withdraw_ShouldHandleExactBalance() {
        // Given - exact balance match
        when(accountServiceClient.accountExists("account1")).thenReturn(true);
        when(accountServiceClient.getAccountBalance("account1")).thenReturn(new BigDecimal("500.00"));

        Transaction withdrawalTransaction = Transaction.builder()
                .transactionId("txn2")
                .fromAccountId("account1")
                .amount(new BigDecimal("500.00"))
                .currency("USD")
                .type(TransactionType.WITHDRAWAL)
                .status(TransactionStatus.COMPLETED)
                .description("ATM withdrawal")
                .createdAt(LocalDateTime.now())
                .build();

        when(transactionRepository.save(any(Transaction.class))).thenReturn(withdrawalTransaction);
        when(transactionMapper.toResponseDto(any(Transaction.class))).thenReturn(transactionResponse);

        // When & Then - should succeed with exact balance
        TransactionResponseDto result = transactionService.withdraw(withdrawRequest);
        assertThat(result).isNotNull();
    }

    @Test
    void deposit_ShouldHandleDifferentCurrencies() {
        // Given
        depositRequest.setCurrency("EUR");
        depositRequest.setAmount(new BigDecimal("1000.00"));

        when(accountServiceClient.accountExists("account1")).thenReturn(true);
        when(accountServiceClient.getAccountBalance("account1")).thenReturn(new BigDecimal("500.00"));

        Transaction eurTransaction = Transaction.builder()
                .transactionId("txn-eur")
                .toAccountId("account1")
                .amount(new BigDecimal("1000.00"))
                .currency("EUR")
                .type(TransactionType.DEPOSIT)
                .status(TransactionStatus.COMPLETED)
                .description("EUR deposit")
                .createdAt(LocalDateTime.now())
                .build();

        when(transactionRepository.save(any(Transaction.class))).thenReturn(eurTransaction);
        when(transactionMapper.toResponseDto(any(Transaction.class))).thenReturn(transactionResponse);

        // When
        TransactionResponseDto result = transactionService.deposit(depositRequest);

        // Then
        assertThat(result).isNotNull();
        verify(accountServiceClient).updateAccountBalance("account1", new BigDecimal("1500.00"));
        verify(transactionRepository).save(any(Transaction.class));
    }

    @Test
    void transfer_ShouldHandleDifferentCurrencies() {
        // Given
        transferRequest.setCurrency("GBP");
        transferRequest.setAmount(new BigDecimal("300.00"));

        when(accountServiceClient.accountExists("account1")).thenReturn(true);
        when(accountServiceClient.accountExists("account2")).thenReturn(true);
        when(accountServiceClient.getAccountBalance("account1")).thenReturn(new BigDecimal("1000.00"));
        when(accountServiceClient.getAccountBalance("account2")).thenReturn(new BigDecimal("500.00"));

        Transaction gbpTransaction = Transaction.builder()
                .transactionId("txn-gbp")
                .fromAccountId("account1")
                .toAccountId("account2")
                .amount(new BigDecimal("300.00"))
                .currency("GBP")
                .type(TransactionType.TRANSFER)
                .status(TransactionStatus.COMPLETED)
                .description("GBP transfer")
                .createdAt(LocalDateTime.now())
                .build();

        when(transactionRepository.save(any(Transaction.class))).thenReturn(gbpTransaction);
        when(transactionMapper.toResponseDto(any(Transaction.class))).thenReturn(transactionResponse);

        // When
        TransactionResponseDto result = transactionService.transfer(transferRequest);

        // Then
        assertThat(result).isNotNull();
        verify(accountServiceClient).updateAccountBalance("account1", new BigDecimal("700.00"));
        verify(accountServiceClient).updateAccountBalance("account2", new BigDecimal("800.00"));
        verify(transactionRepository).save(any(Transaction.class));
    }

    @Test
    void deposit_ShouldHandleZeroAmount() {
        // Given
        depositRequest.setAmount(BigDecimal.ZERO);

        when(accountServiceClient.accountExists("account1")).thenReturn(true);
        when(accountServiceClient.getAccountBalance("account1")).thenReturn(new BigDecimal("1000.00"));

        Transaction zeroTransaction = Transaction.builder()
                .transactionId("txn-zero")
                .toAccountId("account1")
                .amount(BigDecimal.ZERO)
                .currency("USD")
                .type(TransactionType.DEPOSIT)
                .status(TransactionStatus.COMPLETED)
                .description("Zero deposit")
                .createdAt(LocalDateTime.now())
                .build();

        when(transactionRepository.save(any(Transaction.class))).thenReturn(zeroTransaction);
        when(transactionMapper.toResponseDto(any(Transaction.class))).thenReturn(transactionResponse);

        // When
        TransactionResponseDto result = transactionService.deposit(depositRequest);

        // Then
        assertThat(result).isNotNull();
        verify(accountServiceClient).updateAccountBalance("account1", new BigDecimal("1000.00"));
        verify(transactionRepository).save(any(Transaction.class));
    }
}