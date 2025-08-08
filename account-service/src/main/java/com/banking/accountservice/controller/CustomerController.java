package com.banking.accountservice.controller;

import com.banking.accountservice.dto.CustomerCreateRequest;
import com.banking.accountservice.dto.CustomerResponse;
import com.banking.accountservice.entity.Customer;
import com.banking.accountservice.service.CustomerService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/customers")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Customer Management", description = "APIs for managing customers")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class CustomerController {

    private final CustomerService customerService;

    @PostMapping
    @Operation(summary = "Create new customer", description = "Creates a new customer")
    @ApiResponse(responseCode = "201", description = "Customer created successfully")
    @ApiResponse(responseCode = "400", description = "Invalid request data")
    public ResponseEntity<CustomerResponse> createCustomer(
            @Valid @RequestBody CustomerCreateRequest request) {
        log.info("Creating new customer with email: {}", request.getEmail());
        Customer customer = customerService.createCustomer(request);
        CustomerResponse response = mapToResponse(customer);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{customerId}")
    @Operation(summary = "Get customer details", description = "Retrieves customer information by ID")
    @ApiResponse(responseCode = "200", description = "Customer found")
    @ApiResponse(responseCode = "404", description = "Customer not found")
    public ResponseEntity<CustomerResponse> getCustomer(
            @Parameter(description = "Customer ID") @PathVariable String customerId) {
        log.info("Retrieving customer: {}", customerId);
        Customer customer = customerService.findById(customerId);
        CustomerResponse response = mapToResponse(customer);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    @Operation(summary = "Get all customers", description = "Retrieves all customers")
    @ApiResponse(responseCode = "200", description = "Customers retrieved successfully")
    public ResponseEntity<List<CustomerResponse>> getAllCustomers() {
        log.info("Retrieving all customers");
        List<Customer> customers = customerService.findAll();
        List<CustomerResponse> responses = customers.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/{customerId}/exists")
    @Operation(summary = "Check if customer exists", description = "Checks if a customer exists by ID")
    @ApiResponse(responseCode = "200", description = "Customer existence checked")
    public ResponseEntity<Map<String, Boolean>> customerExists(
            @Parameter(description = "Customer ID") @PathVariable String customerId) {
        log.info("Checking if customer exists: {}", customerId);
        boolean exists = customerService.existsById(customerId);
        return ResponseEntity.ok(Map.of("exists", exists));
    }

    @GetMapping("/email/{email}/exists")
    @Operation(summary = "Check if customer exists by email", description = "Checks if a customer exists by email")
    @ApiResponse(responseCode = "200", description = "Customer existence checked")
    public ResponseEntity<Map<String, Boolean>> customerExistsByEmail(
            @Parameter(description = "Email") @PathVariable String email) {
        log.info("Checking if customer exists by email: {}", email);
        boolean exists = customerService.existsByEmail(email);
        return ResponseEntity.ok(Map.of("exists", exists));
    }

    private CustomerResponse mapToResponse(Customer customer) {
        return CustomerResponse.builder()
                .customerId(customer.getCustomerId())
                .firstName(customer.getFirstName())
                .lastName(customer.getLastName())
                .email(customer.getEmail())
                .phoneNumber(customer.getPhoneNumber())
                .createdAt(customer.getCreatedAt())
                .build();
    }
}
