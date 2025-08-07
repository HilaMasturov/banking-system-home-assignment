import { useState, useEffect } from "react";
import Header from "./Header";
import AccountCard from "./AccountCard";
import TransactionList from "./TransactionList";
import TransactionForm from "./TransactionForm";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { useToast } from "../../hooks/use-toast.ts";
import {
    CreditCard,
    Receipt,
    RefreshCw,
    AlertCircle,
    TrendingUp,
    DollarSign
} from "lucide-react";
import { Button } from "../ui/button";
import { accountService, Account } from "../services/accountService";
import { transactionService, Transaction } from "../services/transactionService";

const BankingSystem = () => {
    const { toast } = useToast();
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [refreshing, setRefreshing] = useState(false);

    // For demo purposes, using a fixed customer ID
    // In a real app, this would come from authentication
    const CUSTOMER_ID = "customer123";

    const loadData = async (showRefreshing = false) => {
        if (showRefreshing) {
            setRefreshing(true);
        } else {
            setLoading(true);
        }
        setError(null);

        try {
            console.log('🔄 Loading banking data...');

            // Load accounts first
            const accountsData = await accountService.getAccountsByCustomer(CUSTOMER_ID);
            console.log('📊 Loaded accounts:', accountsData);
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
    }, []);

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

            // Refresh data to get updated balances and transaction history
            await loadData(true);

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
            throw error; // Re-throw to let the form handle loading states
        }
    };

    const handleRefresh = () => {
        loadData(true);
    };

    // Calculate total balance across all accounts
    const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0);

    // Count active accounts
    const activeAccounts = accounts.filter(account => account.status === 'ACTIVE');

    // Count recent transactions (last 7 days)
    const recentTransactions = transactions.filter(transaction => {
        const transactionDate = new Date(transaction.createdAt);
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        return transactionDate >= oneWeekAgo;
    });

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

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-foreground">Banking Dashboard</h1>
                    <Button
                        onClick={handleRefresh}
                        variant="outline"
                        disabled={refreshing}
                    >
                        <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                        {refreshing ? 'Refreshing...' : 'Refresh'}
                    </Button>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center">
                                <DollarSign className="h-4 w-4 text-muted-foreground" />
                                <div className="ml-2">
                                    <p className="text-sm font-medium text-muted-foreground">Total Balance</p>
                                    <p className="text-2xl font-bold">${totalBalance.toFixed(2)}</p>
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
                    {/* Left Column - Accounts and Transaction Form */}
                    <div className="space-y-6">
                        {/* Accounts Section */}
                        <Card className="shadow-card border-border/50">
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <CreditCard className="w-5 h-5" />
                                    <span>Account Management</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {accounts.length === 0 ? (
                                    <div className="text-center py-8 text-muted-foreground">
                                        <CreditCard className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                        <p>No accounts found</p>
                                    </div>
                                ) : (
                                    accounts.map((account) => (
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
                            </CardContent>
                        </Card>

                        {/* Transaction Form - Only show if accounts exist */}
                        {accounts.length > 0 && (
                            <TransactionForm
                                accounts={accounts}
                                onTransactionSubmit={handleTransactionSubmit}
                            />
                        )}
                    </div>

                    {/* Right Column - Transaction History */}
                    <div>
                        <Card className="shadow-card border-border/50">
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <Receipt className="w-5 h-5" />
                                    <span>Transaction History</span>
                                    <span className="text-sm text-muted-foreground ml-auto">
                    ({transactions.length} transactions)
                  </span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <TransactionList transactions={transactions} />
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default BankingSystem;