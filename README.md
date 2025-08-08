# Banking System - Microservices Architecture

A modern banking system built with microservices architecture, featuring real-time transaction processing, customer management, and a responsive React frontend. The system demonstrates best practices in microservices design, caching strategies, and modern web development.

## 🏗️ Architecture Overview

```mermaid
graph TB
    subgraph "Frontend Layer"
        A[React Frontend<br/>Port 3000] --> B[Account Service<br/>Port 8081]
        A --> C[Transaction Service<br/>Port 8082]
    end
    
    subgraph "Backend Services"
        B --> D[(MongoDB<br/>Accounts DB)]
        C --> E[(MongoDB<br/>Transactions DB)]
        C --> B
    end
    
    subgraph "Infrastructure"
        F[Docker Compose] --> G[Containerized Services]
        H[Cache Layer<br/>Caffeine] --> I[Performance Optimization]
    end
    
    style A fill:#61dafb
    style B fill:#6db33f
    style C fill:#6db33f
    style D fill:#4db33f
    style E fill:#4db33f
```

## 🚀 Quick Start

### Prerequisites

- **Java 21** or higher
- **Maven 3.8+**
- **MongoDB 4.4+** (local or Atlas)
- **Node.js 18+** (for frontend)
- **Git**

### 1. Clone the Repository

```bash
git clone <repository-url>
cd banking-system-home-assignment
```

### 2. Database Setup

#### Option A: Local MongoDB (Recommended for Development)
```bash
# macOS
brew install mongodb/brew/mongodb-community
brew services start mongodb-community

# Ubuntu/Debian
sudo apt-get install mongodb
sudo systemctl start mongodb

# Windows
# Download and install from https://www.mongodb.com/try/download/community

# Verify MongoDB is running
mongosh --eval "db.runCommand('ping')"
```

#### Option B: MongoDB Atlas (For Production/Cloud)
1. Create account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a cluster and get connection string
3. Create `secrets.properties` files (see Configuration section)

### 3. Database Initialization

When you create a new MongoDB cluster, you'll need to initialize the databases and collections. The services will create them automatically when they start, but you can also initialize them manually:

#### Manual Database Setup

Connect to your MongoDB instance and run these commands:

```javascript
// Connect to MongoDB
mongosh

// Create databases
use banking_accounts
use banking_transactions

// Create collections with indexes
use banking_accounts
db.createCollection("accounts")
db.createCollection("customers")

// Create indexes for better performance
db.accounts.createIndex({ "accountId": 1 }, { unique: true })
db.accounts.createIndex({ "customerId": 1 })
db.accounts.createIndex({ "accountNumber": 1 }, { unique: true })
db.customers.createIndex({ "customerId": 1 }, { unique: true })
db.customers.createIndex({ "email": 1 }, { unique: true })

// Switch to transactions database
use banking_transactions
db.createCollection("transactions")

// Create indexes for transactions
db.transactions.createIndex({ "transactionId": 1 }, { unique: true })
db.transactions.createIndex({ "accountId": 1 })
db.transactions.createIndex({ "fromAccountId": 1 })
db.transactions.createIndex({ "toAccountId": 1 })
db.transactions.createIndex({ "createdAt": -1 })
```

#### Automatic Database Setup

The services will automatically create the required databases and collections when they start for the first time. You can also use the provided initialization script:

```bash
# Run database initialization script (recommended for local setup)
./scripts/init-databases.sh

# Or manually connect and run the commands
mongosh
use banking_accounts
use banking_transactions
exit
```

### 4. Configuration Setup

Create `secrets.properties` files in both service directories:

**account-service/src/main/resources/secrets.properties:**
```properties
# For local MongoDB (default)
mongodb.uri=mongodb://localhost:27017/banking_accounts

# For MongoDB Atlas (uncomment and update):
# mongodb.uri=mongodb+srv://username:password@cluster.mongodb.net/banking_accounts
```

**transaction-service/src/main/resources/secrets.properties:**
```properties
# For local MongoDB (default)
mongodb.uri=mongodb://localhost:27017/banking_transactions

# For MongoDB Atlas (uncomment and update):
# mongodb.uri=mongodb+srv://username:password@cluster.mongodb.net/banking_transactions
```

