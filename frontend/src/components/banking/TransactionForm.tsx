// src/components/TransactionForm.tsx
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card.tsx";
import { Button } from "../ui/button.tsx";
import { Input } from "../ui/input.tsx";
import { Label } from "../ui/label.tsx";
import { Textarea } from "../ui/textarea.tsx";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select.tsx";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs.tsx";
import { useToast } from '../../hooks/use-toast.ts';
import {
    Send,
    Download,
    ArrowUpRight,
    CreditCard,
    AlertCircle
} from "lucide-react";
import { Account } from "../services/accountService";

interface TransactionFormProps {
    accounts: Account[];
    onTransactionSubmit: (transaction: any) => Promise<void>;
}

const TransactionForm = ({ accounts, onTransactionSubmit }: TransactionFormProps) => {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);

    // Form states for different transaction types
    const [depositForm, setDepositForm] = useState({
        accountId: "",
        amount: "",
        description: ""
    });

    const [withdrawForm, setWithdrawForm] = useState({
        accountId: "",
        amount: "",
        description: ""
    });

    const [transferForm, setTransferForm] = useState({
        fromAccountId: "",
        toAccountId: "",
        amount: "",
        description: ""
    });

    const validateAmount = (amount: string): number => {
        const numAmount = parseFloat(amount);
        if (isNaN(numAmount) || numAmount <= 0) {
            throw new Error("Please enter a valid amount greater than 0");
        }
        if (numAmount > 1000000) {
            throw new Error("Amount cannot exceed $1,000,000");
        }
        return numAmount;
    };

    const handleDeposit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!depositForm.accountId || !depositForm.amount) {
            toast({
                title: "Missing Information",
                description: "Please fill in all required fields.",
                variant: "destructive",
            });
            return;
        }

        setLoading(true);

        try {
            const amount = validateAmount(depositForm.amount);

            const transaction = {
                type: "DEPOSIT",
                accountId: depositForm.accountId,  // Changed from toAccountId to accountId
                amount: amount,
                description: depositForm.description || "Deposit transaction",
                currency: "USD"
            };

            await onTransactionSubmit(transaction);
            setDepositForm({ accountId: "", amount: "", description: "" });
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Deposit failed";
            toast({
                title: "Deposit Failed",
                description: errorMessage,
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleWithdraw = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!withdrawForm.accountId || !withdrawForm.amount) {
            toast({
                title: "Missing Information",
                description: "Please fill in all required fields.",
                variant: "destructive",
            });
            return;
        }

        setLoading(true);

        try {
            const amount = validateAmount(withdrawForm.amount);
            const selectedAccount = accounts.find(acc => acc.accountId === withdrawForm.accountId);

            if (selectedAccount && amount > selectedAccount.balance) {
                toast({
                    title: "Insufficient Funds",
                    description: "You don't have enough balance for this withdrawal.",
                    variant: "destructive",
                });
                setLoading(false);
                return;
            }

            const transaction = {
                type: "WITHDRAWAL",
                accountId: withdrawForm.accountId,  // Changed from fromAccountId to accountId
                amount: amount,
                description: withdrawForm.description || "Withdrawal transaction",
                currency: "USD"
            };

            await onTransactionSubmit(transaction);
            setWithdrawForm({ accountId: "", amount: "", description: "" });
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Withdrawal failed";
            toast({
                title: "Withdrawal Failed",
                description: errorMessage,
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleTransfer = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!transferForm.fromAccountId || !transferForm.toAccountId || !transferForm.amount) {
            toast({
                title: "Missing Information",
                description: "Please fill in all required fields.",
                variant: "destructive",
            });
            return;
        }

        setLoading(true);

        try {
            if (transferForm.fromAccountId === transferForm.toAccountId) {
                toast({
                    title: "Invalid Transfer",
                    description: "You cannot transfer to the same account.",
                    variant: "destructive",
                });
                setLoading(false);
                return;
            }

            const amount = validateAmount(transferForm.amount);
            const fromAccount = accounts.find(acc => acc.accountId === transferForm.fromAccountId);

            if (fromAccount && amount > fromAccount.balance) {
                toast({
                    title: "Insufficient Funds",
                    description: "You don't have enough balance for this transfer.",
                    variant: "destructive",
                });
                setLoading(false);
                return;
            }

            const transaction = {
                type: "TRANSFER",
                fromAccountId: transferForm.fromAccountId,
                toAccountId: transferForm.toAccountId,
                amount: amount,
                description: transferForm.description || "Transfer transaction",
                currency: "USD"
            };

            await onTransactionSubmit(transaction);
            setTransferForm({ fromAccountId: "", toAccountId: "", amount: "", description: "" });
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Transfer failed";
            toast({
                title: "Transfer Failed",
                description: errorMessage,
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    // Filter active accounts only
    const activeAccounts = accounts.filter(account => account.status === 'ACTIVE');

    if (activeAccounts.length === 0) {
        return (
            <Card className="shadow-card border-border/50">
                <CardContent className="pt-6">
                    <div className="text-center py-8 text-muted-foreground">
                        <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p>No active accounts available for transactions</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="shadow-card border-border/50">
            <CardContent>
                <Tabs defaultValue="deposit" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="deposit" className="flex items-center space-x-2">
                            <Download className="w-4 h-4" />
                            <span>Deposit</span>
                        </TabsTrigger>
                        <TabsTrigger value="withdraw" className="flex items-center space-x-2">
                            <ArrowUpRight className="w-4 h-4" />
                            <span>Withdraw</span>
                        </TabsTrigger>
                        <TabsTrigger value="transfer" className="flex items-center space-x-2">
                            <Send className="w-4 h-4" />
                            <span>Transfer</span>
                        </TabsTrigger>
                    </TabsList>

                    {/* Deposit Tab */}
                    <TabsContent value="deposit" className="space-y-4 mt-6">
                        <form onSubmit={handleDeposit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="deposit-account">To Account</Label>
                                <Select
                                    value={depositForm.accountId}
                                    onValueChange={(value) => setDepositForm({...depositForm, accountId: value})}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select account" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {activeAccounts.map((account) => (
                                            <SelectItem key={account.accountId} value={account.accountId}>
                                                {account.accountType} - ****{account.accountNumber.slice(-4)}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="deposit-amount">Amount ($)</Label>
                                <Input
                                    id="deposit-amount"
                                    type="number"
                                    step="0.01"
                                    min="0.01"
                                    max="1000000"
                                    placeholder="0.00"
                                    value={depositForm.amount}
                                    onChange={(e) => setDepositForm({...depositForm, amount: e.target.value})}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="deposit-description">Description (Optional)</Label>
                                <Textarea
                                    id="deposit-description"
                                    placeholder="Enter transaction description"
                                    value={depositForm.description}
                                    onChange={(e) => setDepositForm({...depositForm, description: e.target.value})}
                                />
                            </div>

                            <Button
                                type="submit"
                                className="w-full bg-gradient-primary hover:bg-primary-hover"
                                disabled={loading}
                            >
                                {loading ? "Processing..." : "Deposit Funds"}
                            </Button>
                        </form>
                    </TabsContent>

                    {/* Withdraw Tab */}
                    <TabsContent value="withdraw" className="space-y-4 mt-6">
                        <form onSubmit={handleWithdraw} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="withdraw-account">From Account</Label>
                                <Select
                                    value={withdrawForm.accountId}
                                    onValueChange={(value) => setWithdrawForm({...withdrawForm, accountId: value})}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select account" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {activeAccounts.map((account) => (
                                            <SelectItem key={account.accountId} value={account.accountId}>
                                                {account.accountType} - ****{account.accountNumber.slice(-4)} (${account.balance.toFixed(2)})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="withdraw-amount">Amount ($)</Label>
                                <Input
                                    id="withdraw-amount"
                                    type="number"
                                    step="0.01"
                                    min="0.01"
                                    max="1000000"
                                    placeholder="0.00"
                                    value={withdrawForm.amount}
                                    onChange={(e) => setWithdrawForm({...withdrawForm, amount: e.target.value})}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="withdraw-description">Description (Optional)</Label>
                                <Textarea
                                    id="withdraw-description"
                                    placeholder="Enter transaction description"
                                    value={withdrawForm.description}
                                    onChange={(e) => setWithdrawForm({...withdrawForm, description: e.target.value})}
                                />
                            </div>

                            <Button
                                type="submit"
                                className="w-full bg-gradient-primary hover:bg-primary-hover"
                                disabled={loading}
                            >
                                {loading ? "Processing..." : "Withdraw Funds"}
                            </Button>
                        </form>
                    </TabsContent>

                    {/* Transfer Tab */}
                    <TabsContent value="transfer" className="space-y-4 mt-6">
                        <form onSubmit={handleTransfer} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="transfer-from">From Account</Label>
                                <Select
                                    value={transferForm.fromAccountId}
                                    onValueChange={(value) => setTransferForm({...transferForm, fromAccountId: value})}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select source account" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {activeAccounts.map((account) => (
                                            <SelectItem key={account.accountId} value={account.accountId}>
                                                {account.accountType} - ****{account.accountNumber.slice(-4)} (${account.balance.toFixed(2)})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="transfer-to">To Account</Label>
                                <Select
                                    value={transferForm.toAccountId}
                                    onValueChange={(value) => setTransferForm({...transferForm, toAccountId: value})}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select destination account" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {activeAccounts
                                            .filter(account => account.accountId !== transferForm.fromAccountId)
                                            .map((account) => (
                                                <SelectItem key={account.accountId} value={account.accountId}>
                                                    {account.accountType} - ****{account.accountNumber.slice(-4)}
                                                </SelectItem>
                                            ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="transfer-amount">Amount ($)</Label>
                                <Input
                                    id="transfer-amount"
                                    type="number"
                                    step="0.01"
                                    min="0.01"
                                    max="1000000"
                                    placeholder="0.00"
                                    value={transferForm.amount}
                                    onChange={(e) => setTransferForm({...transferForm, amount: e.target.value})}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="transfer-description">Description (Optional)</Label>
                                <Textarea
                                    id="transfer-description"
                                    placeholder="Enter transaction description"
                                    value={transferForm.description}
                                    onChange={(e) => setTransferForm({...transferForm, description: e.target.value})}
                                />
                            </div>

                            <Button
                                type="submit"
                                className="w-full bg-gradient-primary hover:bg-primary-hover"
                                disabled={loading}
                            >
                                {loading ? "Processing..." : "Transfer Funds"}
                            </Button>
                        </form>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
};

export default TransactionForm;