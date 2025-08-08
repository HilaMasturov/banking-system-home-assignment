package com.banking.transactionservice.service;

import com.banking.transactionservice.dto.AccountDto;
import com.banking.transactionservice.exception.AccountNotFoundException;
import com.banking.transactionservice.exception.AccountServiceException;
import com.banking.transactionservice.service.impl.AccountServiceClientImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class AccountServiceClientImplTest {

    @Mock
    private RestTemplate restTemplate;

    @InjectMocks
    private AccountServiceClientImpl accountServiceClient;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(accountServiceClient, "accountServiceUrl", "http://localhost:8081");
    }

    @Test
    void accountExists_ShouldReturnTrue_WhenAccountExists() {
        // Given
        String accountId = "account123";
        ResponseEntity<Object> response = new ResponseEntity<>(new Object(), HttpStatus.OK);
        when(restTemplate.getForEntity(anyString(), eq(Object.class))).thenReturn(response);

        // When
        boolean result = accountServiceClient.accountExists(accountId);

        // Then
        assertThat(result).isTrue();
    }

    @Test
    void accountExists_ShouldReturnFalse_WhenAccountNotFound() {
        // Given
        String accountId = "nonexistent";

        // Create HttpClientErrorException with NOT_FOUND status
        HttpClientErrorException notFoundException = new HttpClientErrorException(HttpStatus.NOT_FOUND, "Not Found");

        when(restTemplate.getForEntity(anyString(), eq(Object.class)))
                .thenThrow(notFoundException);

        // When
        boolean result = accountServiceClient.accountExists(accountId);

        // Then
        assertThat(result).isFalse();
    }

    @Test
    void accountExists_ShouldThrowException_WhenServerError() {
        // Given
        String accountId = "account123";

        HttpClientErrorException serverError = new HttpClientErrorException(HttpStatus.INTERNAL_SERVER_ERROR, "Server Error");

        when(restTemplate.getForEntity(anyString(), eq(Object.class)))
                .thenThrow(serverError);

        // When & Then
        assertThatThrownBy(() -> accountServiceClient.accountExists(accountId))
                .isInstanceOf(AccountServiceException.class)
                .hasMessageContaining("Failed to check account existence: 500");
    }

    @Test
    void getAccountBalance_ShouldReturnBalance_WhenAccountExists() {
        // Given
        String accountId = "account123";
        BigDecimal expectedBalance = new BigDecimal("1000.00");
        Map<String, Object> balanceMap = Map.of("balance", expectedBalance);
        ResponseEntity<Map> response = new ResponseEntity<>(balanceMap, HttpStatus.OK);
        doReturn(response).when(restTemplate).getForEntity(anyString(), eq(Map.class));

        // When
        BigDecimal result = accountServiceClient.getAccountBalance(accountId);

        // Then
        assertThat(result).isEqualByComparingTo(expectedBalance);
        verify(restTemplate).getForEntity(anyString(), eq(Map.class));
    }

    @Test
    void getAccountBalance_ShouldThrowException_WhenAccountNotFound() {
        // Given
        String accountId = "nonexistent";

        HttpClientErrorException notFoundException = new HttpClientErrorException(HttpStatus.NOT_FOUND, "Not Found");

        doThrow(notFoundException).when(restTemplate).getForEntity(anyString(), eq(Map.class));

        // When & Then
        assertThatThrownBy(() -> accountServiceClient.getAccountBalance(accountId))
                .isInstanceOf(AccountNotFoundException.class)
                .hasMessage("Account not found: nonexistent");
    }

    @Test
    void getAccountBalance_ShouldThrowException_WhenServerError() {
        // Given
        String accountId = "account123";

        HttpClientErrorException serverError = new HttpClientErrorException(HttpStatus.INTERNAL_SERVER_ERROR, "Server Error");

        doThrow(serverError).when(restTemplate).getForEntity(anyString(), eq(BigDecimal.class));

        // When & Then
        assertThatThrownBy(() -> accountServiceClient.getAccountBalance(accountId))
                .isInstanceOf(AccountServiceException.class)
                .hasMessageContaining("Failed to get account balance");
    }

    @Test
    void accountExists_ShouldThrowException_WhenServiceUnavailable() {
        // Given
        String accountId = "account123";
        when(restTemplate.getForEntity(anyString(), eq(Object.class)))
                .thenThrow(new ResourceAccessException("Connection refused"));

        // When & Then
        assertThatThrownBy(() -> accountServiceClient.accountExists(accountId))
                .isInstanceOf(AccountServiceException.class)
                .hasMessage("Account Service is unavailable");
    }

    @Test
    void updateAccountBalance_ShouldUpdateSuccessfully_WhenAccountExists() {
        // Given
        String accountId = "account123";
        BigDecimal newBalance = new BigDecimal("1500.00");
        ResponseEntity<Void> response = new ResponseEntity<>(HttpStatus.OK);

        when(restTemplate.exchange(anyString(), eq(HttpMethod.PUT), any(HttpEntity.class), eq(Void.class)))
                .thenReturn(response);

        // When & Then (no exception should be thrown)
        accountServiceClient.updateAccountBalance(accountId, newBalance);

        // Verify the method was called
        verify(restTemplate).exchange(anyString(), eq(HttpMethod.PUT), any(HttpEntity.class), eq(Void.class));
    }

    @Test
    void updateAccountBalance_ShouldThrowException_WhenAccountNotFound() {
        // Given
        String accountId = "nonexistent";
        BigDecimal newBalance = new BigDecimal("1500.00");

        HttpClientErrorException notFoundException = new HttpClientErrorException(HttpStatus.NOT_FOUND, "Not Found");

        when(restTemplate.exchange(anyString(), eq(HttpMethod.PUT), any(HttpEntity.class), eq(Void.class)))
                .thenThrow(notFoundException);

        // When & Then
        assertThatThrownBy(() -> accountServiceClient.updateAccountBalance(accountId, newBalance))
                .isInstanceOf(AccountNotFoundException.class)
                .hasMessage("Account not found: nonexistent");
    }

    @Test
    void updateAccountBalance_ShouldThrowException_WhenServerError() {
        // Given
        String accountId = "account123";
        BigDecimal newBalance = new BigDecimal("1500.00");

        HttpClientErrorException serverError = new HttpClientErrorException(HttpStatus.INTERNAL_SERVER_ERROR, "Server Error");

        when(restTemplate.exchange(anyString(), eq(HttpMethod.PUT), any(HttpEntity.class), eq(Void.class)))
                .thenThrow(serverError);

        // When & Then
        assertThatThrownBy(() -> accountServiceClient.updateAccountBalance(accountId, newBalance))
                .isInstanceOf(AccountServiceException.class)
                .hasMessageContaining("Failed to update account balance: 500");
    }

    @Test
    void updateAccountBalance_ShouldThrowException_WhenServiceUnavailable() {
        // Given
        String accountId = "account123";
        BigDecimal newBalance = new BigDecimal("1500.00");

        when(restTemplate.exchange(anyString(), eq(HttpMethod.PUT), any(HttpEntity.class), eq(Void.class)))
                .thenThrow(new ResourceAccessException("Connection refused"));

        // When & Then
        assertThatThrownBy(() -> accountServiceClient.updateAccountBalance(accountId, newBalance))
                .isInstanceOf(AccountServiceException.class)
                .hasMessage("Account Service is unavailable");
    }

    @Test
    void getAccount_ShouldReturnAccount_WhenAccountExists() {
        // Given
        String accountId = "account123";
        AccountDto expectedAccount = AccountDto.builder()
                .accountId(accountId)
                .customerId("customer123")
                .accountNumber("ACC123456789")
                .balance(new BigDecimal("1000.00"))
                .currency("USD")
                .status("ACTIVE")
                .build();

        ResponseEntity<AccountDto> response = new ResponseEntity<>(expectedAccount, HttpStatus.OK);
        when(restTemplate.getForEntity(anyString(), eq(AccountDto.class))).thenReturn(response);

        // When
        AccountDto result = accountServiceClient.getAccount(accountId);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getAccountId()).isEqualTo(accountId);
        assertThat(result.getCustomerId()).isEqualTo("customer123");
        assertThat(result.getAccountNumber()).isEqualTo("ACC123456789");
        assertThat(result.getBalance()).isEqualByComparingTo(new BigDecimal("1000.00"));
        assertThat(result.getCurrency()).isEqualTo("USD");
        assertThat(result.getStatus()).isEqualTo("ACTIVE");
    }

    @Test
    void getAccount_ShouldThrowException_WhenAccountNotFound() {
        // Given
        String accountId = "nonexistent";

        HttpClientErrorException notFoundException = new HttpClientErrorException(HttpStatus.NOT_FOUND, "Not Found");

        when(restTemplate.getForEntity(anyString(), eq(AccountDto.class)))
                .thenThrow(notFoundException);

        // When & Then
        assertThatThrownBy(() -> accountServiceClient.getAccount(accountId))
                .isInstanceOf(AccountNotFoundException.class)
                .hasMessage("Account not found: nonexistent");
    }

    @Test
    void getAccount_ShouldThrowException_WhenServerError() {
        // Given
        String accountId = "account123";

        HttpClientErrorException serverError = new HttpClientErrorException(HttpStatus.INTERNAL_SERVER_ERROR, "Server Error");

        when(restTemplate.getForEntity(anyString(), eq(AccountDto.class)))
                .thenThrow(serverError);

        // When & Then
        assertThatThrownBy(() -> accountServiceClient.getAccount(accountId))
                .isInstanceOf(AccountServiceException.class)
                .hasMessageContaining("Failed to get account details: 500");
    }

    @Test
    void getAccount_ShouldThrowException_WhenServiceUnavailable() {
        // Given
        String accountId = "account123";

        when(restTemplate.getForEntity(anyString(), eq(AccountDto.class)))
                .thenThrow(new ResourceAccessException("Connection refused"));

        // When & Then
        assertThatThrownBy(() -> accountServiceClient.getAccount(accountId))
                .isInstanceOf(AccountServiceException.class)
                .hasMessage("Account Service is unavailable");
    }

    @Test
    void getAccountBalance_ShouldThrowException_WhenServiceUnavailable() {
        // Given
        String accountId = "account123";

        doThrow(new ResourceAccessException("Connection refused")).when(restTemplate).getForEntity(anyString(), eq(BigDecimal.class));

        // When & Then
        assertThatThrownBy(() -> accountServiceClient.getAccountBalance(accountId))
                .isInstanceOf(AccountServiceException.class)
                .hasMessage("Failed to get account balance");
    }

    @Test
    void getAccountBalance_ShouldThrowException_WhenBadRequest() {
        // Given
        String accountId = "account123";

        HttpClientErrorException badRequestException = new HttpClientErrorException(HttpStatus.BAD_REQUEST, "Bad Request");

        doThrow(badRequestException).when(restTemplate).getForEntity(anyString(), eq(BigDecimal.class));

        // When & Then
        assertThatThrownBy(() -> accountServiceClient.getAccountBalance(accountId))
                .isInstanceOf(AccountServiceException.class)
                .hasMessageContaining("Failed to get account balance");
    }

    @Test
    void updateAccountBalance_ShouldThrowException_WhenBadRequest() {
        // Given
        String accountId = "account123";
        BigDecimal newBalance = new BigDecimal("-100.00"); // Invalid negative balance

        HttpClientErrorException badRequestException = new HttpClientErrorException(HttpStatus.BAD_REQUEST, "Bad Request");

        when(restTemplate.exchange(anyString(), eq(HttpMethod.PUT), any(HttpEntity.class), eq(Void.class)))
                .thenThrow(badRequestException);

        // When & Then
        assertThatThrownBy(() -> accountServiceClient.updateAccountBalance(accountId, newBalance))
                .isInstanceOf(AccountServiceException.class)
                .hasMessageContaining("Failed to update account balance: 400");
    }

    @Test
    void accountExists_ShouldThrowException_WhenBadRequest() {
        // Given
        String accountId = "invalid-format-id";

        HttpClientErrorException badRequestException = new HttpClientErrorException(HttpStatus.BAD_REQUEST, "Bad Request");

        when(restTemplate.getForEntity(anyString(), eq(Object.class)))
                .thenThrow(badRequestException);

        // When & Then
        assertThatThrownBy(() -> accountServiceClient.accountExists(accountId))
                .isInstanceOf(AccountServiceException.class)
                .hasMessageContaining("Failed to check account existence: 400");
    }

    @Test
    void getAccount_ShouldThrowException_WhenBadRequest() {
        // Given
        String accountId = "invalid-format-id";

        HttpClientErrorException badRequestException = new HttpClientErrorException(HttpStatus.BAD_REQUEST, "Bad Request");

        when(restTemplate.getForEntity(anyString(), eq(AccountDto.class)))
                .thenThrow(badRequestException);

        // When & Then
        assertThatThrownBy(() -> accountServiceClient.getAccount(accountId))
                .isInstanceOf(AccountServiceException.class)
                .hasMessageContaining("Failed to get account details: 400");
    }

    @Test
    void accountExists_ShouldThrowException_WhenUnexpectedError() {
        // Given
        String accountId = "account123";

        when(restTemplate.getForEntity(anyString(), eq(Object.class)))
                .thenThrow(new RuntimeException("Unexpected error"));

        // When & Then
        assertThatThrownBy(() -> accountServiceClient.accountExists(accountId))
                .isInstanceOf(AccountServiceException.class)
                .hasMessage("Failed to check account existence");
    }

    @Test
    void getAccountBalance_ShouldThrowException_WhenUnexpectedError() {
        // Given
        String accountId = "account123";

        when(restTemplate.getForEntity(anyString(), eq(BigDecimal.class)))
                .thenThrow(new RuntimeException("Unexpected error"));

        // When & Then
        assertThatThrownBy(() -> accountServiceClient.getAccountBalance(accountId))
                .isInstanceOf(AccountServiceException.class)
                .hasMessage("Failed to get account balance");
    }

    @Test
    void updateAccountBalance_ShouldThrowException_WhenUnexpectedError() {
        // Given
        String accountId = "account123";
        BigDecimal newBalance = new BigDecimal("1500.00");

        when(restTemplate.exchange(anyString(), eq(HttpMethod.PUT), any(HttpEntity.class), eq(Void.class)))
                .thenThrow(new RuntimeException("Unexpected error"));

        // When & Then
        assertThatThrownBy(() -> accountServiceClient.updateAccountBalance(accountId, newBalance))
                .isInstanceOf(AccountServiceException.class)
                .hasMessage("Failed to update account balance");
    }

    @Test
    void getAccount_ShouldThrowException_WhenUnexpectedError() {
        // Given
        String accountId = "account123";

        when(restTemplate.getForEntity(anyString(), eq(AccountDto.class)))
                .thenThrow(new RuntimeException("Unexpected error"));

        // When & Then
        assertThatThrownBy(() -> accountServiceClient.getAccount(accountId))
                .isInstanceOf(AccountServiceException.class)
                .hasMessage("Failed to get account details");
    }
}