### 5. Start the Services

#### Backend Services

```bash
# Start Account Service
cd account-service
mvn spring-boot:run

# In a new terminal, start Transaction Service
cd transaction-service
mvn spring-boot:run
```

#### Frontend

```bash
# Start React Frontend
cd frontend
npm install
npm run dev
```

### 6. Verify Setup

- **Account Service**: http://localhost:8081
- **Transaction Service**: http://localhost:8082
- **Frontend**: http://localhost:3000
- **API Documentation**: 
  - Account Service: http://localhost:8081/swagger-ui.html
  - Transaction Service: http://localhost:8082/swagger-ui.html

## 🏦 System Features

### Core Banking Operations
- ✅ **Account Management**: Create, view, and manage customer accounts
- ✅ **Transaction Processing**: Deposits, withdrawals, and transfers
- ✅ **Real-time Balance Updates**: Immediate balance reflection after transactions
- ✅ **Multi-currency Support**: Handle different currencies per account
- ✅ **Customer Management**: Create and manage customer profiles

### Technical Features
- ✅ **Microservices Architecture**: Independent, scalable services
- ✅ **Caching Strategy**: Optimized performance with Caffeine cache
- ✅ **Structured Logging**: Correlation IDs for request tracing
- ✅ **API Versioning**: Consistent v1 API endpoints
- ✅ **Comprehensive Testing**: Unit and integration tests
- ✅ **Docker Support**: Containerized deployment
- ✅ **Health Monitoring**: Actuator endpoints for monitoring

## 📊 Demo Screenshots

