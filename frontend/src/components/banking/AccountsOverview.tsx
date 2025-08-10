import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { CreditCard } from "lucide-react";
import { Button } from "../ui/button";
import AccountCard from "./AccountCard";
import { Account } from "../services/accountService";
import { maskAccountNumber } from "../../lib/accountUtils";

interface AccountsOverviewProps {
    accounts: Account[];
    viewMode: "all" | "specific";
    selectedAccountId: string;
    selectedAccount: Account | null;
    onAccountSelectionChange: (viewMode: "all" | "specific", accountId?: string) => void;
    onViewAllAccounts: () => void;
}

const AccountsOverview = ({
    accounts,
    viewMode,
    selectedAccountId,
    selectedAccount,
    onAccountSelectionChange,
    onViewAllAccounts
}: AccountsOverviewProps) => {
    return (
        <Card className="shadow-card border-border/50">
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <CreditCard className="w-5 h-5" />
                        <span>My Accounts</span>
                    </div>
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
                            All
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
                            Select
                        </button>
                    </div>
                </CardTitle>
                {viewMode === "specific" && (
                    <div className="flex items-center space-x-3 mt-3 bg-muted/20 rounded-lg p-3">
                        <label htmlFor="account-select" className="text-sm font-medium text-muted-foreground whitespace-nowrap">
                            Select Account:
                        </label>
                        <select
                            id="account-select"
                            value={selectedAccountId}
                            onChange={(e) => onAccountSelectionChange("specific", e.target.value)}
                            className="flex-1 px-3 py-2 border border-input rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                        >
                            <option value="">Choose an account...</option>
                            {accounts.map((account) => (
                                <option key={account.accountId} value={account.accountId}>
                                    {maskAccountNumber(account.accountNumber)} - {account.accountType} ({account.currency})
                                </option>
                            ))}
                        </select>
                    </div>
                )}
            </CardHeader>
            <CardContent className="space-y-4">
                {/* View Mode Status */}
                {viewMode === "specific" && selectedAccount && (
                    <div className="bg-muted/20 rounded-lg p-3 mb-4">
                        <p className="text-sm text-muted-foreground">
                            Currently viewing: <span className="font-medium">{maskAccountNumber(selectedAccount.accountNumber)}</span> 
                            ({selectedAccount.accountType} - {selectedAccount.currency})
                        </p>
                    </div>
                )}

                {accounts.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                        <CreditCard className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p>No accounts found</p>
                    </div>
                ) : viewMode === "specific" && selectedAccount ? (
                    // Show only the selected account
                    <AccountCard
                        key={selectedAccount.accountId}
                        accountNumber={selectedAccount.accountNumber}
                        accountType={selectedAccount.accountType}
                        balance={selectedAccount.balance}
                        currency={selectedAccount.currency}
                        status={selectedAccount.status}
                    />
                ) : (
                    // Show first 3 accounts
                    accounts.slice(0, 3).map((account) => (
                        <AccountCard
                            key={account.accountId}
                            accountNumber={account.accountNumber}
                            accountType={account.accountType}
                            balance={account.balance}
                            currency={account.currency}
                            status={account.status}
                        />
                    ))
                )}
                
                {/* Action Buttons */}
                {viewMode === "all" && accounts.length > 3 && (
                    <Button
                        variant="outline"
                        className="w-full"
                        onClick={onViewAllAccounts}
                    >
                        View All Accounts ({accounts.length})
                    </Button>
                )}
                {viewMode === "specific" && selectedAccount && (
                    <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => onAccountSelectionChange("all")}
                    >
                        View All Accounts
                    </Button>
                )}
            </CardContent>
        </Card>
    );
};

export default AccountsOverview;
