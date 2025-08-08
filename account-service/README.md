# Account Service

A Spring Boot microservice responsible for managing customer accounts, account creation, balance tracking, and account status management. This service provides the foundation for the banking system's account management capabilities.

## 🏗️ Architecture

The Account Service is a RESTful microservice that handles:

- **Customer Management**: Create and manage customer profiles
- **Account Management**: Create, update, and manage bank accounts
- **Balance Tracking**: Real-time balance updates and queries
- **Account Status**: Manage account states (Active, Inactive, Blocked)
- **Multi-currency Support**: Handle different currencies per account

## 🚀 Quick Start

### Prerequisites

- **Java 21** or higher
- **Maven 3.8+**
- **MongoDB 4.4+** (local or Atlas)

### 1. Configuration Setup

Create `src/main/resources/secrets.properties`:

```properties
# For local MongoDB
mongodb.uri=mongodb://localhost:27017/banking_accounts

# For MongoDB Atlas
mongodb.uri=mongodb+srv://username:password@cluster.mongodb.net/banking_accounts
```

### 2. Start the Service

```bash
# Build the project
mvn clean install

# Run the service
mvn spring-boot:run
```

The service will be available at: **http://localhost:8081**

### 3. Verify Setup

```bash
# Health check
curl http://localhost:8081/actuator/health

# API documentation
open http://localhost:8081/swagger-ui.html
```

## 📊 API Endpoints

### Customer Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v1/customers` | Get all customers |
| `POST` | `/api/v1/customers` | Create new customer |
| `GET` | `/api/v1/customers/{customerId}` | Get customer by ID |
| `GET` | `/api/v1/customers/{customerId}/exists` | Check if customer exists |
| `GET` | `/api/v1/customers/email/{email}/exists` | Check if email exists |

### Account Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/accounts` | Create new account |
| `GET` | `/api/v1/accounts/{accountId}` | Get account details |
| `GET` | `/api/v1/accounts/customer/{customerId}` | Get customer accounts |
| `PUT` | `/api/v1/accounts/{accountId}` | Update account |
| `GET` | `/api/v1/accounts/{accountId}/balance` | Get account balance |
| `PUT` | `/api/v1/accounts/{accountId}/balance` | Update account balance |
| `GET` | `/api/v1/accounts/{accountId}/exists` | Check if account exists |
| `GET` | `/api/v1/accounts/{accountId}/validate` | Validate account |

## 📝 Request/Response Examples

### Create Customer

```bash
curl -X POST http://localhost:8081/api/v1/customers \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "phoneNumber": "+1234567890"
  }'
```

**Response:**
```json
{
  "customerId": "507f1f77bcf86cd799439011",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "phoneNumber": "+1234567890",
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

### Create Account

```bash
curl -X POST http://localhost:8081/api/v1/accounts \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "507f1f77bcf86cd799439011",
    "accountType": "SAVINGS",
    "currency": "USD",
    "initialDeposit": 1000.00
  }'
