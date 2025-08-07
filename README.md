# Banking System - Microservices Architecture

A complete banking system built with microservices architecture consisting of two Spring Boot services and a React frontend. The system handles account management and transaction processing with modern banking operations.

## Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React         │───▶│   Account       │───▶│   MongoDB       │
│   Frontend      │    │   Service       │    │   Database      │
│   (Port 3000)   │    │   (Port 8081)   │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                               │
                               ▼
                       ┌─────────────────┐    ┌─────────────────┐
                       │ Transaction     │───▶│   MongoDB       │
                       │   Service       │    │   Database      │
                       │   (Port 8082)   │    │                 │
                       └─────────────────┘    └─────────────────┘
```

## Services

### Account Service (Port 8081)
Manages customer accounts, account creation, balance tracking, and account status management.

**Key Features:**
- Customer account management
- Account balance tracking
- Account status management (Active, Inactive, Blocked)
- Support for different account types (Savings, Checking)
- Caffeine caching for performance optimization

### Transaction Service (Port 8082)
Handles all banking transactions including deposits, withdrawals, transfers, and transaction history.

**Key Features:**
- Deposit money to accounts
- Withdraw money from accounts with balance validation
- Transfer money between accounts
- Transaction history with pagination
- Transaction integrity and validation

## Technology Stack

- **Java 21**
- **Spring Boot 3.2+**
- **Spring Data MongoDB** for data persistence
- **Caffeine Cache** for performance optimization
- **Lombok** for reducing boilerplate code
- **Maven** for build management
- **Swagger/OpenAPI 3** for API documentation
- **JUnit 5 & Mockito** for comprehensive testing
- **React 18+** for frontend (optional)

## Prerequisites

- Java 21 or higher
- Maven 3.8+
- MongoDB 4.4+ (local) or MongoDB Atlas
- Node.js 16+ (for frontend development)

## Quick Start

### 1. Clone the Repository
```bash
git clone <repository-url>
cd banking-system
```

### 2. Database Setup

#### Option A: Local MongoDB
```bash
# Install and start MongoDB
brew install mongodb/brew/mongodb-community
brew services start mongodb-community
```

#### Option B: MongoDB Atlas (Recommended)
1. Create account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a cluster and get connection string
3. Update `application.yml` in both services

### 3. Start the Services

#### Account Service
```bash
cd account-service
mvn clean install
mvn spring-boot:run
```
Service will be available at: http://localhost:8081

#### Transaction Service
```bash
cd transaction-service
mvn clean install
mvn spring-boot:run
```
Service will be available at: http://localhost:8082

### 4. Verify Setup

#### Health Checks
```bash
# Account Service
curl http://localhost:8081/actuator/health

# Transaction Service
curl http://localhost:8082/actuator/health
```

#### API Documentation
- Account Service: http://localhost:8081/swagger-ui.html
- Transaction Service: http://localhost:8082/swagger-ui.html

## API Endpoints

### Account Service (Port 8081)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/accounts` | Create a new account |
| GET | `/api/v1/accounts/{accountId}` | Get account details |
| GET | `/api/v1/accounts/customer/{customerId}` | Get accounts by customer |
| PUT | `/api/v1/accounts/{accountId}` | Update account details |
| GET | `/api/v1/accounts/{accountId}/balance` | Get account balance |

### Transaction Service (Port 8082)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/transactions/deposit` | Deposit money to account |
| POST | `/api/v1/transactions/withdraw` | Withdraw money from account |
| POST | `/api/v1/transactions/transfer` | Transfer money between accounts |
| GET | `/api/v1/transactions/account/{accountId}` | Get transaction history |
| GET | `/api/v1/transactions/{transactionId}` | Get transaction details |

## Configuration

### Account Service Configuration

Update `account-service/src/main/resources/application.yml`:

```yaml
server:
  port: 8081

spring:
  application:
    name: account-service
  data:
    mongodb:
      uri: mongodb://localhost:27017/banking_accounts
      # For MongoDB Atlas:
      # uri: mongodb+srv://username:password@cluster.mongodb.net/banking_accounts

logging:
  level:
    com.banking.accountservice: DEBUG
```

### Transaction Service Configuration

Update `transaction-service/src/main/resources/application.yml`:

```yaml
server:
  port: 8082

spring:
  application:
    name: transaction-service
  data:
    mongodb:
      uri: mongodb://localhost:27017/banking_transactions

account-service:
  url: http://localhost:8081

logging:
  level:
    com.banking.transactionservice: DEBUG
```

## Testing

### Run All Tests
```bash
# Account Service
cd account-service
mvn test

# Transaction Service
cd transaction-service
mvn test
```

### Generate Coverage Report
```bash
mvn clean test jacoco:report
```

