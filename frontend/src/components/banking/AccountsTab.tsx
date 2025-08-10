import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { CreditCard } from "lucide-react";
import { Button } from "../ui/button";
import CreateAccountForm from "./CreateAccountForm";
import AccountCard from "./AccountCard";
import { Account } from "../services/accountService";
import { maskAccountNumber } from "../../lib/accountUtils";

interface AccountsTabProps {
    customerId: string;
    accounts: Account[];
    viewMode: "all" | "specific";
    selectedAccount: Account | null;
    onAccountCreated: () => void;
    onViewAllAccounts: () => void;
}

const AccountsTab = ({
    customerId,
    accounts,
    viewMode,
    selectedAccount,
    onAccountCreated,
    onViewAllAccounts
}: AccountsTabProps) => {
    return (
        <div className="space-y-6 mt-8">
            <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
                {/* Create Account */}
                <CreateAccountForm
                    customerId={customerId}
                    onAccountCreated={onAccountCreated}
                />
            </div>

            {/* All Accounts */}
            <Card className="shadow-card border-border/50">
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <CreditCard className="w-5 h-5" />
                                                    <span>
                            {viewMode === "specific" && selectedAccount 
                                ? `${maskAccountNumber(selectedAccount.accountNumber)} Account`
                                : "All Accounts"
                            }
                        </span>
                        </div>
                        {viewMode === "specific" && selectedAccount && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={onViewAllAccounts}
                            >
                                View All Accounts
                            </Button>
                        )}
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {viewMode === "specific" && selectedAccount ? (
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
                        // Show all accounts
                        accounts.map((account) => (
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
                </CardContent>
            </Card>
        </div>
    );
};

export default AccountsTab;
