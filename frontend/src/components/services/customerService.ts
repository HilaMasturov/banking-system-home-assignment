import { apiClient, API_CONFIG } from './api';

export interface Customer {
    customerId: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    createdAt: string;
}

export interface CustomerCreateRequest {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
}

class CustomerService {
    private baseUrl = `${API_CONFIG.ACCOUNT_SERVICE_URL}/customers`;

    async createCustomer(customerData: CustomerCreateRequest): Promise<Customer> {
        return await apiClient.post<Customer>(this.baseUrl, customerData);
    }

    async getAllCustomers(): Promise<Customer[]> {
        return await apiClient.get<Customer[]>(this.baseUrl);
    }

    async customerExistsByEmail(email: string): Promise<boolean> {
        const response = await apiClient.get<{ exists: boolean }>(`${this.baseUrl}/email/${email}/exists`);
        return response.exists;
    }
}

export const customerService = new CustomerService();
