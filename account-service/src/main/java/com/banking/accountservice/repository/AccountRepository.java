package com.banking.accountservice.repository;

import com.banking.accountservice.model.entity.Account;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AccountRepository extends MongoRepository<Account, String> {

    /**
     * Find all accounts by customer ID
     */
    List<Account> findByCustomerId(String customerId);

    /**
     * Find account by account number
     */
    Optional<Account> findByAccountNumber(String accountNumber);

    /**
     * Find all active accounts by customer ID
     */
    @Query("{'customerId': ?0, 'status': 'ACTIVE'}")
    List<Account> findActiveAccountsByCustomerId(String customerId);

    /**
     * Check if account number exists
     */
    boolean existsByAccountNumber(String accountNumber);

    /**
     * Find accounts by status
     */
    List<Account> findByStatus(Account.AccountStatus status);
}