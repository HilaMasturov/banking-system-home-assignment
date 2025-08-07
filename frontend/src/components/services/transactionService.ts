import { apiClient, API_CONFIG } from './api';

export interface Transaction {
    transactionId: string;
    fromAccountId?: string;
    toAccountId?: string;
    amount: number;
    currency: string;
    type: 'DEPOSIT' | 'WITHDRAWAL' | 'TRANSFER';
    status: 'PENDING' | 'COMPLETED' | 'FAILED';
    description: string;
    createdAt: string;
}

export interface DepositRequest {
    accountId: string;
    amount: number;
    currency: string;
    description: string;
}

export interface WithdrawalRequest {
    accountId: string;
    amount: number;
    currency: string;
    description: string;
}

export interface TransferRequest {
    fromAccountId: string;
    toAccountId: string;
    amount: number;
    currency: string;
    description: string;
}

// Paginated response interface matching Spring Data Page
export interface PaginatedTransactionResponse {
    content: Transaction[];
    pageable: {
        sort: {
            empty: boolean;
            sorted: boolean;
            unsorted: boolean;
        };
        offset: number;
        pageSize: number;
        pageNumber: number;
        paged: boolean;
        unpaged: boolean;
    };
    last: boolean;
    totalPages: number;
    totalElements: number;
    size: number;
    number: number;
    sort: {
        empty: boolean;
        sorted: boolean;
        unsorted: boolean;
    };
    first: boolean;
    numberOfElements: number;
    empty: boolean;
}

export interface TransactionHistoryOptions {
    page?: number;
    size?: number;
    sortBy?: string;
    sortDirection?: 'asc' | 'desc';
}

export class TransactionService {
    private baseUrl = API_CONFIG.TRANSACTION_SERVICE_URL;

    // POST /api/transactions/deposit - Deposit money
    async deposit(depositData: DepositRequest): Promise<Transaction> {
        return apiClient.post<Transaction>(`${this.baseUrl}/transactions/deposit`, depositData);
    }

    // POST /api/transactions/withdraw - Withdraw money
    async withdraw(withdrawalData: WithdrawalRequest): Promise<Transaction> {
        return apiClient.post<Transaction>(`${this.baseUrl}/transactions/withdraw`, withdrawalData);
    }

    // POST /api/transactions/transfer - Transfer money
    async transfer(transferData: TransferRequest): Promise<Transaction> {
        return apiClient.post<Transaction>(`${this.baseUrl}/transactions/transfer`, transferData);
    }

    // GET /api/transactions/account/{accountId} - Get transaction history (returns List)
    async getTransactionHistory(
        accountId: string,
        options: TransactionHistoryOptions = {}
    ): Promise<Transaction[]> {
        const {
            page = 0,
            size = 20,
            sortBy = 'createdAt',
            sortDirection = 'desc'
        } = options;

        const params = new URLSearchParams({
            page: page.toString(),
            size: size.toString(),
            sortBy,
            sortDirection
        });

        return apiClient.get<Transaction[]>(`${this.baseUrl}/transactions/account/${accountId}?${params}`);
    }

    // GET /api/transactions/account/{accountId}/paginated - Get paginated transaction history (returns Page)
    async getPaginatedTransactionHistory(
        accountId: string,
        options: TransactionHistoryOptions = {}
    ): Promise<PaginatedTransactionResponse> {
        const {
            page = 0,
            size = 20,
            sortBy = 'createdAt',
            sortDirection = 'desc'
        } = options;

        const params = new URLSearchParams({
            page: page.toString(),
            size: size.toString(),
            sortBy,
            sortDirection
        });

        return apiClient.get<PaginatedTransactionResponse>(
            `${this.baseUrl}/transactions/account/${accountId}/paginated?${params}`
        );
    }

    // GET /api/transactions/{transactionId} - Get transaction details
    async getTransaction(transactionId: string): Promise<Transaction> {
        return apiClient.get<Transaction>(`${this.baseUrl}/transactions/${transactionId}`);
    }

