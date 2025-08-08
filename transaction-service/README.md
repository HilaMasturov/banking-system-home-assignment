# Transaction Service

A Spring Boot microservice responsible for processing banking transactions including deposits, withdrawals, transfers, and transaction history management. This service ensures transaction integrity and provides comprehensive transaction tracking capabilities.

## 🏗️ Architecture

The Transaction Service is a RESTful microservice that handles:

- **Transaction Processing**: Deposits, withdrawals, and transfers
- **Balance Validation**: Ensure sufficient funds before transactions
- **Transaction History**: Comprehensive transaction tracking and querying
- **Account Integration**: Communicates with Account Service for balance updates
- **Transaction Deduplication**: Prevents duplicate transfer entries

## 🚀 Quick Start

### Prerequisites

- **Java 21** or higher
- **Maven 3.8+**
- **MongoDB 4.4+** (local or Atlas)
- **Account Service** running on port 8081

### 1. Configuration Setup

Create `src/main/resources/secrets.properties`:

```properties
# For local MongoDB
mongodb.uri=mongodb://localhost:27017/banking_transactions

# For MongoDB Atlas
mongodb.uri=mongodb+srv://username:password@cluster.mongodb.net/banking_transactions
```

### 2. Start the Service

```bash
# Build the project
mvn clean install

# Run the service
mvn spring-boot:run
```

The service will be available at: **http://localhost:8082**

### 3. Verify Setup

```bash
# Health check
curl http://localhost:8082/actuator/health

# API documentation
open http://localhost:8082/swagger-ui.html
```

## 📊 API Endpoints

### Transaction Processing

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/transactions/deposit` | Deposit money to account |
| `POST` | `/api/v1/transactions/withdraw` | Withdraw money from account |
| `POST` | `/api/v1/transactions/transfer` | Transfer money between accounts |
| `GET` | `/api/v1/transactions/account/{accountId}` | Get transaction history |
| `GET` | `/api/v1/transactions/{transactionId}` | Get transaction details |

## 📝 Request/Response Examples

### Deposit Transaction

```bash
curl -X POST http://localhost:8082/api/v1/transactions/deposit \
  -H "Content-Type: application/json" \
  -d '{
    "accountId": "507f1f77bcf86cd799439012",
    "amount": 500.00,
    "currency": "USD",
    "description": "Salary deposit"
  }'
```

**Response:**
```json
{
  "transactionId": "507f1f77bcf86cd799439013",
  "toAccountId": "507f1f77bcf86cd799439012",
  "amount": 500.00,
  "currency": "USD",
  "type": "DEPOSIT",
  "status": "COMPLETED",
  "description": "Salary deposit",
  "createdAt": "2024-01-15T10:30:00Z"
}
```

### Withdraw Transaction

```bash
curl -X POST http://localhost:8082/api/v1/transactions/withdraw \
  -H "Content-Type: application/json" \
  -d '{
    "accountId": "507f1f77bcf86cd799439012",
    "amount": 100.00,
    "currency": "USD",
    "description": "ATM withdrawal"
  }'
```

**Response:**
```json
{
  "transactionId": "507f1f77bcf86cd799439014",
  "fromAccountId": "507f1f77bcf86cd799439012",
  "amount": 100.00,
  "currency": "USD",
  "type": "WITHDRAWAL",
  "status": "COMPLETED",
  "description": "ATM withdrawal",
  "createdAt": "2024-01-15T10:35:00Z"
}
```

### Transfer Transaction

```bash
curl -X POST http://localhost:8082/api/v1/transactions/transfer \
  -H "Content-Type: application/json" \
  -d '{
    "fromAccountId": "507f1f77bcf86cd799439012",
    "toAccountId": "507f1f77bcf86cd799439015",
    "amount": 200.00,
    "currency": "USD",
    "description": "Payment to friend"
  }'
