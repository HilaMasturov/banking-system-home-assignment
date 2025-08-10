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
}

export const accountService = new AccountService();