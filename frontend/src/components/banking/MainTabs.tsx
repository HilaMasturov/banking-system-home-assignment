import { TrendingUp, CreditCard, Receipt, Users, Settings } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import DashboardTab from "./DashboardTab";
import AccountsTab from "./AccountsTab";
import TransactionsTab from "./TransactionsTab";
import CustomersTab from "./CustomersTab";
import ManageTab from "./ManageTab";
import { Account } from "../services/accountService";
import { Transaction } from "../services/transactionService";
import { Customer } from "../services/customerService";

interface MainTabsProps {
    activeTab: string;
    accounts: Account[];
    transactions: Transaction[];
    viewMode: "all" | "specific";
    selectedAccountId: string;
    selectedAccount: Account | null;
    transactionsLoading: boolean;
    transactionPage: number;
    totalTransactionPages: number;
    totalTransactions: number;
    transactionPageSize: number;
    balancesByCurrency: Record<string, number>;
    formatCurrencyBalance: (amount: number, currency: string) => string;
    currentCustomer: Customer | null;
    onTabChange: (tab: string) => void;
    onAccountSelectionChange: (viewMode: "all" | "specific", accountId?: string) => void;
    onTransactionSubmit: (transactionData: any) => Promise<void>;
    onTransactionClick: (transaction: Transaction) => void;
    onPageChange: (page: number) => void;
    onPageSizeChange: (pageSize: number) => void;
    onCustomerChange: (customer: Customer | null) => void;
    onAccountCreated: () => void;
    onAccountUpdated: () => void;
}

const MainTabs = ({
    activeTab,
    accounts,
    transactions,
    viewMode,
    selectedAccountId,
    selectedAccount,
    transactionsLoading,
    transactionPage,
    totalTransactionPages,
    totalTransactions,
    transactionPageSize,
    balancesByCurrency,
    formatCurrencyBalance,
    currentCustomer,
    onTabChange,
    onAccountSelectionChange,
    onTransactionSubmit,
    onTransactionClick,
    onPageChange,
    onPageSizeChange,
    onCustomerChange,
    onAccountCreated,
    onAccountUpdated
}: MainTabsProps) => {
    const handleViewAllAccounts = () => onTabChange("accounts");
    const handleViewAllTransactions = () => onTabChange("transactions");

    return (
        <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
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
            <TabsContent value="dashboard">
                <DashboardTab
                    accounts={accounts}
                    transactions={transactions}
                    viewMode={viewMode}
                    selectedAccountId={selectedAccountId}
                    selectedAccount={selectedAccount}
                    transactionsLoading={transactionsLoading}
                    totalTransactions={totalTransactions}
                    balancesByCurrency={balancesByCurrency}
                    formatCurrencyBalance={formatCurrencyBalance}
                    onAccountSelectionChange={onAccountSelectionChange}
                    onViewAllAccounts={handleViewAllAccounts}
                    onViewAllTransactions={handleViewAllTransactions}
                    onTransactionClick={onTransactionClick}
                />
            </TabsContent>

            {/* Accounts Tab */}
            <TabsContent value="accounts">
                <AccountsTab
                    customerId={currentCustomer?.customerId || ""}
                    accounts={accounts}
                    viewMode={viewMode}
                    selectedAccount={selectedAccount}
                    onAccountCreated={onAccountCreated}
                    onViewAllAccounts={handleViewAllAccounts}
                />
            </TabsContent>

            {/* Transactions Tab */}
            <TabsContent value="transactions">
                <TransactionsTab
                    accounts={accounts}
                    transactions={transactions}
                    viewMode={viewMode}
                    selectedAccountId={selectedAccountId}
                    selectedAccount={selectedAccount}
                    transactionsLoading={transactionsLoading}
                    transactionPage={transactionPage}
                    totalTransactionPages={totalTransactionPages}
                    totalTransactions={totalTransactions}
                    transactionPageSize={transactionPageSize}
                    onAccountSelectionChange={onAccountSelectionChange}
                    onTransactionSubmit={onTransactionSubmit}
                    onTransactionClick={onTransactionClick}
                    onPageChange={onPageChange}
                    onPageSizeChange={onPageSizeChange}
                />
            </TabsContent>

            {/* Customers Tab */}
            <TabsContent value="customers">
                <CustomersTab
                    currentCustomer={currentCustomer}
                    onCustomerChange={onCustomerChange}
                />
            </TabsContent>

            {/* Manage Tab */}
            <TabsContent value="manage">
                <ManageTab
                    accounts={accounts}
                    onAccountUpdated={onAccountUpdated}
                />
            </TabsContent>
        </Tabs>
    );
};

export default MainTabs;
