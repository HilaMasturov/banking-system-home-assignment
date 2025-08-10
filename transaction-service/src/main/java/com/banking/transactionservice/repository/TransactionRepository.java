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
}