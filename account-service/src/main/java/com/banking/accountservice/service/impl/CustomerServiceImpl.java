package com.banking.accountservice.service.impl;


import com.banking.accountservice.dto.CustomerCreateRequest;
import com.banking.accountservice.entity.Customer;
import com.banking.accountservice.exception.CustomerNotFoundException;
import com.banking.accountservice.repository.CustomerRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.banking.accountservice.service.CustomerService;
import java.time.LocalDateTime;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class CustomerServiceImpl implements CustomerService {

    private final CustomerRepository customerRepository;

    @Override
    @Cacheable(value = "customers", key = "#customerId")
    public Customer findById(String customerId) {
        log.debug("Finding customer by ID: {}", customerId);
        return customerRepository.findById(customerId)
                .orElseThrow(() -> new CustomerNotFoundException("Customer not found with ID: " + customerId));
    }

    @Override
    public Customer createCustomer(CustomerCreateRequest request) {
        log.debug("Creating new customer with email: {}", request.getEmail());

        if (customerRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Customer with email already exists: " + request.getEmail());
        }

        Customer customer = Customer.builder()
                .customerId(UUID.randomUUID().toString())
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .phoneNumber(request.getPhoneNumber())
                .createdAt(LocalDateTime.now())
                .build();

        Customer savedCustomer = customerRepository.save(customer);
        log.info("Created customer with ID: {}", savedCustomer.getCustomerId());
        return savedCustomer;
    }

    @Override
    public boolean existsById(String customerId) {
        log.debug("Checking if customer exists with ID: {}", customerId);
        return customerRepository.existsById(customerId);
    }

    @Override
    public boolean existsByEmail(String email) {
        log.debug("Checking if customer exists with email: {}", email);
        return customerRepository.existsByEmail(email);
    }
}
