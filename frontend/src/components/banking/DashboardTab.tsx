import SummaryCards from "./SummaryCards";
import AccountsOverview from "./AccountsOverview";
import RecentActivity from "./RecentActivity";
import { Account } from "../services/accountService";
import { Transaction } from "../services/transactionService";

interface DashboardTabProps {
    accounts: Account[];
    transactions: Transaction[];
    viewMode: "all" | "specific";
    selectedAccountId: string;
    selectedAccount: Account | null;
    transactionsLoading: boolean;
    totalTransactions: number;
    balancesByCurrency: Record<string, number>;
    formatCurrencyBalance: (amount: number, currency: string) => string;
    onAccountSelectionChange: (viewMode: "all" | "specific", accountId?: string) => void;
    onViewAllAccounts: () => void;
    onViewAllTransactions: () => void;
    onTransactionClick: (transaction: Transaction) => void;
}

const DashboardTab = ({
    accounts,
    transactions,
    viewMode,
    selectedAccountId,
    selectedAccount,
    transactionsLoading,
    totalTransactions,
    balancesByCurrency,
    formatCurrencyBalance,
    onAccountSelectionChange,
    onViewAllAccounts,
    onViewAllTransactions,
    onTransactionClick
}: DashboardTabProps) => {
    return (
        <div className="space-y-6 mt-8">
            {/* Summary Cards */}
            <SummaryCards
                accounts={accounts}
                transactions={transactions}
                totalTransactions={totalTransactions}
                balancesByCurrency={balancesByCurrency}
                formatCurrencyBalance={formatCurrencyBalance}
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Accounts Overview */}
                <AccountsOverview
                    accounts={accounts}
                    viewMode={viewMode}
                    selectedAccountId={selectedAccountId}
                    selectedAccount={selectedAccount}
                    onAccountSelectionChange={onAccountSelectionChange}
                    onViewAllAccounts={onViewAllAccounts}
                />

                {/* Recent Transactions */}
                <RecentActivity
                    transactions={transactions}
                    accounts={accounts}
                    selectedAccount={selectedAccount}
                    viewMode={viewMode}
                    transactionsLoading={transactionsLoading}
                    totalTransactions={totalTransactions}
                    onViewAllTransactions={onViewAllTransactions}
                    onTransactionClick={onTransactionClick}
                />
            </div>
        </div>
    );
};

export default DashboardTab;
