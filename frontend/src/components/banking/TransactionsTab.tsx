import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Receipt, RefreshCw, Settings } from "lucide-react";
import TransactionForm from "./TransactionForm";
import TransactionList from "./TransactionList";
import { Account } from "../services/accountService";
import { Transaction } from "../services/transactionService";
import { maskAccountNumber } from "../../lib/accountUtils";

interface TransactionsTabProps {
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
    onAccountSelectionChange: (viewMode: "all" | "specific", accountId?: string) => void;
    onTransactionSubmit: (transactionData: any) => Promise<void>;
    onTransactionClick: (transaction: Transaction) => void;
    onPageChange: (page: number) => void;
    onPageSizeChange: (pageSize: number) => void;
}

const TransactionsTab = ({
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
    onAccountSelectionChange,
    onTransactionSubmit,
    onTransactionClick,
    onPageChange,
    onPageSizeChange
}: TransactionsTabProps) => {
    return (
        <div className="space-y-6 mt-8">
            {/* Account Selection Controls */}
            <Card className="shadow-card border-border/50">
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <Settings className="w-5 h-5" />
                        <span>Transaction View Settings</span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="flex items-center space-x-2 bg-muted/30 rounded-lg p-1">
                            <button
                                type="button"
                                onClick={() => onAccountSelectionChange("all")}
                                className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                                    viewMode === "all"
                                        ? "bg-primary text-primary-foreground shadow-sm"
                                        : "bg-background text-muted-foreground hover:bg-muted hover:text-foreground"
                                }`}
                            >
                                All Accounts
                            </button>
                            <button
                                type="button"
                                onClick={() => onAccountSelectionChange("specific")}
                                className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                                    viewMode === "specific"
                                        ? "bg-primary text-primary-foreground shadow-sm"
                                        : "bg-background text-muted-foreground hover:bg-muted hover:text-foreground"
                                }`}
                            >
                                Select Account
                            </button>
                        </div>

                        {viewMode === "specific" && (
                            <div className="flex items-center space-x-2">
                                <select
                                    id="transactions-account-select"
                                    value={selectedAccountId}
                                    onChange={(e) => onAccountSelectionChange("specific", e.target.value)}
                                    className="flex-1 max-w-xs px-3 py-2 border border-input rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                >
                                    <option value="">Select an account</option>
                                    {accounts.map((account) => (
                                        <option key={account.accountId} value={account.accountId}>
                                            {maskAccountNumber(account.accountNumber)} - {account.accountType} ({account.currency})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {viewMode === "specific" && selectedAccount && (
                            <div className="bg-muted/20 rounded-lg p-3">
                                <p className="text-sm text-muted-foreground">
                                    Currently viewing transactions for: <span className="font-medium">{maskAccountNumber(selectedAccount.accountNumber)}</span> 
                                    ({selectedAccount.accountType} - {selectedAccount.currency})
                                </p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Transaction Form */}
            {accounts.length > 0 && (
                <Card className="shadow-card border-border/50">
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <Receipt className="w-5 h-5" />
                            <span>New Transaction</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <TransactionForm
                            accounts={accounts}
                            onTransactionSubmit={onTransactionSubmit}
                        />
                    </CardContent>
                </Card>
            )}

            {/* All Transactions */}
            <Card className="shadow-card border-border/50">
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <Receipt className="w-5 h-5" />
                        <span>
                            {viewMode === "specific" && selectedAccount 
                                ? `${maskAccountNumber(selectedAccount.accountNumber)} Transactions`
                                : "All Transactions"
                            }
                        </span>
                        <span className="text-sm text-muted-foreground ml-auto">
                            {totalTransactions > 0 ? (
                                <>
                                    Page {transactionPage + 1} of {totalTransactionPages} 
                                    ({totalTransactions} total)
                                </>
                            ) : (
                                `(${transactions.length} transactions loaded)`
                            )}
                        </span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {transactionsLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <RefreshCw className="w-8 h-8 animate-spin mr-2" />
                            <span>Loading transactions...</span>
                        </div>
                    ) : (
                        <TransactionList 
                            transactions={transactions} 
                            onTransactionClick={onTransactionClick}
                            accounts={accounts}
                            currentPage={transactionPage}
                            totalPages={totalTransactionPages}
                            totalElements={totalTransactions}
                            pageSize={transactionPageSize}
                            onPageChange={onPageChange}
                            onPageSizeChange={onPageSizeChange}
                            showPagination={true}
                        />
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default TransactionsTab;
