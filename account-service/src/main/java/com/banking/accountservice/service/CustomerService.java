package com.banking.accountservice.service;

import com.banking.accountservice.dto.CustomerCreateRequest;
import com.banking.accountservice.entity.Customer;

public interface CustomerService {

    Customer findById(String customerId);

    Customer createCustomer(CustomerCreateRequest request);

    boolean existsById(String customerId);

    boolean existsByEmail(String email);
}