Coverage reports available at:
- Account Service: `account-service/target/site/jacoco/index.html`
- Transaction Service: `transaction-service/target/site/jacoco/index.html`

### Test Categories
- **Unit Tests**: Service layer, Repository layer, Controller layer
- **Integration Tests**: End-to-end API testing
- **Contract Tests**: Service-to-service communication

## Docker Support

### Build Images
```bash
# Account Service
cd account-service
docker build -t account-service .

# Transaction Service
cd transaction-service
docker build -t transaction-service .
```

### Docker Compose
```bash
# From project root
docker-compose up
```

Example `docker-compose.yml`:
```yaml
version: '3.8'
services:
  mongodb:
    image: mongo:7.0
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db

  account-service:
    build: ./account-service
    ports:
      - "8081:8081"
    depends_on:
      - mongodb
    environment:
      - SPRING_DATA_MONGODB_URI=mongodb://mongodb:27017/banking_accounts

  transaction-service:
    build: ./transaction-service
    ports:
      - "8082:8082"
    depends_on:
      - mongodb
      - account-service
    environment:
      - SPRING_DATA_MONGODB_URI=mongodb://mongodb:27017/banking_transactions
      - ACCOUNT_SERVICE_URL=http://account-service:8081

volumes:
  mongodb_data:
```

## Development

### Project Structure
```
banking-system/
├── account-service/
│   ├── src/main/java/com/banking/accountservice/
│   ├── src/test/java/
│   ├── pom.xml
│   └── README.md
├── transaction-service/
│   ├── src/main/java/com/banking/transactionservice/
│   ├── src/test/java/
│   ├── pom.xml
│   └── README.md
├── frontend/ (optional)
│   ├── src/
│   ├── package.json
│   └── README.md
├── docker-compose.yml
└── README.md
```

### Adding New Features

1. **Create Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Implement Changes**
    - Add business logic in service layer
    - Create/update DTOs and entities
    - Add REST endpoints in controllers
    - Write comprehensive tests

3. **Test Changes**
   ```bash
   mvn clean test
   ```

4. **Update Documentation**
    - Update API documentation
    - Add/update README sections
    - Update Swagger annotations

## Monitoring and Observability

### Health Endpoints
- Account Service Health: `http://localhost:8081/actuator/health`
- Transaction Service Health: `http://localhost:8082/actuator/health`

### Metrics
- Account Service Metrics: `http://localhost:8081/actuator/metrics`
- Transaction Service Metrics: `http://localhost:8082/actuator/metrics`

### Logging
Both services include structured logging with correlation IDs for request tracing.

## Troubleshooting

### Common Issues

1. **Service Communication Issues**
   ```bash
   # Check if Account Service is accessible from Transaction Service
   curl http://localhost:8081/actuator/health
   ```

2. **MongoDB Connection Issues**
   ```bash
   # Test MongoDB connection
   mongosh "mongodb://localhost:27017/banking_accounts"
   ```

3. **Port Conflicts**
   ```bash
   # Check which ports are in use
   lsof -i :8081
   lsof -i :8082
   ```

4. **Cache Issues**
   ```bash
   # Clear Maven cache and rebuild
   mvn clean install -U
   ```

### Service Dependencies

**Transaction Service depends on Account Service**
- Ensure Account Service is running before starting Transaction Service
- Transaction Service validates account existence through Account Service APIs

## Performance Considerations

### Caching Strategy
- **Account Service**: Caches account details, customer accounts, and balances
- **Transaction Service**: Caches transaction history and individual transactions

### Database Optimization
- Proper indexing on frequently queried fields
- Separate databases for each service
- Connection pooling configured

## Security Notes

- Services communicate over HTTP (configure HTTPS for production)
- Input validation on all endpoints
- Proper error handling without exposing sensitive information
- Consider implementing JWT authentication for production use

## Production Deployment

### Environment Variables

| Service | Variable | Description |
|---------|----------|-------------|
| Account | `SPRING_DATA_MONGODB_URI` | MongoDB connection string |
| Account | `SERVER_PORT` | Service port (default: 8081) |
| Transaction | `SPRING_DATA_MONGODB_URI` | MongoDB connection string |
| Transaction | `SERVER_PORT` | Service port (default: 8082) |
| Transaction | `ACCOUNT_SERVICE_URL` | Account Service URL |

### Deployment Checklist

- [ ] Configure production MongoDB cluster
- [ ] Set up proper logging aggregation
- [ ] Configure health check endpoints
- [ ] Set up monitoring and alerting
- [ ] Configure load balancers
- [ ] Set up CI/CD pipelines
- [ ] Configure backup strategies

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is for educational purposes as part of a home assignment.