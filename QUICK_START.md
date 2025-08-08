# 🚀 Quick Start Guide

Get the banking system running in **5 minutes** with local MongoDB!

## Prerequisites

- Java 21+
- Maven 3.8+
- Node.js 18+
- MongoDB (local)

## ⚡ 5-Minute Setup

### 1. Install MongoDB (if not installed)

**macOS:**
```bash
brew install mongodb/brew/mongodb-community
brew services start mongodb-community
```

**Ubuntu/Debian:**
```bash
sudo apt-get install mongodb
sudo systemctl start mongodb
```

**Windows:**
Download from [MongoDB Community Server](https://www.mongodb.com/try/download/community)

### 2. Clone and Setup

```bash
# Clone the repository
git clone <repository-url>
cd banking-system-home-assignment

# Initialize databases
./scripts/init-databases.sh
```

### 3. Start Services

**Terminal 1 - Account Service:**
```bash
cd account-service
mvn spring-boot:run
```

**Terminal 2 - Transaction Service:**
```bash
cd transaction-service
mvn spring-boot:run
```

**Terminal 3 - Frontend:**
```bash
cd frontend
npm install
npm run dev
```

### 4. Access the Application

- **Frontend**: http://localhost:3000
- **Account Service API**: http://localhost:8081/swagger-ui.html
- **Transaction Service API**: http://localhost:8082/swagger-ui.html

## 🎯 What You Can Do

1. **Create Customers** - Add new banking customers
2. **Create Accounts** - Open savings or checking accounts
3. **Make Transactions** - Deposit, withdraw, or transfer money
4. **View History** - See transaction history and account details
5. **Manage Accounts** - Update account status and currency

## 🔧 Troubleshooting

### MongoDB Not Running
```bash
# Check if MongoDB is running
mongosh --eval "db.runCommand('ping')"

# Start MongoDB if needed
brew services start mongodb-community  # macOS
sudo systemctl start mongodb          # Ubuntu
```

### Port Conflicts
```bash
# Check which ports are in use
lsof -i :8081
lsof -i :8082
lsof -i :3000
```

### Database Issues
```bash
# Reinitialize databases
./scripts/init-databases.sh
```

## 📚 Next Steps

- Read the [full README](./README.md) for detailed documentation
- Explore the [API documentation](http://localhost:8081/swagger-ui.html)
- Check out the [service-specific READMEs](./account-service/README.md)

---

**That's it! You now have a fully functional banking system running locally.** 🎉