### Dashboard View
![Dashboard](https://via.placeholder.com/800x400/4F46E5/FFFFFF?text=Banking+Dashboard)

### Customer Management
![Customer Management](https://via.placeholder.com/800x400/059669/FFFFFF?text=Customer+Management)

### Transaction Processing
![Transaction Processing](https://via.placeholder.com/800x400/DC2626/FFFFFF?text=Transaction+Processing)

### Account Management
![Account Management](https://via.placeholder.com/800x400/7C3AED/FFFFFF?text=Account+Management)

## 🛠️ Technology Stack

### Backend
- **Java 21** - Latest LTS version
- **Spring Boot 3.2+** - Modern framework
- **Spring Data MongoDB** - NoSQL data persistence
- **Caffeine Cache** - High-performance caching
- **Lombok** - Reduced boilerplate
- **Maven** - Build management
- **Swagger/OpenAPI 3** - API documentation
- **JUnit 5 & Mockito** - Testing framework

### Frontend
- **React 18+** - Modern UI library
- **TypeScript** - Type safety
- **Vite** - Fast build tool
- **Tailwind CSS** - Utility-first CSS
- **shadcn/ui** - Modern component library
- **React Query** - Data fetching
- **React Router** - Client-side routing

### Infrastructure
- **MongoDB** - Document database
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration

## 📁 Project Structure

```
banking-system/
├── account-service/           # Account management microservice
│   ├── src/main/java/
│   │   └── com/banking/accountservice/
│   │       ├── controller/    # REST endpoints
│   │       ├── service/       # Business logic
│   │       ├── repository/    # Data access
│   │       ├── dto/          # Data transfer objects
│   │       ├── entity/       # Domain entities
│   │       ├── config/       # Configuration classes
│   │       └── exception/    # Custom exceptions
│   ├── src/main/resources/
│   │   ├── application.yml   # Service configuration
│   │   └── secrets.properties # Database credentials
│   └── pom.xml
├── transaction-service/       # Transaction processing microservice
│   ├── src/main/java/
│   │   └── com/banking/transactionservice/
│   │       ├── controller/    # REST endpoints
│   │       ├── service/       # Business logic
│   │       ├── repository/    # Data access
│   │       ├── dto/          # Data transfer objects
│   │       ├── entity/       # Domain entities
│   │       ├── config/       # Configuration classes
│   │       └── exception/    # Custom exceptions
│   ├── src/main/resources/
│   │   ├── application.yml   # Service configuration
│   │   └── secrets.properties # Database credentials
│   └── pom.xml
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── services/         # API service layer
│   │   ├── pages/           # Page components
│   │   └── utils/           # Utility functions
│   ├── public/              # Static assets
│   └── package.json
├── scripts/                  # Database initialization scripts
│   └── init-databases.sh    # MongoDB setup script
├── docker-compose.yml        # Multi-container setup
└── README.md                # This file
```

## 🗄️ Local Database Support

The project is **fully configured for local MongoDB** by default. This makes development and testing much easier.

### Local MongoDB Setup

1. **Install MongoDB locally** (see Database Setup section)
2. **Start MongoDB service**
3. **Run the initialization script**:
   ```bash
   ./scripts/init-databases.sh
   ```
4. **Start the services** - they will automatically connect to local MongoDB

### Local Database Benefits

- ✅ **No cloud dependencies** - works offline
- ✅ **Faster development** - no network latency
- ✅ **Easy debugging** - direct database access
- ✅ **No costs** - completely free
- ✅ **Full control** - your data stays local

### Local Database Structure

```
MongoDB Local Instance
├── banking_accounts
│   ├── customers (collection)
│   └── accounts (collection)
└── banking_transactions
    └── transactions (collection)
```

### Switching to Atlas (Optional)

If you want to use MongoDB Atlas instead:

1. **Update secrets.properties** files
2. **Comment out local URIs**
3. **Uncomment Atlas URIs**
4. **Update connection strings** with your Atlas credentials

## 🔧 Configuration

| Service | Variable | Description | Default |
|---------|----------|-------------|---------|
| Account | `mongodb.uri` | MongoDB connection string | `mongodb://localhost:27017/banking_accounts` |
| Account | `server.port` | Service port | `8081` |
| Transaction | `mongodb.uri` | MongoDB connection string | `mongodb://localhost:27017/banking_transactions` |
| Transaction | `server.port` | Service port | `8082` |
| Transaction | `account-service.url` | Account Service URL | `http://localhost:8081` |

### Secrets Configuration

Create `secrets.properties` files in both service directories:

```properties
# For local MongoDB
mongodb.uri=mongodb://localhost:27017/banking_accounts

# For MongoDB Atlas
mongodb.uri=mongodb+srv://username:password@cluster.mongodb.net/banking_accounts
```

## 🗄️ Database Schema

### Account Service Database (`banking_accounts`)

#### Customers Collection
```javascript
{
  "_id": ObjectId,
  "customerId": "string",        // Unique customer identifier
  "firstName": "string",         // Customer first name
  "lastName": "string",          // Customer last name
  "email": "string",            // Unique email address
  "phoneNumber": "string",       // Phone number
  "createdAt": "date",          // Creation timestamp
  "updatedAt": "date"           // Last update timestamp
}
```

#### Accounts Collection
```javascript
{
  "_id": ObjectId,
  "accountId": "string",         // Unique account identifier
  "customerId": "string",        // Reference to customer
  "accountNumber": "string",     // Unique account number
  "accountType": "SAVINGS|CHECKING", // Account type
  "balance": "decimal",          // Current balance
  "currency": "string",          // Currency code (USD, EUR, etc.)
  "status": "ACTIVE|INACTIVE|BLOCKED", // Account status
  "createdAt": "date",          // Creation timestamp
  "updatedAt": "date"           // Last update timestamp
}
```

### Transaction Service Database (`banking_transactions`)

#### Transactions Collection
```javascript
{
  "_id": ObjectId,
  "transactionId": "string",     // Unique transaction identifier
  "fromAccountId": "string",     // Source account (for transfers/withdrawals)
  "toAccountId": "string",       // Destination account (for deposits/transfers)
  "amount": "decimal",           // Transaction amount
  "currency": "string",          // Currency code
  "type": "DEPOSIT|WITHDRAWAL|TRANSFER", // Transaction type
  "status": "PENDING|COMPLETED|FAILED", // Transaction status
  "description": "string",       // Transaction description
  "createdAt": "date"           // Creation timestamp
}
```

## 🧪 Testing

### Run All Tests
```bash
# Account Service
cd account-service
mvn test

# Transaction Service
cd transaction-service
mvn test
```

### Test Coverage
```bash
# Generate coverage reports
mvn clean test jacoco:report
```

Coverage reports available at:
- Account Service: `account-service/target/site/jacoco/index.html`
- Transaction Service: `transaction-service/target/site/jacoco/index.html`

## 🐳 Docker Deployment

### Using Docker Compose
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

### Individual Docker Builds
```bash
# Build Account Service
cd account-service
docker build -t account-service .

# Build Transaction Service
cd transaction-service
docker build -t transaction-service .

# Build Frontend
cd frontend
docker build -t banking-frontend .
```

## 📈 Monitoring & Health Checks

### Health Endpoints
- Account Service: `http://localhost:8081/actuator/health`
- Transaction Service: `http://localhost:8082/actuator/health`

### Metrics
- Account Service: `http://localhost:8081/actuator/metrics`
- Transaction Service: `http://localhost:8082/actuator/metrics`

### Cache Statistics
- Account Service: `http://localhost:8081/actuator/caches`
- Transaction Service: `http://localhost:8082/actuator/caches`

## 🔍 API Documentation

### Account Service Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/accounts` | Create new account |
| `GET` | `/api/v1/accounts/{accountId}` | Get account details |
| `GET` | `/api/v1/accounts/customer/{customerId}` | Get customer accounts |
| `PUT` | `/api/v1/accounts/{accountId}` | Update account |
| `GET` | `/api/v1/accounts/{accountId}/balance` | Get account balance |
| `PUT` | `/api/v1/accounts/{accountId}/balance` | Update account balance |
| `GET` | `/api/v1/customers` | Get all customers |
| `POST` | `/api/v1/customers` | Create new customer |

### Transaction Service Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/transactions/deposit` | Deposit money |
| `POST` | `/api/v1/transactions/withdraw` | Withdraw money |
| `POST` | `/api/v1/transactions/transfer` | Transfer money |
| `GET` | `/api/v1/transactions/account/{accountId}` | Get transaction history |
| `GET` | `/api/v1/transactions/{transactionId}` | Get transaction details |

## 🚨 Troubleshooting

### Common Issues

#### 1. MongoDB Connection Issues
```bash
# Test MongoDB connection
mongosh "mongodb://localhost:27017/banking_accounts"

# Check if databases exist
show dbs
use banking_accounts
show collections

# If databases don't exist, run the initialization script
./scripts/init-databases.sh
```

#### 2. Database Not Found
If you get "Database not found" errors, the services will create the databases automatically when they start. You can also manually create them:

```bash
# Connect to MongoDB
mongosh

# Create databases
use banking_accounts
use banking_transactions

# Exit
exit
```

#### 3. Port Conflicts
```bash
# Check which ports are in use
lsof -i :8081
lsof -i :8082
lsof -i :3000
```

#### 4. Service Communication Issues
```bash
# Test Account Service health
curl http://localhost:8081/actuator/health

# Test Transaction Service health
curl http://localhost:8082/actuator/health
```

#### 5. Frontend Build Issues
```bash
# Clear node modules and reinstall
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### Log Files
- Account Service: `account-service/logs/account-service.log`
- Transaction Service: `transaction-service/logs/transaction-service.log`

## 🔐 Security Considerations

### Development Environment
- Services communicate over HTTP (configure HTTPS for production)
- Input validation on all endpoints
- Proper error handling without exposing sensitive information

### Production Deployment
- [ ] Configure HTTPS/TLS
- [ ] Implement JWT authentication
- [ ] Set up proper CORS policies
- [ ] Configure rate limiting
- [ ] Set up monitoring and alerting
- [ ] Implement backup strategies

## 📚 Additional Resources

- [Account Service README](./account-service/README.md)
- [Transaction Service README](./transaction-service/README.md)
- [Frontend README](./frontend/README.md)
- [API Documentation](http://localhost:8081/swagger-ui.html)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is for educational purposes as part of a home assignment.

---

**Built with ❤️ using Spring Boot, React, and MongoDB**