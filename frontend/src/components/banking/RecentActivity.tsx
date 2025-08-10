import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Receipt, RefreshCw } from "lucide-react";
import { Button } from "../ui/button";
import TransactionList from "./TransactionList";
import { Account } from "../services/accountService";
import { Transaction } from "../services/transactionService";
import { maskAccountNumber } from "../../lib/accountUtils";

interface RecentActivityProps {
    transactions: Transaction[];
    accounts: Account[];
    selectedAccount: Account | null;
    viewMode: "all" | "specific";
    transactionsLoading: boolean;
    totalTransactions: number;
    onViewAllTransactions: () => void;
    onTransactionClick: (transaction: Transaction) => void;
}

const RecentActivity = ({
    transactions,
    accounts,
    selectedAccount,
    viewMode,
    transactionsLoading,
    totalTransactions,
    onViewAllTransactions,
    onTransactionClick
}: RecentActivityProps) => {
    return (
        <Card className="shadow-card border-border/50">
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <Receipt className="w-5 h-5" />
                        <span>Recent Activity</span>
                        {viewMode === "specific" && selectedAccount && (
                            <span className="text-xs text-muted-foreground ml-2">
                                ({maskAccountNumber(selectedAccount.accountNumber)})
                            </span>
                        )}
                    </div>
                    <span className="text-sm text-muted-foreground">
                        ({totalTransactions} total)
                    </span>
                </CardTitle>
            </CardHeader>
            <CardContent>
                {transactionsLoading ? (
                    <div className="flex items-center justify-center py-8">
                        <RefreshCw className="w-6 h-6 animate-spin mr-2" />
                        <span className="text-sm text-muted-foreground">Loading transactions...</span>
                    </div>
                ) : (
                    <TransactionList 
                        transactions={transactions.slice(0, 5)} 
                        onTransactionClick={onTransactionClick}
                        accounts={accounts}
                        showPagination={false}
                    />
                )}
                {totalTransactions > 5 && (
                    <Button
                        variant="outline"
                        className="w-full mt-4"
                        onClick={onViewAllTransactions}
                    >
                        View All Transactions ({totalTransactions} total)
                        {viewMode === "specific" && selectedAccount && (
                            <span className="ml-2 text-xs opacity-75">
                                • {maskAccountNumber(selectedAccount.accountNumber)}
                            </span>
                        )}
                    </Button>
                )}
            </CardContent>
        </Card>
    );
};

export default RecentActivity;
