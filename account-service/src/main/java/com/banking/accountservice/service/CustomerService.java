package com.banking.accountservice.service;

import com.banking.accountservice.dto.CustomerCreateRequest;
import com.banking.accountservice.entity.Customer;

import java.util.List;

public interface CustomerService {

    Customer findById(String customerId);

    Customer createCustomer(CustomerCreateRequest request);

    List<Customer> findAll();

    boolean existsById(String customerId);

    boolean existsByEmail(String email);
}