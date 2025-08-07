package com.banking.transactionservice.repository;

import com.banking.transactionservice.entity.Transaction;
import com.banking.transactionservice.entity.enums.TransactionStatus;
import com.banking.transactionservice.entity.enums.TransactionType;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.data.mongo.DataMongoTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.MongoDBContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;

@DataMongoTest
@Testcontainers
public class TransactionRepositoryTest {

    @Container
    static MongoDBContainer mongoDBContainer = new MongoDBContainer("mongo:7.0");

    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.data.mongodb.uri", mongoDBContainer::getReplicaSetUrl);
    }

    @Autowired
    private TransactionRepository transactionRepository;

    @BeforeEach
    void setUp() {
        transactionRepository.deleteAll();
    }

    @Test
    void shouldFindTransactionsByAccountId() {
        // Given
        String accountId = "account-1";
        Transaction transaction1 = createTransaction("trans-1", accountId, null, TransactionType.DEPOSIT);
        Transaction transaction2 = createTransaction("trans-2", null, accountId, TransactionType.WITHDRAWAL);
        Transaction transaction3 = createTransaction("trans-3", "other-account", null, TransactionType.DEPOSIT);

        transactionRepository.save(transaction1);
        transactionRepository.save(transaction2);
        transactionRepository.save(transaction3);

        // When
        Page<Transaction> result = transactionRepository.findByAccountId(accountId, PageRequest.of(0, 10));

        // Then
        assertThat(result.getContent()).hasSize(2);
        assertThat(result.getContent()).extracting(Transaction::getTransactionId)
                .containsExactlyInAnyOrder("trans-1", "trans-2");
    }

    private Transaction createTransaction(String id, String fromAccountId, String toAccountId, TransactionType type) {
        return Transaction.builder()
                .transactionId(id)
                .fromAccountId(fromAccountId)
                .toAccountId(toAccountId)
                .amount(BigDecimal.valueOf(100.00))
                .currency("USD")
                .type(type)
                .status(TransactionStatus.COMPLETED)
                .description("Test transaction")
                .createdAt(LocalDateTime.now())
                .build();
    }
}