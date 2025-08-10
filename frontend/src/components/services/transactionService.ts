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

    // GET /api/transactions/account/{accountId}/paginated - Get paginated transaction history
    async getTransactionHistory(
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
            sortDirection,
            _t: Date.now().toString() // Cache busting parameter
        });

        return apiClient.get<PaginatedTransactionResponse>(`${this.baseUrl}/transactions/account/${accountId}/paginated?${params}`);
    }

    // GET /api/transactions/{transactionId} - Get transaction details
    async getTransaction(transactionId: string): Promise<Transaction> {
        return apiClient.get<Transaction>(`${this.baseUrl}/transactions/${transactionId}`);
    }

    // Get paginated transactions from multiple accounts
    async getPaginatedTransactionsForAccounts(
        accountIds: string[],
        options: TransactionHistoryOptions = {}
    ): Promise<PaginatedTransactionResponse> {
        if (accountIds.length === 0) {
            return {
                content: [],
                pageable: {
                    sort: { empty: true, sorted: false, unsorted: true },
                    offset: 0,
                    pageSize: options.size || 20,
                    pageNumber: options.page || 0,
                    paged: true,
                    unpaged: false
                },
                last: true,
                totalPages: 0,
                totalElements: 0,
                size: options.size || 20,
                number: options.page || 0,
                sort: { empty: true, sorted: false, unsorted: true },
                first: true,
                numberOfElements: 0,
                empty: true
            };
        }

        const {
            page = 0,
            size = 20,
            sortBy = 'createdAt',
            sortDirection = 'desc'
        } = options;

        try {
            // Fetch transactions from all accounts using the paginated endpoint
            // We need to fetch more data to account for potential duplicates across accounts
            const fetchSize = Math.max(size * 3, 100); // Fetch more to account for deduplication
            const promises = accountIds.map(accountId =>
                this.getTransactionHistory(accountId, { 
                    page: 0, // Always fetch from first page for aggregation
                    size: fetchSize,
                    sortBy,
                    sortDirection
                }).catch((error) => {
                    return { content: [], totalElements: 0 } as PaginatedTransactionResponse;
                })
            );

            const results = await Promise.all(promises);
            
            // Extract transactions and deduplicate
            const allTransactions = results.flatMap(result => result.content);
            const uniqueTransactions = allTransactions.reduce((acc, transaction) => {
                // Use transactionId as the key to ensure uniqueness
                if (!acc.some(t => t.transactionId === transaction.transactionId)) {
                    acc.push(transaction);
                }
                return acc;
            }, [] as Transaction[]);
            
            // Sort by creation date
            const sortedTransactions = uniqueTransactions.sort((a, b) => {
                const dateA = new Date(a.createdAt).getTime();
                const dateB = new Date(b.createdAt).getTime();
                return sortDirection === 'desc' ? dateB - dateA : dateA - dateB;
            });

            // Apply pagination
            const startIndex = page * size;
            const endIndex = startIndex + size;
            const paginatedContent = sortedTransactions.slice(startIndex, endIndex);
            const totalElements = sortedTransactions.length;
            const totalPages = Math.ceil(totalElements / size);

            return {
                content: paginatedContent,
                pageable: {
                    sort: { empty: false, sorted: true, unsorted: false },
                    offset: startIndex,
                    pageSize: size,
                    pageNumber: page,
                    paged: true,
                    unpaged: false
                },
                last: page >= totalPages - 1,
                totalPages,
                totalElements,
                size,
                number: page,
                sort: { empty: false, sorted: true, unsorted: false },
                first: page === 0,
                numberOfElements: paginatedContent.length,
                empty: paginatedContent.length === 0
            };
        } catch (error) {
            throw error;
        }
    }
}

export const transactionService = new TransactionService();