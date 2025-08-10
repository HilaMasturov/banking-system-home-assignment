import { Card, CardContent } from "../ui/card";
import { CreditCard, TrendingUp, DollarSign } from "lucide-react";
import { Account } from "../services/accountService";
import { Transaction } from "../services/transactionService";

interface SummaryCardsProps {
    accounts: Account[];
    transactions: Transaction[];
    balancesByCurrency: Record<string, number>;
    formatCurrencyBalance: (amount: number, currency: string) => string;
}

const SummaryCards = ({ accounts, transactions, balancesByCurrency, formatCurrencyBalance }: SummaryCardsProps) => {
    const activeAccounts = accounts.filter(account => account.status === 'ACTIVE');

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
                <CardContent className="pt-6">
                    <div className="flex items-center">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <div className="ml-2">
                            <p className="text-sm font-medium text-muted-foreground">Total Balance</p>
                            <div className="mt-2 flex flex-wrap gap-2">
                                {Object.entries(balancesByCurrency).map(([currency, amount]) => (
                                    <span key={currency} className="text-lg font-semibold">
                                        {formatCurrencyBalance(amount, currency)}
                                    </span>
                                ))}
                                {Object.keys(balancesByCurrency).length === 0 && (
                                    <span className="text-lg font-semibold text-muted-foreground">
                                        No accounts
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="pt-6">
                    <div className="flex items-center">
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                        <div className="ml-2">
                            <p className="text-sm font-medium text-muted-foreground">Active Accounts</p>
                            <p className="text-2xl font-bold">{activeAccounts.length}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="pt-6">
                    <div className="flex items-center">
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        <div className="ml-2">
                            <p className="text-sm font-medium text-muted-foreground">Total Transactions</p>
                            <p className="text-2xl font-bold">{transactions.length}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default SummaryCards;
