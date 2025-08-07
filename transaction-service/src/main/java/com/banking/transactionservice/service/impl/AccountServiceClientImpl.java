package com.banking.transactionservice.service.impl;


import com.banking.transactionservice.dto.AccountDto;
import com.banking.transactionservice.exception.AccountNotFoundException;
import com.banking.transactionservice.exception.AccountServiceException;
import com.banking.transactionservice.service.AccountServiceClient;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class AccountServiceClientImpl implements AccountServiceClient {
    private final RestTemplate restTemplate;

    @Value("${account-service.url}")
    private String accountServiceUrl;

    @Override
    public boolean accountExists(String accountId) {
        try {
            log.debug("Checking if account exists: {}", accountId);
            String url = accountServiceUrl + "/api/v1/accounts/" + accountId;
            ResponseEntity<Object> response = restTemplate.getForEntity(url, Object.class);

            boolean exists = response.getStatusCode().is2xxSuccessful();
            log.debug("Account {} exists: {}", accountId, exists);
            return exists;

        } catch (HttpClientErrorException e) {
            // Handle all HTTP client errors here
            if (e.getStatusCode() == HttpStatus.NOT_FOUND) {
                log.debug("Account {} not found", accountId);
                return false;
            } else {
                // For other HTTP errors (500, 400, etc.), throw an exception
                log.error("HTTP error checking account {}: {} - {}", accountId, e.getStatusCode(), e.getResponseBodyAsString());
                throw new AccountServiceException("Failed to check account existence: " + e.getStatusCode());
            }
        } catch (ResourceAccessException e) {
            log.error("Failed to connect to Account Service for account {}: {}", accountId, e.getMessage());
            throw new AccountServiceException("Account Service is unavailable", e);
        } catch (Exception e) {
            log.error("Unexpected error checking account {}: {}", accountId, e.getMessage());
            throw new AccountServiceException("Failed to check account existence", e);
        }
    }

    @Override
    public void updateAccountBalance(String accountId, BigDecimal newBalance) {
        try {
            log.debug("Updating balance for account {} to: {}", accountId, newBalance);
            String url = accountServiceUrl + "/api/v1/accounts/" + accountId + "/balance";

            Map<String, BigDecimal> requestBody = Map.of("balance", newBalance);
            HttpEntity<Map<String, BigDecimal>> request = new HttpEntity<>(requestBody);

            restTemplate.exchange(url, HttpMethod.PUT, request, Void.class);
            log.info("Successfully updated balance for account {}", accountId);

        } catch (HttpClientErrorException e) {
            if (e.getStatusCode() == HttpStatus.NOT_FOUND) {
                log.error("Account {} not found when updating balance", accountId);
                throw new AccountNotFoundException("Account not found: " + accountId);
            } else {
                log.error("HTTP error updating balance for account {}: {} - {}", accountId, e.getStatusCode(), e.getResponseBodyAsString());
                throw new AccountServiceException("Failed to update account balance: " + e.getStatusCode());
            }
        } catch (ResourceAccessException e) {
            log.error("Failed to connect to Account Service for updating balance of account {}: {}", accountId, e.getMessage());
            throw new AccountServiceException("Account Service is unavailable", e);
        } catch (Exception e) {
            log.error("Unexpected error updating balance for account {}: {}", accountId, e.getMessage());
            throw new AccountServiceException("Failed to update account balance", e);
        }
    }

    @Override
    public BigDecimal getAccountBalance(String accountId) {
        try {
            log.debug("Getting balance for account: {}", accountId);
            String url = accountServiceUrl + "/api/v1/accounts/" + accountId + "/balance";
            ResponseEntity<Map> response = restTemplate.getForEntity(url, Map.class);

            Map<String, Object> balanceResponse = response.getBody();
            if (balanceResponse == null || !balanceResponse.containsKey("balance")) {
                throw new AccountServiceException("Invalid balance response format");
            }

            BigDecimal balance = new BigDecimal(balanceResponse.get("balance").toString());
            log.debug("Retrieved balance for account {}: {}", accountId, balance);
            return balance;

        } catch (HttpClientErrorException e) {
            if (e.getStatusCode() == HttpStatus.NOT_FOUND) {
                log.error("Account {} not found when getting balance", accountId);
                throw new AccountNotFoundException("Account not found: " + accountId);
            } else {
                log.error("HTTP error getting balance for account {}: {} - {}", accountId, e.getStatusCode(), e.getResponseBodyAsString());
                throw new AccountServiceException("Failed to get account balance: " + e.getStatusCode());
            }
        } catch (ResourceAccessException e) {
            log.error("Failed to connect to Account Service for balance of account {}: {}", accountId, e.getMessage());
            throw new AccountServiceException("Account Service is unavailable", e);
        } catch (Exception e) {
            log.error("Unexpected error getting balance for account {}: {}", accountId, e.getMessage());
            throw new AccountServiceException("Failed to get account balance", e);
        }
    }

    @Override
    public AccountDto getAccount(String accountId) {
        try {
            log.debug("Getting account details for: {}", accountId);
            String url = accountServiceUrl + "/api/v1/accounts/" + accountId;
            ResponseEntity<AccountDto> response = restTemplate.getForEntity(url, AccountDto.class);

            AccountDto account = response.getBody();
            log.debug("Retrieved account details for {}: {}", accountId, account);
            return account;

        } catch (HttpClientErrorException e) {
            // Handle all HTTP client errors here - THIS WAS THE MISSING PART
            if (e.getStatusCode() == HttpStatus.NOT_FOUND) {
                log.error("Account {} not found when getting account details", accountId);
                throw new AccountNotFoundException("Account not found: " + accountId);
            } else {
                // For other HTTP errors, throw AccountServiceException
                log.error("HTTP error getting account {}: {} - {}", accountId, e.getStatusCode(), e.getResponseBodyAsString());
                throw new AccountServiceException("Failed to get account details: " + e.getStatusCode());
            }
        } catch (ResourceAccessException e) {
            log.error("Failed to connect to Account Service for account {}: {}", accountId, e.getMessage());
            throw new AccountServiceException("Account Service is unavailable", e);
        } catch (Exception e) {
            log.error("Unexpected error getting account {}: {}", accountId, e.getMessage());
            throw new AccountServiceException("Failed to get account details", e);
        }
    }
}