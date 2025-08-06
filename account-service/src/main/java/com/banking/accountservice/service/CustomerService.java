package com.banking.accountservice.service;

import com.banking.accountservice.dto.CustomerCreateRequest;
import com.banking.accountservice.exception.CustomerNotFoundException;
import com.banking.accountservice.model.entity.Customer;
import com.banking.accountservice.repository.CustomerRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class CustomerService {

    private final CustomerRepository customerRepository;

    @Cacheable(value = "customers", key = "#customerId")
    public Customer findById(String customerId) {
        log.debug("Finding customer by ID: {}", customerId);
        return customerRepository.findById(customerId)
                .orElseThrow(() -> new CustomerNotFoundException("Customer not found with ID: " + customerId));
    }

    public Customer createCustomer(CustomerCreateRequest request) {
        log.debug("Creating new customer with email: {}", request.getEmail());

        if (customerRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Customer with email already exists: " + request.getEmail());
        }

        Customer customer = Customer.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .phoneNumber(request.getPhoneNumber())
                .build();

        Customer savedCustomer = customerRepository.save(customer);
        log.info("Created customer with ID: {}", savedCustomer.getCustomerId());
        return savedCustomer;
    }
}