```

**Response:**
```json
{
  "transactionId": "507f1f77bcf86cd799439016",
  "fromAccountId": "507f1f77bcf86cd799439012",
  "toAccountId": "507f1f77bcf86cd799439015",
  "amount": 200.00,
  "currency": "USD",
  "type": "TRANSFER",
  "status": "COMPLETED",
  "description": "Payment to friend",
  "createdAt": "2024-01-15T10:40:00Z"
}
```

### Get Transaction History

```bash
curl "http://localhost:8082/api/v1/transactions/account/507f1f77bcf86cd799439012?page=0&size=10"
```

**Response:**
```json
[
  {
    "transactionId": "507f1f77bcf86cd799439016",
    "fromAccountId": "507f1f77bcf86cd799439012",
    "toAccountId": "507f1f77bcf86cd799439015",
    "amount": 200.00,
    "currency": "USD",
    "type": "TRANSFER",
    "status": "COMPLETED",
    "description": "Payment to friend",
    "createdAt": "2024-01-15T10:40:00Z"
  },
  {
    "transactionId": "507f1f77bcf86cd799439014",
    "fromAccountId": "507f1f77bcf86cd799439012",
    "amount": 100.00,
    "currency": "USD",
    "type": "WITHDRAWAL",
    "status": "COMPLETED",
    "description": "ATM withdrawal",
    "createdAt": "2024-01-15T10:35:00Z"
  }
]
```

## 🏗️ Technical Architecture

### Core Components

```
src/main/java/com/banking/transactionservice/
├── controller/          # REST API endpoints
│   └── TransactionController.java
├── service/            # Business logic layer
│   ├── TransactionService.java
│   ├── AccountServiceClient.java
│   └── impl/
│       ├── TransactionServiceImpl.java
│       └── AccountServiceClientImpl.java
├── repository/         # Data access layer
│   └── TransactionRepository.java
├── entity/            # Domain entities
│   └── Transaction.java
├── dto/               # Data transfer objects
│   ├── DepositRequestDto.java
│   ├── WithdrawRequestDto.java
│   ├── TransferRequestDto.java
│   └── TransactionResponseDto.java
├── mapper/            # Object mapping
│   └── TransactionMapper.java
├── config/            # Configuration classes
│   ├── CacheConfig.java
│   ├── CorrelationIdFilter.java
│   └── ApiVersionConfig.java
└── exception/         # Custom exceptions
    ├── TransactionNotFoundException.java
    ├── InsufficientFundsException.java
    └── AccountServiceException.java
```

### Data Models

#### Transaction Entity
```java
@Document(collection = "transactions")
public class Transaction {
    @Id
    private String transactionId;
    private String fromAccountId;
    private String toAccountId;
    private BigDecimal amount;
    private String currency;
    private TransactionType type;
    private TransactionStatus status;
    private String description;
    private LocalDateTime createdAt;
}
```

#### Transaction Types
- **DEPOSIT**: Money added to account
- **WITHDRAWAL**: Money removed from account
- **TRANSFER**: Money moved between accounts

#### Transaction Status
- **PENDING**: Transaction being processed
- **COMPLETED**: Transaction successful
- **FAILED**: Transaction failed

## ⚙️ Configuration

### Application Properties

```yaml
server:
  port: 8082

spring:
  application:
    name: transaction-service
  data:
    mongodb:
      uri: ${mongodb.uri}
      auto-index-creation: true
  cache:
    caffeine:
      spec: maximumSize=1000,expireAfterAccess=30m

account-service:
  url: http://localhost:8081
  timeout: 5000

logging:
  level:
    com.banking: DEBUG
  pattern:
    console: "%d{yyyy-MM-dd HH:mm:ss} [%thread] %-5level [%X{correlationId:-}] %logger{36} - %msg%n"
  file:
    name: logs/transaction-service.log
    max-size: 10MB
    max-history: 30

management:
  endpoints:
    web:
      exposure:
        include: health,info,metrics,prometheus,caches,cache
