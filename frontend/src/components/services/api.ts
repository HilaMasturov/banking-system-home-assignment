export const API_CONFIG = {
    ACCOUNT_SERVICE_URL: 'http://localhost:8081/api/v1',
    TRANSACTION_SERVICE_URL: 'http://localhost:8082/api/v1'
};

class ApiClient {
    private async request<T>(url: string, options?: RequestInit): Promise<T> {
        try {
            const response = await fetch(url, {
                headers: {
                    'Content-Type': 'application/json',
                    ...options?.headers,
                },
                ...options,
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }

    async get<T>(url: string): Promise<T> {
        return this.request<T>(url);
    }

    async post<T>(url: string, data: any): Promise<T> {
        return this.request<T>(url, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async put<T>(url: string, data: any): Promise<T> {
        return this.request<T>(url, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }
}

export const apiClient = new ApiClient();