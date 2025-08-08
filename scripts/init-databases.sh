#!/bin/bash

# Banking System Database Initialization Script
# This script sets up the required databases and collections for local MongoDB

echo "🏦 Banking System Database Initialization"
echo "=========================================="

# Check if MongoDB is running
if ! pgrep -x "mongod" > /dev/null; then
    echo "❌ MongoDB is not running. Please start MongoDB first:"
    echo "   macOS: brew services start mongodb-community"
    echo "   Ubuntu: sudo systemctl start mongodb"
    echo "   Windows: Start MongoDB service"
    exit 1
fi

echo "✅ MongoDB is running"

# Function to execute MongoDB commands
execute_mongo_commands() {
    local commands="$1"
    echo "$commands" | mongosh --quiet
}

echo "📊 Creating databases and collections..."

# Account Service Database Setup
echo "Setting up banking_accounts database..."

ACCOUNT_DB_COMMANDS="
use banking_accounts

// Create collections
db.createCollection('customers')
db.createCollection('accounts')

// Create indexes for customers
db.customers.createIndex({ 'customerId': 1 }, { unique: true })
db.customers.createIndex({ 'email': 1 }, { unique: true })

// Create indexes for accounts
db.accounts.createIndex({ 'accountId': 1 }, { unique: true })
db.accounts.createIndex({ 'customerId': 1 })
db.accounts.createIndex({ 'accountNumber': 1 }, { unique: true })

// Show collections
print('Collections in banking_accounts:')
show collections

// Show indexes
print('Indexes in customers collection:')
db.customers.getIndexes()

print('Indexes in accounts collection:')
db.accounts.getIndexes()
"

execute_mongo_commands "$ACCOUNT_DB_COMMANDS"

# Transaction Service Database Setup
echo "Setting up banking_transactions database..."

TRANSACTION_DB_COMMANDS="
use banking_transactions

// Create collections
db.createCollection('transactions')

// Create indexes for transactions
db.transactions.createIndex({ 'transactionId': 1 }, { unique: true })
db.transactions.createIndex({ 'fromAccountId': 1 })
db.transactions.createIndex({ 'toAccountId': 1 })
db.transactions.createIndex({ 'createdAt': -1 })

// Show collections
print('Collections in banking_transactions:')
show collections

// Show indexes
print('Indexes in transactions collection:')
db.transactions.getIndexes()
"

execute_mongo_commands "$TRANSACTION_DB_COMMANDS"

# Verify databases exist
echo "🔍 Verifying database setup..."

VERIFY_COMMANDS="
// List all databases
print('Available databases:')
show dbs

// Check banking_accounts
use banking_accounts
print('Collections in banking_accounts:')
show collections

// Check banking_transactions
use banking_transactions
print('Collections in banking_transactions:')
show collections
"

execute_mongo_commands "$VERIFY_COMMANDS"

echo ""
echo "✅ Database initialization completed successfully!"
echo ""
echo "📋 Summary:"
echo "   - Created banking_accounts database"
echo "   - Created banking_transactions database"
echo "   - Set up collections with proper indexes"
echo ""
echo "🚀 You can now start the services:"
echo "   cd account-service && mvn spring-boot:run"
echo "   cd transaction-service && mvn spring-boot:run"
echo "   cd frontend && npm run dev"
echo ""
echo "📚 API Documentation will be available at:"
echo "   Account Service: http://localhost:8081/swagger-ui.html"
echo "   Transaction Service: http://localhost:8082/swagger-ui.html"
echo "   Frontend: http://localhost:3000"
