// src/components/BankingSystem.tsx (Updated with customer management)
import { useState, useEffect } from "react";
import Header from "./Header";
import AccountCard from "./AccountCard";
import TransactionList from "./TransactionList";
import TransactionForm from "./TransactionForm";
import CreateAccountForm from "./CreateAccountForm";
import AccountManagement from "./AccountManagement";
import CustomerManagement from "./CustomerManagement";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { useToast } from "../../hooks/use-toast.ts";
import {
    CreditCard,
    Receipt,
    RefreshCw,
    AlertCircle,
    TrendingUp,
    DollarSign,
    Settings,
    Users
} from "lucide-react";
import { Button } from "../ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { accountService, Account } from "../services/accountService";
import { transactionService, Transaction } from "../services/transactionService";
import { Customer } from "../services/customerService";

const BankingSystem = () => {
    const { toast } = useToast();
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [refreshing, setRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState("dashboard");
    const [currentCustomer, setCurrentCustomer] = useState<Customer | null>(null);

    const loadData = async (showRefreshing = false) => {
        if (!currentCustomer) {
            setAccounts([]);
            setTransactions([]);
            setLoading(false);
            setRefreshing(false);
            return;
        }

        if (showRefreshing) {
            setRefreshing(true);
        } else {
            setLoading(true);
        }
        setError(null);

        try {
            console.log('🔄 Loading banking data for customer:', currentCustomer.customerId);

            // Load accounts first
            const accountsData = await accountService.getAccountsByCustomer(currentCustomer.customerId);
            console.log('📊 Loaded accounts:', accountsData);
            console.log('💰 Account balances:', accountsData.map(acc => `${acc.accountId}: ${acc.balance} ${acc.currency}`));
            setAccounts(accountsData);

            // Load transactions for all accounts
            if (accountsData.length > 0) {
                const accountIds = accountsData.map(account => account.accountId);
                console.log('🔍 Loading transactions for accounts:', accountIds);

                const transactionsData = await transactionService.getTransactionsForAccounts(accountIds);
                console.log('📋 Loaded transactions:', transactionsData);
                setTransactions(transactionsData);
            } else {
                console.log('⚠️ No accounts found, skipping transaction loading');
                setTransactions([]);
            }

            console.log('✅ Data loading completed successfully');
        } catch (error) {
            console.error('❌ Failed to load data:', error);
            setError(error instanceof Error ? error.message : 'Failed to load banking data');
            toast({
                title: "Error Loading Data",
                description: "Failed to load your banking information. Please try again.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [currentCustomer]);

    const handleTransactionSubmit = async (transactionData: any) => {
        console.log('💳 Submitting transaction:', transactionData);

        try {
            let newTransaction: Transaction;

            switch (transactionData.type) {
                case "DEPOSIT":
                    console.log('💰 Processing deposit...');
                    newTransaction = await transactionService.deposit({
                        accountId: transactionData.accountId,
                        amount: transactionData.amount,
                        currency: transactionData.currency,
                        description: transactionData.description
                    });
                    break;

                case "WITHDRAWAL":
                    console.log('🏧 Processing withdrawal...');
                    newTransaction = await transactionService.withdraw({
                        accountId: transactionData.accountId,
                        amount: transactionData.amount,
                        currency: transactionData.currency,
                        description: transactionData.description
                    });
                    break;

                case "TRANSFER":
                    console.log('🔄 Processing transfer...');
                    newTransaction = await transactionService.transfer({
                        fromAccountId: transactionData.fromAccountId,
                        toAccountId: transactionData.toAccountId,
                        amount: transactionData.amount,
                        currency: transactionData.currency,
                        description: transactionData.description
                    });
                    break;

                default:
                    throw new Error("Invalid transaction type");
            }

            console.log('✅ Transaction completed:', newTransaction);

            // Add a small delay to ensure backend processing is complete
            await new Promise(resolve => setTimeout(resolve, 500));

            // Refresh data to get updated balances and transaction history
            await loadData(true);

            // Debug: Log the updated accounts to see if balances changed
            console.log('🔄 After transaction - Updated accounts:', accounts);
            console.log('💰 Current balances by currency:', balancesByCurrency);

            toast({
                title: "Transaction Successful",
                description: `Your ${transactionData.type.toLowerCase()} has been processed successfully.`,
            });
        } catch (error) {
            console.error('❌ Transaction failed:', error);
            const errorMessage = error instanceof Error ? error.message : 'Transaction failed';
            toast({
                title: "Transaction Failed",
                description: errorMessage,
                variant: "destructive",
            });
            throw error;
        }
    };

    const handleAccountCreated = () => {
        console.log('🎉 Account created, refreshing data...');
        loadData(true);
    };

    const handleAccountUpdated = () => {
        console.log('⚙️ Account updated, refreshing data...');
        loadData(true);
    };

    const handleRefresh = () => {
        loadData(true);
    };

    const handleTransactionClick = async (transaction: Transaction) => {
        // This handler is now handled by the inline expansion in TransactionList
        // The actual API call and state management is handled within the component
        console.log('🔍 Transaction clicked:', transaction.transactionId);
    };

    // Calculate statistics
    const activeAccounts = accounts.filter(account => account.status === 'ACTIVE');
    const recentTransactions = transactions.filter(transaction => {
        const transactionDate = new Date(transaction.createdAt);
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        return transactionDate >= oneWeekAgo;
    });

    // Calculate balances by currency
    const balancesByCurrency = accounts.reduce((acc, account) => {
        const currency = account.currency;
        if (!acc[currency]) {
            acc[currency] = 0;
        }
        acc[currency] += account.balance;
        return acc;
    }, {} as Record<string, number>);

    // Format currency balances
    const formatCurrencyBalance = (amount: number, currency: string) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency,
        }).format(amount);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background">
                <Header />
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="flex items-center justify-center py-12">
                        <RefreshCw className="w-8 h-8 animate-spin mr-2" />
                        <span>Loading your banking information...</span>
                    </div>
                </main>
            </div>
        );
    }

    // If no customer is selected, show customer selection
    if (!currentCustomer) {
        return (
            <div className="min-h-screen bg-background">
                <Header />
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="flex justify-between items-center mb-8">
                        <h1 className="text-3xl font-bold text-foreground">Banking Portal</h1>
                    </div>
                    <CustomerManagement
                        currentCustomer={currentCustomer}
                        onCustomerChange={setCurrentCustomer}
                    />
                </main>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-background">
                <Header />
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <Card className="max-w-md mx-auto">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-center mb-4">
                                <AlertCircle className="w-12 h-12 text-destructive" />
                            </div>
                            <h2 className="text-xl font-semibold text-center mb-2">Connection Error</h2>
                            <p className="text-muted-foreground text-center mb-4">{error}</p>
                            <Button onClick={handleRefresh} className="w-full">
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Try Again
                            </Button>
                        </CardContent>
                    </Card>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <Header />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-5">
                        <TabsTrigger value="dashboard" className="flex items-center space-x-2">
                            <TrendingUp className="w-4 h-4" />
                            <span>Dashboard</span>
                        </TabsTrigger>
                        <TabsTrigger value="accounts" className="flex items-center space-x-2">
                            <CreditCard className="w-4 h-4" />
                            <span>Accounts</span>
                        </TabsTrigger>
                        <TabsTrigger value="transactions" className="flex items-center space-x-2">
                            <Receipt className="w-4 h-4" />
                            <span>Transactions</span>
                        </TabsTrigger>
                        <TabsTrigger value="customers" className="flex items-center space-x-2">
                            <Users className="w-4 h-4" />
                            <span>Customers</span>
                        </TabsTrigger>
                        <TabsTrigger value="manage" className="flex items-center space-x-2">
                            <Settings className="w-4 h-4" />
                            <span>Manage</span>
                        </TabsTrigger>
                    </TabsList>

                    {/* Dashboard Tab */}
                    <TabsContent value="dashboard" className="space-y-6 mt-8">
                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="flex items-center">
                                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                                        <div className="ml-2">
                                            <p className="text-sm font-medium text-muted-foreground">Total Balance</p>
                                            <div className="mt-2 flex flex-wrap gap-2">
                                                {Object.entries(balancesByCurrency).map(([currency, amount]) => (
                                                    <span key={currency} className="text-lg font-semibold">
                                                        {formatCurrencyBalance(amount, currency)}
                                                    </span>
                                                ))}
                                                {Object.keys(balancesByCurrency).length === 0 && (
                                                    <span className="text-lg font-semibold text-muted-foreground">
                                                        No accounts
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="pt-6">
                                    <div className="flex items-center">
                                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                                        <div className="ml-2">
                                            <p className="text-sm font-medium text-muted-foreground">Active Accounts</p>
                                            <p className="text-2xl font-bold">{activeAccounts.length}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="pt-6">
                                    <div className="flex items-center">
                                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                                        <div className="ml-2">
                                            <p className="text-sm font-medium text-muted-foreground">Recent Transactions</p>
                                            <p className="text-2xl font-bold">{recentTransactions.length}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Accounts Overview */}
                            <Card className="shadow-card border-border/50">
                                <CardHeader>
                                    <CardTitle className="flex items-center space-x-2">
                                        <CreditCard className="w-5 h-5" />
                                        <span>My Accounts</span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {accounts.length === 0 ? (
                                        <div className="text-center py-8 text-muted-foreground">
                                            <CreditCard className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                            <p>No accounts found</p>
                                        </div>
                                    ) : (
                                        accounts.slice(0, 3).map((account) => (
                                            <AccountCard
                                                key={account.accountId}
                                                accountNumber={account.accountNumber}
                                                accountType={account.accountType}
                                                balance={account.balance}
                                                currency={account.currency}
                                                status={account.status}
                                            />
                                        ))
                                    )}
                                    {accounts.length > 3 && (
                                        <Button
                                            variant="outline"
                                            className="w-full"
                                            onClick={() => setActiveTab("accounts")}
                                        >
                                            View All Accounts ({accounts.length})
                                        </Button>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Recent Transactions */}
                            <Card className="shadow-card border-border/50">
                                <CardHeader>
                                    <CardTitle className="flex items-center justify-between">
                                        <div className="flex items-center space-x-2">
                                            <Receipt className="w-5 h-5" />
                                            <span>Recent Activity</span>
                                        </div>
                                        <span className="text-sm text-muted-foreground">
                      ({transactions.length} total)
                    </span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <TransactionList 
                                        transactions={transactions.slice(0, 5)} 
                                        onTransactionClick={handleTransactionClick}
                                        accounts={accounts.map(acc => ({
                                            accountId: acc.accountId,
                                            accountNumber: acc.accountNumber
                                        }))}
                                    />
                                    {transactions.length > 5 && (
                                        <Button
                                            variant="outline"
                                            className="w-full mt-4"
                                            onClick={() => setActiveTab("transactions")}
                                        >
                                            View All Transactions
                                        </Button>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* Accounts Tab */}
                    <TabsContent value="accounts" className="space-y-6 mt-8">
                        <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
                            {/* Create Account */}
                            <CreateAccountForm
                                customerId={currentCustomer?.customerId || ""}
                                onAccountCreated={handleAccountCreated}
                            />
                        </div>

                        {/* All Accounts */}
                        <Card className="shadow-card border-border/50">
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <CreditCard className="w-5 h-5" />
                                    <span>All Accounts</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {accounts.map((account) => (
                                    <AccountCard
                                        key={account.accountId}
                                        accountNumber={account.accountNumber}
                                        accountType={account.accountType}
                                        balance={account.balance}
                                        currency={account.currency}
                                        status={account.status}
                                    />
                                ))}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Transactions Tab */}
                    <TabsContent value="transactions" className="space-y-6 mt-8">
                        {/* Transaction Form */}
                        {accounts.length > 0 && (
                            <Card className="shadow-card border-border/50">
                                <CardHeader>
                                    <CardTitle className="flex items-center space-x-2">
                                        <Receipt className="w-5 h-5" />
                                        <span>New Transaction</span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <TransactionForm
                                        accounts={accounts}
                                        onTransactionSubmit={handleTransactionSubmit}
                                    />
                                </CardContent>
                            </Card>
                        )}

                        {/* All Transactions */}
                        <Card className="shadow-card border-border/50">
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <Receipt className="w-5 h-5" />
                                    <span>All Transactions</span>
                                    <span className="text-sm text-muted-foreground ml-auto">
                                        ({transactions.length} transactions)
                                    </span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <TransactionList 
                                    transactions={transactions} 
                                    onTransactionClick={handleTransactionClick}
                                    accounts={accounts.map(acc => ({
                                        accountId: acc.accountId,
                                        accountNumber: acc.accountNumber
                                    }))}
                                />
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Customers Tab */}
                    <TabsContent value="customers" className="space-y-6 mt-8">
                        <CustomerManagement
                            currentCustomer={currentCustomer}
                            onCustomerChange={setCurrentCustomer}
                            showCustomerSelection={true}
                        />
                    </TabsContent>

                    {/* Manage Tab */}
                    <TabsContent value="manage" className="space-y-6 mt-8">
                        <AccountManagement
                            accounts={accounts}
                            onAccountUpdated={handleAccountUpdated}
                        />
                    </TabsContent>
                </Tabs>
            </main>
        </div>
    );
};

export default BankingSystem;