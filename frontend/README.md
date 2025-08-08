# Banking System Frontend

A modern React frontend for the banking system, built with TypeScript, Vite, and shadcn/ui. This application provides a responsive and intuitive interface for managing banking operations including customer management, account management, and transaction processing.

## 🏗️ Architecture

The frontend is a single-page application (SPA) that communicates with the backend microservices:

- **Account Service**: Customer and account management
- **Transaction Service**: Transaction processing and history
- **Real-time Updates**: Immediate UI updates after transactions
- **Responsive Design**: Works on desktop, tablet, and mobile devices

## 🚀 Quick Start

### Prerequisites

- **Node.js 18+** and npm
- **Account Service** running on port 8081
- **Transaction Service** running on port 8082

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Configuration

The frontend automatically connects to the backend services. Ensure the services are running:

- Account Service: http://localhost:8081
- Transaction Service: http://localhost:8082

### 3. Start Development Server

```bash
npm run dev
```

The application will be available at: **http://localhost:8080**

### 4. Build for Production

```bash
npm run build
```

## 🎨 Features

### Core Banking Features
- ✅ **Customer Management**: Create and manage customer profiles
- ✅ **Account Management**: Create and manage bank accounts
- ✅ **Transaction Processing**: Deposits, withdrawals, and transfers
- ✅ **Real-time Balance Updates**: Immediate balance reflection
- ✅ **Multi-currency Support**: Handle different currencies
- ✅ **Transaction History**: View detailed transaction records

### User Experience Features
- ✅ **Responsive Design**: Works on all device sizes
- ✅ **Modern UI**: Clean, intuitive interface with shadcn/ui
- ✅ **Real-time Feedback**: Toast notifications for all actions
- ✅ **Loading States**: Smooth loading indicators
- ✅ **Error Handling**: User-friendly error messages
- ✅ **Form Validation**: Client-side validation with Zod

### Technical Features
- ✅ **TypeScript**: Full type safety
- ✅ **React Query**: Efficient data fetching and caching
- ✅ **React Router**: Client-side routing
- ✅ **Tailwind CSS**: Utility-first styling
- ✅ **Vite**: Fast development and build tooling

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/           # React components
│   │   ├── banking/         # Banking-specific components
│   │   │   ├── BankingSystem.tsx
│   │   │   ├── AccountCard.tsx
│   │   │   ├── TransactionForm.tsx
│   │   │   ├── TransactionList.tsx
│   │   │   ├── CustomerManagement.tsx
│   │   │   ├── AccountManagement.tsx
│   │   │   └── CreateAccountForm.tsx
│   │   ├── services/        # API service layer
│   │   │   ├── api.ts
│   │   │   ├── accountService.ts
│   │   │   ├── transactionService.ts
│   │   │   └── customerService.ts
│   │   ├── ui/             # shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   └── ...
│   │   └── utils/          # Utility functions
│   ├── pages/              # Page components
│   │   ├── Index.tsx
│   │   └── NotFound.tsx
│   ├── App.tsx             # Main application component
│   └── main.tsx            # Application entry point
├── public/                 # Static assets
├── package.json            # Dependencies and scripts
├── vite.config.ts          # Vite configuration
├── tailwind.config.ts      # Tailwind CSS configuration
└── tsconfig.json          # TypeScript configuration
```

## 🎯 Key Components

### BankingSystem.tsx
The main application component that orchestrates the banking interface:

```typescript
const BankingSystem = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [currentCustomer, setCurrentCustomer] = useState<Customer | null>(null);

  // Load data for selected customer
  const loadData = async (showRefreshing = false) => {
    // Fetch accounts and transactions
  };

  // Handle transaction submission
  const handleTransactionSubmit = async (transactionData: any) => {
    // Process transaction and update UI
  };
};
```

### CustomerManagement.tsx
Handles customer creation and selection:

```typescript
const CustomerManagement = ({ onCustomerChange, currentCustomer }) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  
  // Customer selection with card-based UI
  const handleCustomerSelect = (customer: Customer) => {
    onCustomerChange(customer);
  };
};
```

### TransactionForm.tsx
Provides transaction processing interface:

```typescript
const TransactionForm = ({ onTransactionSubmit }) => {
  const [activeTab, setActiveTab] = useState("deposit");
  
  // Handle different transaction types
  const handleDeposit = async (data) => {
    await onTransactionSubmit({ type: "DEPOSIT", ...data });
  };
};
```

## 🔧 Configuration

### Environment Variables

Create `.env.local` for custom configuration:

```env
# API Configuration
VITE_ACCOUNT_SERVICE_URL=http://localhost:8081
VITE_TRANSACTION_SERVICE_URL=http://localhost:8082

# Feature Flags
VITE_ENABLE_DEBUG_MODE=false
VITE_ENABLE_ANALYTICS=false
```

### API Configuration

The frontend automatically configures API endpoints:

```typescript
// src/config/api.ts
export const API_CONFIG = {
  ACCOUNT_SERVICE_URL: import.meta.env.VITE_ACCOUNT_SERVICE_URL || 'http://localhost:8081',
  TRANSACTION_SERVICE_URL: import.meta.env.VITE_TRANSACTION_SERVICE_URL || 'http://localhost:8082',
};
```

## 🧪 Testing

### Run Tests
```bash
# Install testing dependencies
npm install --save-dev @testing-library/react @testing-library/jest-dom

# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

### Test Structure
```
src/
├── __tests__/              # Test files
│   ├── components/         # Component tests
│   │   ├── BankingSystem.test.tsx
│   │   ├── TransactionForm.test.tsx
│   │   └── CustomerManagement.test.tsx
│   ├── services/          # Service tests
│   │   ├── accountService.test.ts
│   │   └── transactionService.test.ts
│   └── utils/             # Utility tests
```

## 🐳 Docker Support

### Build Image
```bash
docker build -t banking-frontend .
```

### Run Container
```bash
docker run -p 8080:8080 \
  -e VITE_ACCOUNT_SERVICE_URL=http://host.docker.internal:8081 \
  -e VITE_TRANSACTION_SERVICE_URL=http://host.docker.internal:8082 \
  banking-frontend
```

### Docker Compose
```yaml
frontend:
  build: ./frontend
  ports:
          - "8080:8080"
  environment:
    - VITE_ACCOUNT_SERVICE_URL=http://account-service:8081
    - VITE_TRANSACTION_SERVICE_URL=http://transaction-service:8082
  depends_on:
    - account-service
    - transaction-service
```

## 🚨 Troubleshooting

### Common Issues

#### 1. API Connection Issues
```bash
# Check if backend services are running
curl http://localhost:8081/actuator/health
curl http://localhost:8082/actuator/health

# Check browser console for CORS errors
```

#### 2. Build Issues
```bash
# Clear node modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Vite cache
rm -rf node_modules/.vite
```

#### 3. Port Conflicts
```bash
# Check if port 8080 is in use
lsof -i :8080

# Use different port
npm run dev -- --port 3001
```

### Development Tips

#### 1. Hot Reload
The development server supports hot reload for instant feedback:
```bash
npm run dev
```

#### 2. Debug Mode
Enable debug logging in the browser console:
```typescript
// Add to any component
console.log('🔄 Loading data:', data);
```

#### 3. Network Tab
Monitor API calls in browser DevTools Network tab for debugging.

## 📈 Performance

### Optimization Features
- **Code Splitting**: Automatic route-based code splitting
- **Tree Shaking**: Unused code elimination
- **Image Optimization**: Automatic image optimization
- **Caching**: Browser caching for static assets

### Bundle Analysis
```bash
# Analyze bundle size
npm run build
npx vite-bundle-analyzer dist
```

## 🔐 Security

### Development Environment
- **CORS**: Configured for local development
- **Input Validation**: Client-side validation with Zod
- **Error Handling**: Secure error messages

### Production Considerations
- [ ] Configure HTTPS
- [ ] Set up CSP headers
- [ ] Implement authentication
- [ ] Add rate limiting
- [ ] Configure CORS properly

## 🎨 Styling

### Design System
The application uses a consistent design system:

- **Colors**: Tailwind CSS color palette
- **Typography**: Inter font family
- **Spacing**: Consistent spacing scale
- **Components**: shadcn/ui component library

### Customization
```typescript
// tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          // ... custom colors
        }
      }
    }
  }
}
```

## 📱 Responsive Design

### Breakpoints
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

### Mobile-First Approach
```css
/* Mobile styles */
.card {
  @apply p-4;
}

/* Tablet and up */
@media (min-width: 768px) {
  .card {
    @apply p-6;
  }
}
```

## 🔄 State Management

### React Query
Used for server state management:

```typescript
import { useQuery, useMutation } from '@tanstack/react-query';

// Fetch accounts
const { data: accounts, isLoading } = useQuery({
  queryKey: ['accounts', customerId],
  queryFn: () => accountService.getAccountsByCustomer(customerId)
});

// Create transaction
const mutation = useMutation({
  mutationFn: transactionService.deposit,
  onSuccess: () => {
    // Invalidate and refetch
    queryClient.invalidateQueries(['accounts']);
  }
});
```

### Local State
React hooks for component state:

```typescript
const [currentCustomer, setCurrentCustomer] = useState<Customer | null>(null);
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);
```

## 📚 API Integration

### Service Layer
Organized API calls in service modules:

```typescript
// accountService.ts
export class AccountService {
  async getAccountsByCustomer(customerId: string): Promise<Account[]> {
    return apiClient.get<Account[]>(`${this.baseUrl}/accounts/customer/${customerId}`);
  }
}
```

### Error Handling
Consistent error handling across the application:

```typescript
try {
  const result = await apiCall();
  // Handle success
} catch (error) {
  console.error('API Error:', error);
  toast({
    title: "Error",
    description: error.message,
    variant: "destructive"
  });
}
```

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Deploy to Netlify
```bash
# Build the project
npm run build

# Deploy to Netlify
netlify deploy --prod --dir=dist
```

---

**Built with React, TypeScript, and ❤️**
