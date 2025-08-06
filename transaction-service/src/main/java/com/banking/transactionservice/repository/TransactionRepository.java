package com.banking.transactionservice.repository;

import com.banking.transactionservice.model.entity.Transaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TransactionRepository extends MongoRepository<Transaction, String> {

    /**
     * Find transactions by account ID (either from or to account)
     */
    @Query("{'$or': [{'fromAccountId': ?0}, {'toAccountId': ?0}]}")
    Page<Transaction> findByAccountId(String accountId, Pageable pageable);

    /**
     * Find transactions by from account ID
     */
    List<Transaction> findByFromAccountId(String fromAccountId);

    /**
     * Find transactions by to account ID
     */
    List<Transaction> findByToAccountId(String toAccountId);

    /**
     * Find transactions by status
     */
    List<Transaction> findByStatus(Transaction.TransactionStatus status);

    /**
     * Find transactions by type
     */
    List<Transaction> findByType(Transaction.TransactionType type);

    /**
     * Find transactions by date range
     */
    @Query("{'createdAt': {'$gte': ?0, '$lte': ?1}}")
    List<Transaction> findByCreatedAtBetween(LocalDateTime startDate, LocalDateTime endDate);

    /**
     * Find transactions by account ID and date range
     */
    @Query("{'$or': [{'fromAccountId': ?0}, {'toAccountId': ?0}], 'createdAt': {'$gte': ?1, '$lte': ?2}}")
    List<Transaction> findByAccountIdAndCreatedAtBetween(String accountId, LocalDateTime startDate, LocalDateTime endDate);
}