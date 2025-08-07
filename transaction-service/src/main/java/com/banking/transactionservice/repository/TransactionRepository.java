package com.banking.transactionservice.repository;

import com.banking.transactionservice.entity.enums.TransactionStatus;
import com.banking.transactionservice.entity.Transaction;
import com.banking.transactionservice.entity.enums.TransactionType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TransactionRepository extends MongoRepository<Transaction, String> {

    @Query("{'$or': [{'fromAccountId': ?0}, {'toAccountId': ?0}]}")
    Page<Transaction> findByAccountId(String accountId, Pageable pageable);

    List<Transaction> findByFromAccountId(String fromAccountId);

    List<Transaction> findByToAccountId(String toAccountId);

    List<Transaction> findByStatus(TransactionStatus status);

    List<Transaction> findByType(TransactionType type);

    @Query("{'createdAt': {'$gte': ?0, '$lte': ?1}}")
    List<Transaction> findByCreatedAtBetween(LocalDateTime startDate, LocalDateTime endDate);

    @Query("{'$or': [{'fromAccountId': ?0}, {'toAccountId': ?0}], 'createdAt': {'$gte': ?1, '$lte': ?2}}")
    List<Transaction> findByAccountIdAndCreatedAtBetween(String accountId, LocalDateTime startDate, LocalDateTime endDate);
}