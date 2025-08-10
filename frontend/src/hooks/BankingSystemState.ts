import { useState, useEffect } from "react";
import { useToast } from "./use-toast.ts";
import { accountService, Account } from "../components/services/accountService.ts";
import { transactionService, Transaction } from "../components/services/transactionService.ts";
import { Customer } from "../components/services/customerService.ts";

export const useBankingSystemState = () => {
    const { toast } = useToast();
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [transactionsLoading, setTransactionsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState("dashboard");
    const [currentCustomer, setCurrentCustomer] = useState<Customer | null>(null);
    
    // Account selection state
    const [selectedAccountId, setSelectedAccountId] = useState<string>("");
    const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
    const [viewMode, setViewMode] = useState<"all" | "specific">("all");
    
    // Pagination state for transactions
    const [transactionPage, setTransactionPage] = useState(0);
    const [transactionPageSize, setTransactionPageSize] = useState(20);
    const [totalTransactions, setTotalTransactions] = useState(0);
    const [totalTransactionPages, setTotalTransactionPages] = useState(0);

    const loadData = async () => {
        if (!currentCustomer) {
            setAccounts([]);
            setTransactions([]);
            setLoading(false);
            return;
        }
        setLoading(true);
        setError(null);

        try {
            // Load accounts first
            const accountsData = await accountService.getAccountsByCustomer(currentCustomer.customerId);
            setAccounts(accountsData);

            // Load transactions based on view mode
            if (accountsData.length > 0) {
                if (viewMode === "specific" && selectedAccountId) {
                    // Load specific account and its transactions
                    try {
                        const specificAccount = await accountService.getAccount(selectedAccountId);
                        setSelectedAccount(specificAccount);
                        
                        // Use backend pagination for specific account
                        const paginatedResponse = await transactionService.getTransactionHistory(selectedAccountId, {
                            page: transactionPage,
                            size: transactionPageSize,
                            sortBy: 'createdAt',
                            sortDirection: 'desc'
                        });
                        

                        setTransactions(paginatedResponse.content);
                        setTotalTransactions(paginatedResponse.totalElements);
                        setTotalTransactionPages(paginatedResponse.totalPages);
                    } catch (error) {
                        // Fallback to all accounts if specific account fails
                        setViewMode("all");
                        setSelectedAccountId("");
                        setSelectedAccount(null);
                        
                        const accountIds = accountsData.map(account => account.accountId);
                        const paginatedResponse = await transactionService.getPaginatedTransactionsForAccounts(
                            accountIds,
                            {
                                page: transactionPage,
                                size: transactionPageSize,
                                sortBy: 'createdAt',
                                sortDirection: 'desc'
                            }
                        );
                        
                        setTransactions(paginatedResponse.content);
                        setTotalTransactions(paginatedResponse.totalElements);
                        setTotalTransactionPages(paginatedResponse.totalPages);
                    }
                } else {
                    // Load transactions from all accounts with pagination
                    const accountIds = accountsData.map(account => account.accountId);

                    const paginatedResponse = await transactionService.getPaginatedTransactionsForAccounts(
                        accountIds,
                        {
                            page: transactionPage,
                            size: transactionPageSize,
                            sortBy: 'createdAt',
                            sortDirection: 'desc'
                        }
                    );
                    

                    setTransactions(paginatedResponse.content);
                    setTotalTransactions(paginatedResponse.totalElements);
                    setTotalTransactionPages(paginatedResponse.totalPages);
                }
            } else {
                setTransactions([]);
                setTotalTransactions(0);
                setTotalTransactionPages(0);
                // Reset view mode when no accounts exist
                setViewMode("all");
                setSelectedAccountId("");
                setSelectedAccount(null);
            }

        } catch (error) {
            setError(error instanceof Error ? error.message : 'Failed to load banking data');
            toast({
                title: "Error Loading Data",
                description: "Failed to load your banking information. Please try again.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    // Separate function to load data with specific view mode (used when changing view mode)
    const loadDataWithViewMode = async (viewMode: "all" | "specific", selectedAccountId?: string) => {
        if (!currentCustomer || accounts.length === 0) return;

        try {

            if (viewMode === "specific" && selectedAccountId) {
                // Load specific account and its transactions with backend pagination
                try {
                    const specificAccount = await accountService.getAccount(selectedAccountId);
                    setSelectedAccount(specificAccount);
                    
                    // Use backend pagination for specific account
                    const paginatedResponse = await transactionService.getTransactionHistory(selectedAccountId, {
                        page: 0, // Start from first page
                        size: transactionPageSize,
                        sortBy: 'createdAt',
                        sortDirection: 'desc'
                    });
                    

                    setTransactions(paginatedResponse.content);
                    setTotalTransactions(paginatedResponse.totalElements);
                    setTotalTransactionPages(paginatedResponse.totalPages);
                } catch (error) {
                    // Fallback to all accounts if specific account fails
                    setViewMode("all");
                    setSelectedAccountId("");
                    setSelectedAccount(null);
                    
                    const accountIds = accounts.map(account => account.accountId);
                    const paginatedResponse = await transactionService.getPaginatedTransactionsForAccounts(
                        accountIds,
                        {
                            page: 0, // Reset to first page
                            size: transactionPageSize,
                            sortBy: 'createdAt',
                            sortDirection: 'desc'
                        }
                    );
                    
                    setTransactions(paginatedResponse.content);
                    setTotalTransactions(paginatedResponse.totalElements);
                    setTotalTransactionPages(paginatedResponse.totalPages);
                }
            } else {
                // Load transactions from all accounts with backend pagination
                const accountIds = accounts.map(account => account.accountId);

                const paginatedResponse = await transactionService.getPaginatedTransactionsForAccounts(
                    accountIds,
                    {
                        page: 0, // Reset to first page
                        size: transactionPageSize,
                        sortBy: 'createdAt',
                        sortDirection: 'desc'
                    }
                );
                

                setTransactions(paginatedResponse.content);
                setTotalTransactions(paginatedResponse.totalElements);
                setTotalTransactionPages(paginatedResponse.totalPages);
            }

        } catch (error) {
            setError('Failed to load data. Please try again.');
        }
    };

    const handleTransactionSubmit = async (transactionData: any) => {

        try {
            let newTransaction: Transaction;

            switch (transactionData.type) {
                case "DEPOSIT":
                    newTransaction = await transactionService.deposit({
                        accountId: transactionData.accountId,
                        amount: transactionData.amount,
                        currency: transactionData.currency,
                        description: transactionData.description
                    });
                    break;

                case "WITHDRAWAL":
                    newTransaction = await transactionService.withdraw({
                        accountId: transactionData.accountId,
                        amount: transactionData.amount,
                        currency: transactionData.currency,
                        description: transactionData.description
                    });
                    break;

                case "TRANSFER":
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



            // Add a small delay to ensure backend processing is complete
            await new Promise(resolve => setTimeout(resolve, 500));

            // Refresh data to get updated balances and transaction history
            await loadData(true);

            toast({
                title: "Transaction Successful",
                description: `Your ${transactionData.type.toLowerCase()} has been processed successfully.`,
            });
        } catch (error) {
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
        loadData(true);
    };

    const handleAccountUpdated = () => {
        loadData(true);
    };

    const handleRefresh = () => {
        loadData(true);
    };

    const handlePageSizeChange = (newPageSize: number) => {
        setTransactionPageSize(newPageSize);
        setTransactionPage(0); // Reset to first page when changing page size
    };

    const handleAccountSelectionChange = async (newViewMode: "all" | "specific", newAccountId?: string) => {
        
        // Reset state
        setViewMode(newViewMode);
        setSelectedAccountId(newAccountId || "");
        setSelectedAccount(null);
        setTransactionPage(0); // Reset to first page when changing account selection
        
        // Clear current data to show loading state
        setTransactions([]);
        setTotalTransactions(0);
        setTotalTransactionPages(0);
        
        if (currentCustomer) {
            // Load data with the new values immediately
            await loadDataWithViewMode(newViewMode, newAccountId);
        }
    };

    const loadTransactionsPage = async () => {
        if (!currentCustomer || accounts.length === 0) return;
        
        setTransactionsLoading(true);
        try {
            if (viewMode === "specific" && selectedAccountId && selectedAccount) {
                // For specific account, use backend pagination
                const paginatedResponse = await transactionService.getTransactionHistory(selectedAccountId, {
                    page: transactionPage,
                    size: transactionPageSize,
                    sortBy: 'createdAt',
                    sortDirection: 'desc'
                });
                
                setTransactions(paginatedResponse.content);
                setTotalTransactions(paginatedResponse.totalElements);
                setTotalTransactionPages(paginatedResponse.totalPages);
            } else {
                // For all accounts, use backend pagination
                const accountIds = accounts.map(account => account.accountId);
                const paginatedResponse = await transactionService.getPaginatedTransactionsForAccounts(
                    accountIds,
                    {
                        page: transactionPage,
                        size: transactionPageSize,
                        sortBy: 'createdAt',
                        sortDirection: 'desc'
                    }
                );
                
                setTransactions(paginatedResponse.content);
                setTotalTransactions(paginatedResponse.totalElements);
                setTotalTransactionPages(paginatedResponse.totalPages);
            }
        } catch (error) {
            toast({
                title: "Error Loading Transactions",
                description: "Failed to load transaction page. Please try again.",
                variant: "destructive",
            });
        } finally {
            setTransactionsLoading(false);
        }
    };

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

    useEffect(() => {
        // Reset pagination and account selection when customer changes
        setTransactionPage(0);
        setSelectedAccountId("");
        setSelectedAccount(null);
        setViewMode("all");
        setTotalTransactions(0);
        setTotalTransactionPages(0);
        loadData();
    }, [currentCustomer]);

    // Effect to reload transactions when pagination changes
    useEffect(() => {
        if (currentCustomer && accounts.length > 0) {
            loadTransactionsPage();
        }
    }, [transactionPage, transactionPageSize, viewMode, selectedAccountId]);

    return {
        // State
        accounts,
        transactions,
        loading,
        error,
        transactionsLoading,
        activeTab,
        currentCustomer,
        selectedAccountId,
        selectedAccount,
        viewMode,
        transactionPage,
        transactionPageSize,
        totalTransactions,
        totalTransactionPages,
        
        // Computed values
        balancesByCurrency,
        
        // Actions
        setActiveTab,
        setCurrentCustomer,
        handleTransactionSubmit,
        handleAccountCreated,
        handleAccountUpdated,
        handleRefresh,
        handlePageSizeChange,
        handleAccountSelectionChange,
        setTransactionPage,
        
        // Utilities
        formatCurrencyBalance
    };
};
