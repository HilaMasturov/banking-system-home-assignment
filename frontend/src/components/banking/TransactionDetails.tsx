import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Badge } from "../ui/badge";
import { useToast } from "../../hooks/use-toast";
import {
    Receipt,
    ArrowUpRight,
    ArrowDownLeft,
    RefreshCw,
    Copy,
    Calendar,
    FileText,
    X
} from "lucide-react";
import { Transaction } from "../services/transactionService";

interface TransactionDetailsProps {
    transaction: Transaction | null;
    accounts: { accountId: string; accountNumber: string }[];
    onClose: () => void;
}

const TransactionDetails = ({ transaction, accounts, onClose }: TransactionDetailsProps) => {
    const { toast } = useToast();

    if (!transaction) {
        return null;
    }

    const copyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text).then(() => {
            toast({
                title: "Copied",
                description: `${label} copied to clipboard`,
            });
        });
    };

    const getTransactionIcon = (type: string) => {
        switch (type) {
            case "DEPOSIT":
                return <ArrowDownLeft className="w-5 h-5 text-green-500" />;
            case "WITHDRAWAL":
                return <ArrowUpRight className="w-5 h-5 text-red-500" />;
            case "TRANSFER":
                return <RefreshCw className="w-5 h-5 text-blue-500" />;
            default:
                return <Receipt className="w-5 h-5 text-muted-foreground" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "COMPLETED":
                return "bg-green-100 text-green-800 border-green-200";
            case "PENDING":
                return "bg-yellow-100 text-yellow-800 border-yellow-200";
            case "FAILED":
                return "bg-red-100 text-red-800 border-red-200";
            default:
                return "bg-gray-100 text-gray-800 border-gray-200";
        }
    };

    const formatCurrency = (amount: number, currency: string) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency,
        }).format(amount);
    };

    const formatDateTime = (dateString: string) => {
        return new Date(dateString).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    const getAccountNumber = (accountId: string) => {
        const account = accounts.find(acc => acc.accountId === accountId);
        return account ? `****${account.accountNumber.slice(-4)}` : accountId;
    };

    return (
        <Card className="shadow-card border-border/50">
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <Receipt className="w-5 h-5" />
                        <span>Transaction Details</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Badge className={getStatusColor(transaction.status)}>
                            {transaction.status.toLowerCase()}
                        </Badge>
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={onClose}
                            className="p-1 h-6 w-6"
                        >
                            <X className="w-4 h-4" />
                        </Button>
                    </div>
                </CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">
                {/* Header Information */}
                <div className="flex items-center justify-between p-4 bg-muted/20 rounded-lg">
                    <div className="flex items-center space-x-3">
                        {getTransactionIcon(transaction.type)}
                        <div>
                            <h3 className="font-semibold text-lg">
                                {transaction.type} Transaction
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                {transaction.description}
                            </p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-2xl font-bold">
                            {formatCurrency(transaction.amount, transaction.currency)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                            {transaction.currency}
                        </p>
                    </div>
                </div>

                {/* Transaction Information Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Basic Information */}
                    <div className="space-y-4">
                        <h4 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
                            Transaction Information
                        </h4>

                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <Label className="text-sm text-muted-foreground">Transaction ID</Label>
                                <div className="flex items-center space-x-2">
                                    <span className="font-mono text-sm">{transaction.transactionId}</span>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => copyToClipboard(transaction.transactionId, 'Transaction ID')}
                                        className="p-1 h-6 w-6"
                                    >
                                        <Copy className="w-3 h-3" />
                                    </Button>
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <Label className="text-sm text-muted-foreground">Type</Label>
                                <div className="flex items-center space-x-2">
                                    {getTransactionIcon(transaction.type)}
                                    <span className="font-medium capitalize">
                                        {transaction.type.toLowerCase()}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <Label className="text-sm text-muted-foreground">Amount</Label>
                                <span className="font-semibold">
                                    {formatCurrency(transaction.amount, transaction.currency)}
                                </span>
                            </div>

                            <div className="flex items-center justify-between">
                                <Label className="text-sm text-muted-foreground">Status</Label>
                                <Badge className={getStatusColor(transaction.status)}>
                                    {transaction.status.toLowerCase()}
                                </Badge>
                            </div>

                            <div className="flex items-center justify-between">
                                <Label className="text-sm text-muted-foreground">Date & Time</Label>
                                <div className="flex items-center space-x-2">
                                    <Calendar className="w-4 h-4 text-muted-foreground" />
                                    <span className="text-sm">
                                        {formatDateTime(transaction.createdAt)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Account Information */}
                    <div className="space-y-4">
                        <h4 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
                            Account Details
                        </h4>

                        <div className="space-y-3">
                            {transaction.fromAccountId && (
                                <div className="flex items-center justify-between">
                                    <Label className="text-sm text-muted-foreground">From Account</Label>
                                    <div className="flex items-center space-x-2">
                                        <span className="font-mono text-sm">
                                            {getAccountNumber(transaction.fromAccountId)}
                                        </span>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => copyToClipboard(transaction.fromAccountId!, 'From Account ID')}
                                            className="p-1 h-6 w-6"
                                        >
                                            <Copy className="w-3 h-3" />
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {transaction.toAccountId && (
                                <div className="flex items-center justify-between">
                                    <Label className="text-sm text-muted-foreground">To Account</Label>
                                    <div className="flex items-center space-x-2">
                                        <span className="font-mono text-sm">
                                            {getAccountNumber(transaction.toAccountId)}
                                        </span>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => copyToClipboard(transaction.toAccountId!, 'To Account ID')}
                                            className="p-1 h-6 w-6"
                                        >
                                            <Copy className="w-3 h-3" />
                                        </Button>
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center justify-between">
                                <Label className="text-sm text-muted-foreground">Currency</Label>
                                <span className="font-medium">{transaction.currency}</span>
                            </div>

                            {transaction.description && (
                                <div className="flex items-start justify-between">
                                    <Label className="text-sm text-muted-foreground">Description</Label>
                                    <div className="flex items-start space-x-2 max-w-xs">
                                        <FileText className="w-4 h-4 text-muted-foreground mt-0.5" />
                                        <span className="text-sm text-right">
                                            {transaction.description}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Additional Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-border">
                    <div className="text-xs text-muted-foreground">
                        Transaction processed on {formatDateTime(transaction.createdAt)}
                    </div>
                    <div className="flex items-center space-x-2">
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => copyToClipboard(
                                JSON.stringify(transaction, null, 2),
                                'Transaction details'
                            )}
                        >
                            <Copy className="w-4 h-4 mr-1" />
                            Copy Details
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default TransactionDetails;