```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `mongodb.uri` | MongoDB connection string | `mongodb://localhost:27017/banking_transactions` |
| `server.port` | Service port | `8082` |
| `account-service.url` | Account Service URL | `http://localhost:8081` |

## 🧪 Testing

### Run Tests
```bash
# Run all tests
mvn test

# Run with coverage
mvn clean test jacoco:report
```

### Test Structure
```
src/test/java/com/banking/transactionservice/
├── controller/         # Controller tests
│   └── TransactionControllerTest.java
├── service/           # Service tests
│   ├── TransactionServiceImplTest.java
│   └── AccountServiceClientImplTest.java
├── repository/        # Repository tests
│   └── TransactionRepositoryTest.java
└── integration/      # Integration tests
    └── TransactionServiceIntegrationTest.java
```

### Test Coverage
- **Unit Tests**: Service layer, Repository layer, Controller layer
- **Integration Tests**: End-to-end API testing
- **Repository Tests**: MongoDB integration with Testcontainers

## 🔧 Features

### Transaction Processing
- **Atomic Operations**: Transaction integrity with `@Transactional`
- **Balance Validation**: Check sufficient funds before withdrawals/transfers
- **Account Validation**: Verify account existence and status
- **Real-time Updates**: Immediate balance updates after transactions

### Caching Strategy
- **Transaction History**: Cached for performance
- **Transaction Details**: Cached for quick lookups
- **Cache Eviction**: Automatic cache clearing after transactions

### Logging
- **Structured Logging**: JSON format with correlation IDs
- **Request Tracing**: Correlation IDs for request tracking
- **File Logging**: Rotated log files with size limits

### Monitoring
- **Health Checks**: `/actuator/health`
- **Metrics**: `/actuator/metrics`
- **Cache Statistics**: `/actuator/caches`

## 🐳 Docker Support

### Build Image
```bash
docker build -t transaction-service .
```

### Run Container
```bash
docker run -p 8082:8082 \
  -e MONGODB_URI=mongodb://host.docker.internal:27017/banking_transactions \
  -e ACCOUNT_SERVICE_URL=http://host.docker.internal:8081 \
  transaction-service
```

### Docker Compose
```yaml
transaction-service:
  build: ./transaction-service
  ports:
    - "8082:8082"
  environment:
    - MONGODB_URI=mongodb://mongodb:27017/banking_transactions
    - ACCOUNT_SERVICE_URL=http://account-service:8081
  depends_on:
    - mongodb
    - account-service
```

## 🚨 Troubleshooting

### Common Issues

#### 1. Account Service Communication
```bash
# Test Account Service connectivity
curl http://localhost:8081/actuator/health

# Check Transaction Service logs
tail -f logs/transaction-service.log
```

#### 2. MongoDB Connection
```bash
# Test connection
mongosh "mongodb://localhost:27017/banking_transactions"

# Check logs
tail -f logs/transaction-service.log
```

#### 3. Transaction Failures
```bash
# Check for insufficient funds errors
grep "InsufficientFundsException" logs/transaction-service.log

# Check for account not found errors
grep "AccountNotFoundException" logs/transaction-service.log
```

### Log Analysis
```bash
# View real-time logs
tail -f logs/transaction-service.log

# Search for transaction errors
grep "ERROR" logs/transaction-service.log

# Search for specific transaction
grep "transactionId" logs/transaction-service.log
```

## 📈 Performance

### Transaction Processing
- **Deposit/Withdrawal**: ~50ms (including balance update)
- **Transfer**: ~100ms (including dual balance updates)
- **Transaction History**: ~10ms (cached)

### Database Performance
- **Indexes**: Automatic index creation enabled
- **Connection Pool**: Default Spring Boot configuration
- **Query Optimization**: Optimized for transaction lookups

## 🔐 Security

