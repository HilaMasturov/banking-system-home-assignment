import { apiClient, API_CONFIG } from './api';

export interface Account {
    accountId: string;
    customerId: string;
    accountNumber: string;
    accountType: 'SAVINGS' | 'CHECKING';
    balance: number;
    currency: string;
    status: 'ACTIVE' | 'INACTIVE' | 'BLOCKED';
    createdAt: string;
    updatedAt: string;
}

export interface CreateAccountRequest {
    customerId: string;
    accountType: 'SAVINGS' | 'CHECKING';
    currency: string;
    initialDeposit?: number;
}

export interface UpdateAccountRequest {
    status?: 'ACTIVE' | 'INACTIVE' | 'BLOCKED';
    currency?: string;
}

export interface AccountValidationResult {
    exists: boolean;
    isActive: boolean;
    accountType?: string;
    currency?: string;
}

export class AccountService {
    private baseUrl = API_CONFIG.ACCOUNT_SERVICE_URL;

    // POST /api/accounts - Create new account
    async createAccount(accountData: CreateAccountRequest): Promise<Account> {
        return apiClient.post<Account>(`${this.baseUrl}/accounts`, accountData);
    }

    // GET /api/accounts/{accountId} - Get account details
    async getAccount(accountId: string): Promise<Account> {
        return apiClient.get<Account>(`${this.baseUrl}/accounts/${accountId}`);
    }

    // GET /api/accounts/customer/{customerId} - Get customer accounts
    async getAccountsByCustomer(customerId: string): Promise<Account[]> {
        return apiClient.get<Account[]>(`${this.baseUrl}/accounts/customer/${customerId}`);
    }

    // PUT /api/accounts/{accountId} - Update account
    async updateAccount(accountId: string, updateData: UpdateAccountRequest): Promise<Account> {
        return apiClient.put<Account>(`${this.baseUrl}/accounts/${accountId}`, updateData);
    }

    // GET /api/accounts/{accountId}/balance - Get account balance
    async getAccountBalance(accountId: string): Promise<{ balance: number; currency: string }> {
        return apiClient.get<{ balance: number; currency: string }>(`${this.baseUrl}/accounts/${accountId}/balance`);
    }

    // GET /api/accounts/{accountId}/exists - Check if account exists
    async accountExists(accountId: string): Promise<boolean> {
        const response = await apiClient.get<{ exists: boolean }>(`${this.baseUrl}/accounts/${accountId}/exists`);
        return response.exists;
    }

    // PUT /api/accounts/{accountId}/balance - Update account balance (used by transaction service)
    async updateAccountBalance(accountId: string, newBalance: number): Promise<void> {
        await apiClient.put<void>(`${this.baseUrl}/accounts/${accountId}/balance`, {
            balance: newBalance
        });
    }

    // GET /api/accounts/{accountId}/validate - Validate account exists and is active
    async validateAccount(accountId: string): Promise<AccountValidationResult> {
        return apiClient.get<AccountValidationResult>(`${this.baseUrl}/accounts/${accountId}/validate`);
    }

    // Helper methods for common operations
    async validateAccountForTransaction(accountId: string): Promise<Account> {
        try {
            return await this.getAccount(accountId);
        } catch (error) {
            throw new Error(`Account ${accountId} not found or invalid`);
        }
    }

    async hasSufficientBalance(accountId: string, amount: number): Promise<boolean> {
        try {
            const balanceInfo = await this.getAccountBalance(accountId);
            return balanceInfo.balance >= amount;
        } catch (error) {
            return false;
        }
    }

    async isAccountActive(accountId: string): Promise<boolean> {
        try {
            const validation = await this.validateAccount(accountId);
            return validation.exists && validation.isActive;
        } catch (error) {
            return false;
        }
    }

    // Bulk operations
    async validateMultipleAccounts(accountIds: string[]): Promise<Map<string, AccountValidationResult>> {
        const validationPromises = accountIds.map(async (accountId) => {
            try {
                const result = await this.validateAccount(accountId);
                return { accountId, result };
            } catch (error) {
                return {
                    accountId,
                    result: { exists: false, isActive: false } as AccountValidationResult
                };
            }
        });

        const validations = await Promise.all(validationPromises);
        const validationMap = new Map<string, AccountValidationResult>();

        validations.forEach(({ accountId, result }) => {
            validationMap.set(accountId, result);
        });

        return validationMap;
    }

    async getMultipleAccountBalances(accountIds: string[]): Promise<Map<string, { balance: number; currency: string }>> {
        const balancePromises = accountIds.map(async (accountId) => {
            try {
                const balance = await this.getAccountBalance(accountId);
                return { accountId, balance };
            } catch (error) {
                return {
                    accountId,
                    balance: { balance: 0, currency: 'USD' }
                };
            }
        });

        const balances = await Promise.all(balancePromises);
        const balanceMap = new Map<string, { balance: number; currency: string }>();

        balances.forEach(({ accountId, balance }) => {
            balanceMap.set(accountId, balance);
        });

        return balanceMap;
    }
}

export const accountService = new AccountService();