    // Helper methods for common operations
    async getTransactionsForAccounts(accountIds: string[]): Promise<Transaction[]> {
        const promises = accountIds.map(accountId =>
            this.getTransactionHistory(accountId, { size: 50 })
                .catch((error) => {
                    console.warn(`Failed to fetch transactions for account ${accountId}:`, error);
                    return [] as Transaction[];
                })
        );

        const results = await Promise.all(promises);
        return results
            .flat()
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 100); // Limit to most recent 100 transactions
    }

    async getRecentTransactions(accountId: string, limit: number = 10): Promise<Transaction[]> {
        try {
            return await this.getTransactionHistory(accountId, {
                page: 0,
                size: limit,
                sortBy: 'createdAt',
                sortDirection: 'desc'
            });
        } catch (error) {
            console.error(`Failed to fetch recent transactions for account ${accountId}:`, error);
            return [];
        }
    }

    async checkTransactionStatus(transactionId: string): Promise<'PENDING' | 'COMPLETED' | 'FAILED' | null> {
        try {
            const transaction = await this.getTransaction(transactionId);
            return transaction.status;
        } catch (error) {
            console.error(`Failed to check transaction status for ${transactionId}:`, error);
            return null;
        }
    }

    // Advanced filtering and searching
    async getTransactionsByType(
        accountId: string,
        type: 'DEPOSIT' | 'WITHDRAWAL' | 'TRANSFER',
        options: TransactionHistoryOptions = {}
    ): Promise<Transaction[]> {
        const transactions = await this.getTransactionHistory(accountId, options);
        return transactions.filter(transaction => transaction.type === type);
    }

    async getTransactionsByStatus(
        accountId: string,
        status: 'PENDING' | 'COMPLETED' | 'FAILED',
        options: TransactionHistoryOptions = {}
    ): Promise<Transaction[]> {
        const transactions = await this.getTransactionHistory(accountId, options);
        return transactions.filter(transaction => transaction.status === status);
    }

    async getTransactionsByDateRange(
        accountId: string,
        startDate: Date,
        endDate: Date,
        options: TransactionHistoryOptions = {}
    ): Promise<Transaction[]> {
        const transactions = await this.getTransactionHistory(accountId, options);
        return transactions.filter(transaction => {
            const transactionDate = new Date(transaction.createdAt);
            return transactionDate >= startDate && transactionDate <= endDate;
        });
    }

    async getTransactionsByAmountRange(
        accountId: string,
        minAmount: number,
        maxAmount: number,
        options: TransactionHistoryOptions = {}
    ): Promise<Transaction[]> {
        const transactions = await this.getTransactionHistory(accountId, options);
        return transactions.filter(transaction =>
            transaction.amount >= minAmount && transaction.amount <= maxAmount
        );
    }

    // Statistics and analytics
    async getTransactionStatistics(accountId: string): Promise<{
        totalTransactions: number;
        totalDeposits: number;
        totalWithdrawals: number;
        totalTransfers: number;
        totalAmount: number;
        averageAmount: number;
        pendingTransactions: number;
    }> {
        const transactions = await this.getTransactionHistory(accountId, { size: 1000 });

        const deposits = transactions.filter(t => t.type === 'DEPOSIT');
        const withdrawals = transactions.filter(t => t.type === 'WITHDRAWAL');
        const transfers = transactions.filter(t => t.type === 'TRANSFER');
        const pending = transactions.filter(t => t.status === 'PENDING');

        const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0);

        return {
            totalTransactions: transactions.length,
            totalDeposits: deposits.length,
            totalWithdrawals: withdrawals.length,
            totalTransfers: transfers.length,
            totalAmount,
            averageAmount: transactions.length > 0 ? totalAmount / transactions.length : 0,
            pendingTransactions: pending.length
        };
    }

    // Bulk operations
    async getMultipleTransactions(transactionIds: string[]): Promise<Map<string, Transaction | null>> {
        const transactionPromises = transactionIds.map(async (transactionId) => {
            try {
                const transaction = await this.getTransaction(transactionId);
                return { transactionId, transaction };
            } catch (error) {
                console.warn(`Failed to fetch transaction ${transactionId}:`, error);
                return { transactionId, transaction: null };
            }
        });

        const results = await Promise.all(transactionPromises);
        const transactionMap = new Map<string, Transaction | null>();

        results.forEach(({ transactionId, transaction }) => {
            transactionMap.set(transactionId, transaction);
        });

        return transactionMap;
    }

    // Search functionality
    async searchTransactions(
        accountId: string,
        searchTerm: string,
        options: TransactionHistoryOptions = {}
    ): Promise<Transaction[]> {
        const transactions = await this.getTransactionHistory(accountId, options);
        const searchLower = searchTerm.toLowerCase();

        return transactions.filter(transaction =>
            transaction.description.toLowerCase().includes(searchLower) ||
            transaction.transactionId.toLowerCase().includes(searchLower) ||
            transaction.amount.toString().includes(searchTerm)
        );
    }
}

export const transactionService = new TransactionService();