### Input Validation
- **Request Validation**: `@Valid` annotations on DTOs
- **Amount Validation**: Positive amounts only
- **Currency Validation**: Supported currencies only
- **Account Validation**: Verify account existence and status

### Transaction Security
- **Balance Checks**: Prevent overdrafts
- **Account Status**: Only allow transactions on active accounts
- **Transaction Deduplication**: Prevent duplicate transfers

### Production Considerations
- [ ] Enable HTTPS
- [ ] Implement JWT authentication
- [ ] Add rate limiting
- [ ] Configure CORS policies
- [ ] Set up audit logging

## 📚 API Documentation

### Swagger UI
- **URL**: http://localhost:8082/swagger-ui.html
- **OpenAPI Spec**: http://localhost:8082/api-docs

### Postman Collection
```json
{
  "info": {
    "name": "Transaction Service API",
    "description": "Banking Transaction Processing API"
  },
  "item": [
    {
      "name": "Transactions",
      "item": [
        {
          "name": "Deposit",
          "request": {
            "method": "POST",
            "url": "{{baseUrl}}/api/v1/transactions/deposit"
          }
        },
        {
          "name": "Withdraw",
          "request": {
            "method": "POST",
            "url": "{{baseUrl}}/api/v1/transactions/withdraw"
          }
        },
        {
          "name": "Transfer",
          "request": {
            "method": "POST",
            "url": "{{baseUrl}}/api/v1/transactions/transfer"
          }
        }
      ]
    }
  ]
}
```

## 🤝 Integration

### Account Service Integration
The Transaction Service integrates with the Account Service for:
- **Account Validation**: Verify account exists and is active
- **Balance Updates**: Update account balances after transactions
- **Account Lookups**: Get account details for transaction processing

### Frontend Integration
The Transaction Service provides APIs for:
- **Transaction Processing**: Execute deposits, withdrawals, and transfers
- **Transaction History**: Retrieve transaction history for accounts
- **Transaction Details**: Get detailed information about specific transactions

## 🔄 Transaction Flow

### Deposit Flow
1. **Validate Account**: Check if account exists and is active
2. **Get Current Balance**: Retrieve current account balance
3. **Calculate New Balance**: Add deposit amount to current balance
4. **Create Transaction**: Save transaction record
5. **Update Account Balance**: Update account balance via Account Service
6. **Return Response**: Return transaction details

### Withdrawal Flow
1. **Validate Account**: Check if account exists and is active
2. **Get Current Balance**: Retrieve current account balance
3. **Check Sufficient Funds**: Verify sufficient balance for withdrawal
4. **Calculate New Balance**: Subtract withdrawal amount from current balance
5. **Create Transaction**: Save transaction record
6. **Update Account Balance**: Update account balance via Account Service
7. **Return Response**: Return transaction details

### Transfer Flow
1. **Validate Both Accounts**: Check if both accounts exist and are active
2. **Get Current Balances**: Retrieve balances for both accounts
3. **Check Sufficient Funds**: Verify sufficient balance in source account
4. **Calculate New Balances**: Update balances for both accounts
5. **Create Transaction**: Save transaction record
6. **Update Account Balances**: Update both account balances via Account Service
7. **Return Response**: Return transaction details

## 📊 Error Handling

### Common Errors

| Error | Description | HTTP Status |
|-------|-------------|-------------|
| `InsufficientFundsException` | Insufficient balance for transaction | 400 |
| `AccountNotFoundException` | Account does not exist | 404 |
| `AccountServiceException` | Account service communication error | 503 |
| `TransactionNotFoundException` | Transaction not found | 404 |

### Error Response Format
```json
{
  "timestamp": "2024-01-15T10:30:00Z",
  "status": 400,
  "error": "Bad Request",
  "message": "Insufficient funds for withdrawal",
  "path": "/api/v1/transactions/withdraw"
}
```

---

**Built with Spring Boot, MongoDB, and ❤️**
