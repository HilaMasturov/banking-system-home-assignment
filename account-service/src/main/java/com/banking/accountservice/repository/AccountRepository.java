package com.banking.accountservice.repository;

import com.banking.accountservice.entity.Account;
import com.banking.accountservice.entity.enums.AccountStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AccountRepository extends MongoRepository<Account, String> {


    List<Account> findByCustomerId(String customerId);

    Optional<Account> findByAccountNumber(String accountNumber);

    @Query("{'customerId': ?0, 'status': 'ACTIVE'}")
    List<Account> findActiveAccountsByCustomerId(String customerId);

    boolean existsByAccountNumber(String accountNumber);

    List<Account> findByStatus(AccountStatus status);
}