```

**Response:**
```json
{
  "accountId": "507f1f77bcf86cd799439012",
  "customerId": "507f1f77bcf86cd799439011",
  "accountNumber": "1234567890",
  "accountType": "SAVINGS",
  "balance": 1000.00,
  "currency": "USD",
  "status": "ACTIVE",
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

### Get Account Balance

```bash
curl http://localhost:8081/api/v1/accounts/507f1f77bcf86cd799439012/balance
```

**Response:**
```json
{
  "balance": 1000.00,
  "currency": "USD"
}
```

## 🏗️ Technical Architecture

### Core Components

```
src/main/java/com/banking/accountservice/
├── controller/          # REST API endpoints
│   ├── AccountController.java
│   └── CustomerController.java
├── service/            # Business logic layer
│   ├── AccountService.java
│   ├── CustomerService.java
│   └── impl/
│       ├── AccountServiceImpl.java
│       └── CustomerServiceImpl.java
├── repository/         # Data access layer
│   ├── AccountRepository.java
│   └── CustomerRepository.java
├── entity/            # Domain entities
│   ├── Account.java
│   └── Customer.java
├── dto/               # Data transfer objects
│   ├── AccountCreateRequest.java
│   ├── AccountResponse.java
│   ├── CustomerCreateRequest.java
│   └── CustomerResponse.java
├── mapper/            # Object mapping
│   ├── AccountMapper.java
│   └── CustomerMapper.java
├── config/            # Configuration classes
│   ├── CacheConfig.java
│   ├── CorrelationIdFilter.java
│   └── ApiVersionConfig.java
└── exception/         # Custom exceptions
    ├── AccountNotFoundException.java
    └── CustomerNotFoundException.java
```

### Data Models

#### Account Entity
```java
@Document(collection = "accounts")
public class Account {
    @Id
    private String accountId;
    private String customerId;
    private String accountNumber;
    private AccountType accountType;
    private BigDecimal balance;
    private String currency;
    private AccountStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
```

#### Customer Entity
```java
@Document(collection = "customers")
public class Customer {
    @Id
    private String customerId;
    private String firstName;
    private String lastName;
    private String email;
    private String phoneNumber;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
```

## ⚙️ Configuration

### Application Properties

```yaml
server:
  port: 8081

spring:
  application:
    name: account-service
  data:
    mongodb:
      uri: ${mongodb.uri}
      auto-index-creation: true
  cache:
    caffeine:
      spec: maximumSize=1000,expireAfterAccess=30m

logging:
  level:
    com.banking: DEBUG
  pattern:
    console: "%d{yyyy-MM-dd HH:mm:ss} [%thread] %-5level [%X{correlationId:-}] %logger{36} - %msg%n"
  file:
    name: logs/account-service.log
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
| `mongodb.uri` | MongoDB connection string | `mongodb://localhost:27017/banking_accounts` |
| `server.port` | Service port | `8081` |

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
src/test/java/com/banking/accountservice/
├── controller/         # Controller tests
│   ├── AccountControllerTest.java
│   └── CustomerControllerTest.java
├── service/           # Service tests
│   ├── AccountServiceTest.java
│   └── CustomerServiceTest.java
├── repository/        # Repository tests
│   ├── AccountRepositoryTest.java
│   └── CustomerRepositoryTest.java
└── integration/      # Integration tests
    └── AccountServiceIntegrationTest.java
```

### Test Coverage
- **Unit Tests**: Service layer, Repository layer, Controller layer
- **Integration Tests**: End-to-end API testing
- **Repository Tests**: MongoDB integration with Testcontainers

## 🔧 Features

### Caching Strategy
- **Customer Data**: Cached for performance
- **Account Existence**: Cached for validation
- **Account Details**: No caching (real-time balance updates)

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
docker build -t account-service .
```

### Run Container
```bash
docker run -p 8081:8081 \
  -e MONGODB_URI=mongodb://host.docker.internal:27017/banking_accounts \
  account-service
```

### Docker Compose
```yaml
account-service:
  build: ./account-service
  ports:
    - "8081:8081"
  environment:
    - MONGODB_URI=mongodb://mongodb:27017/banking_accounts
  depends_on:
    - mongodb
```

## 🚨 Troubleshooting

### Common Issues

#### 1. MongoDB Connection
```bash
# Test connection
mongosh "mongodb://localhost:27017/banking_accounts"

# Check logs
tail -f logs/account-service.log
```

#### 2. Port Conflicts
```bash
# Check port usage
lsof -i :8081

# Kill process if needed
kill -9 <PID>
```

#### 3. Cache Issues
```bash
# Clear cache via actuator
curl -X DELETE http://localhost:8081/actuator/caches

# Restart service
mvn spring-boot:run
```

### Log Analysis
```bash
# View real-time logs
tail -f logs/account-service.log

# Search for errors
grep "ERROR" logs/account-service.log

# Search for specific customer
grep "customerId" logs/account-service.log
```

## 📈 Performance

### Caching Performance
- **Customer Lookups**: ~1ms (cached)
- **Account Validation**: ~1ms (cached)
- **Balance Queries**: ~5ms (database)

### Database Performance
- **Indexes**: Automatic index creation enabled
- **Connection Pool**: Default Spring Boot configuration
- **Query Optimization**: Optimized for frequent lookups

## 🔐 Security

### Input Validation
- **Request Validation**: `@Valid` annotations on DTOs
- **Data Sanitization**: Input cleaning and validation
- **Error Handling**: Secure error messages

### Production Considerations
- [ ] Enable HTTPS
- [ ] Implement JWT authentication
- [ ] Add rate limiting
- [ ] Configure CORS policies
- [ ] Set up audit logging

## 📚 API Documentation

### Swagger UI
- **URL**: http://localhost:8081/swagger-ui.html
- **OpenAPI Spec**: http://localhost:8081/api-docs

### Postman Collection
```json
{
  "info": {
    "name": "Account Service API",
    "description": "Banking Account Management API"
  },
  "item": [
    {
      "name": "Customers",
      "item": [
        {
          "name": "Create Customer",
          "request": {
            "method": "POST",
            "url": "{{baseUrl}}/api/v1/customers"
          }
        }
      ]
    }
  ]
}
```

## 🤝 Integration

### Transaction Service Integration
The Account Service is consumed by the Transaction Service for:
- **Account Validation**: Verify account exists and is active
- **Balance Updates**: Update account balances after transactions
- **Account Lookups**: Get account details for transaction processing

### Frontend Integration
The Account Service provides APIs for:
- **Customer Management**: Create and manage customers
- **Account Management**: Create and manage accounts
- **Balance Queries**: Get real-time account balances

---

**Built with Spring Boot, MongoDB, and ❤️**
