# Account Service

The Account Service is a Spring Boot microservice that manages customer accounts in the banking system. It provides REST APIs for account creation, retrieval, updates, and balance management.

## Features

- Create and manage customer accounts
- Account balance tracking
- Account status management (Active, Inactive, Blocked)
- Support for different account types (Savings, Checking)
- Caching with Caffeine for improved performance
- Comprehensive API documentation with Swagger
- MongoDB integration for data persistence

## Technology Stack

- Java 21
- Spring Boot 3.2+
- Spring Data MongoDB
- Caffeine Cache
- Lombok
- Swagger/OpenAPI 3
- JUnit 5 & Mockito

## Prerequisites

- Java 21
- Maven 3.8+
- MongoDB Atlas cluster (or local MongoDB 4.4+)
- Network access to MongoDB Atlas

## Getting Started

### 1. Clone the repository
```bash
git clone <repository-url>
cd account-service
```

### 2. Environment Setup

#### Create Environment File
Copy the example environment file and configure your MongoDB connection:

```bash
cp .env.example .env
```

Edit the `.env` file with your MongoDB connection details:

```bash
# For MongoDB Atlas
MONGODB_URI=mongodb+srv://your_username:your_password@your_cluster.mongodb.net/banking_accounts

# For Local MongoDB
MONGODB_URI=mongodb://localhost:27017/banking_accounts
```

#### MongoDB Setup Options

**Option 1: MongoDB Atlas (Recommended)**
1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster
3. Create a database user
4. Whitelist your IP address
5. Get your connection string and update the `.env` file

**Option 2: Local MongoDB**
1. Install MongoDB Community Edition
2. Start MongoDB service
3. Use the local connection string in your `.env` file

#### Load Environment Variables
Make sure to source the environment file before running the application:

```bash
# On Unix/Linux/macOS
source .env
export $(cut -d= -f1 .env)

# On Windows (Command Prompt)
for /f "delims=" %i in (.env) do set %i

# On Windows (PowerShell)
Get-Content .env | ForEach-Object { $name, $value = $_.split('='); [Environment]::SetEnvironmentVariable($name, $value) }
```

### 3. Build and run the application

#### Using Maven
```bash
mvn clean install
mvn spring-boot:run
```

#### Using your IDE
1. Import the project into your IDE
2. Make sure environment variables are loaded
3. Run the `AccountServiceApplication` class

The service will start on port 8081 and connect to your MongoDB database.

### 4. Verify the Setup

#### Health Check
```bash
curl http://localhost:8081/actuator/health
```

#### API Documentation
Open http://localhost:8081/swagger-ui.html to view the API documentation.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/accounts` | Create a new account |
| GET | `/api/v1/accounts/{accountId}` | Get account details |
| GET | `/api/v1/accounts/customer/{customerId}` | Get accounts by customer |
| PUT | `/api/v1/accounts/{accountId}` | Update account details |
| GET | `/api/v1/accounts/{accountId}/balance` | Get account balance |

## Testing

### Run Unit Tests
```bash
mvn test
```

### Generate Test Coverage Report
```bash
mvn clean test jacoco:report
```

The coverage report will be available in `target/site/jacoco/index.html`.

### Test with Different Profiles
```bash
# Run tests with test profile
mvn test -Dspring.profiles.active=test
```

## Configuration

### Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/banking_accounts` |
| `SPRING_PROFILES_ACTIVE` | Spring profile to use | `dev`, `prod`, `test` |

### Application Profiles

The application supports different profiles:

- **dev**: Development configuration with debug logging
- **prod**: Production configuration with optimized settings
- **test**: Test configuration with embedded test database

To run with a specific profile:
```bash
mvn spring-boot:run -Dspring.profiles.active=prod
```

## Docker Support

### Build Docker Image
```bash
docker build -t account-service .
```

### Run with Docker
```bash
# Create .env file first, then run:
docker run --env-file .env -p 8081:8081 account-service
```

### Docker Compose
```bash
docker-compose up
```

Make sure your `docker-compose.yml` includes environment variables:
```yaml
services:
  account-service:
    build: .
    ports:
      - "8081:8081"
    env_file:
      - .env
```

## Monitoring and Observability

### Health Endpoints
- Health check: `http://localhost:8081/actuator/health`
- Metrics: `http://localhost:8081/actuator/metrics`
- Info: `http://localhost:8081/actuator/info`

### Logging
Logs include correlation IDs for request tracing. Configure log levels in `application.yml`:

```yaml
logging:
  level:
    com.banking: DEBUG
```

## Troubleshooting

### Common Issues

1. **MongoDB Connection Failed**
    - Verify your connection string in `.env`
    - Check network connectivity to MongoDB Atlas
    - Ensure IP whitelist includes your current IP

2. **Environment Variables Not Loaded**
    - Make sure you've sourced the `.env` file
    - Verify environment variables are set: `echo $MONGODB_URI`

3. **Port Already in Use**
    - Change the port in `application.yml` or set `SERVER_PORT` environment variable

4. **Tests Failing**
    - Ensure test profile is configured correctly
    - Check if test containers are properly set up

### Getting Help

If you encounter issues:
1. Check the application logs for detailed error messages
2. Verify all environment variables are correctly set
3. Ensure MongoDB is accessible from your network
4. Check the health endpoint for service status

## Security Notes

- Never commit `.env` files to version control
- Use different credentials for development and production
- Regularly rotate database passwords
- Consider using MongoDB Atlas for secure, managed database hosting
- Use environment-specific configurations for different deployment stages

## Contributing

1. Create a feature branch
2. Make your changes
3. Add tests for new functionality
4. Run the full test suite
5. Submit a pull request

## License

This project is part of a home assignment and is for educational purposes.