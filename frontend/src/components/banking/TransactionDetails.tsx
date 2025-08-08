import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
    Receipt,
    Search,
    ArrowUpRight,
    ArrowDownLeft,
    RefreshCw,
    Copy,
    ExternalLink,
    Calendar,
    DollarSign,
    FileText,
    AlertCircle
} from "lucide-react";
import { Transaction, transactionService } from "../services/transactionService";

interface TransactionDetailsProps {
    accounts: { accountId: string; accountNumber: string }[];
}

const TransactionDetails = ({ accounts }: TransactionDetailsProps) => {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
    const [searchResults, setSearchResults] = useState<Transaction[]>([]);

    const handleSearch = async () => {
        if (!searchTerm.trim()) {
            toast({
                title: "Search Required",
                description: "Please enter a transaction ID to search",
                variant: "destructive",
            });
            return;
        }

        setLoading(true);

        try {
            console.log('🔍 Searching for transaction:', searchTerm);

            if (searchTerm.startsWith('txn_') || searchTerm.length > 10) {
                // Search by transaction ID
                const transaction = await transactionService.getTransaction(searchTerm);
                console.log('✅ Found transaction:', transaction);
                setSelectedTransaction(transaction);
                setSearchResults([transaction]);
            } else {
                // Search in transaction history for all accounts
                console.log('🔍 Searching transaction descriptions...');
                const allResults: Transaction[] = [];

                for (const account of accounts) {
                    try {
                        const transactions = await transactionService.searchTransactions(
                            account.accountId,
                            searchTerm
                        );
                        allResults.push(...transactions);
                    } catch (error) {
                        console.warn(`Failed to search transactions for account ${account.accountId}:`, error);
                    }
                }

                console.log('✅ Found transactions:', allResults.length);
                setSearchResults(allResults);
                setSelectedTransaction(allResults.length > 0 ? allResults[0] : null);
            }

            if (searchResults.length === 0 && !selectedTransaction) {
                toast({
                    title: "No Results",
                    description: "No transactions found matching your search criteria",
                });
            }

        } catch (error) {
            console.error('❌ Search failed:', error);
            const errorMessage = error instanceof Error ? error.message : 'Search failed';
            toast({
                title: "Search Failed",
                description: errorMessage,
                variant: "destructive",
            });
            setSelectedTransaction(null);
            setSearchResults([]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

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
        <div className="space-y-6">
            {/* Search Section */}
            <Card className="shadow-card border-border/50">
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <Search className="w-5 h-5" />
                        <span>Transaction Search</span>
                    </CardTitle>
                </CardHeader>

                <CardContent className="space-y-4">
                    <div className="flex items-center space-x-2">
                        <div className="flex-1">
                            <Input
                                placeholder="Enter transaction ID or search term..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyPress={handleKeyPress}
                                className="w-full"
                            />
                        </div>
                        <Button
                            onClick={handleSearch}
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                    Searching...
                                </>
                            ) : (
                                <>
                                    <Search className="w-4 h-4 mr-2" />
                                    Search
                                </>
                            )}
                        </Button>
                    </div>

                    <p className="text-sm text-muted-foreground">
                        Search by transaction ID (txn_...) or keywords in transaction descriptions
                    </p>
                </CardContent>
            </Card>

            {/* Search Results List */}
            {searchResults.length > 1 && (
                <Card className="shadow-card border-border/50">
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            <span>Search Results</span>
                            <Badge variant="outline">
                                {searchResults.length} result{searchResults.length !== 1 ? 's' : ''}
                            </Badge>
                        </CardTitle>
                    </CardHeader>

                    <CardContent className="space-y-2">
                        {searchResults.map((transaction) => (
                            <div
                                key={transaction.transactionId}
                                className={`p-3 border border-border rounded-lg cursor-pointer transition-colors hover:bg-muted/30 ${
                                    selectedTransaction?.transactionId === transaction.transactionId
                                        ? 'bg-muted/20 border-primary'
                                        : ''
                                }`}
                                onClick={() => setSelectedTransaction(transaction)}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        {getTransactionIcon(transaction.type)}
                                        <div>
                                            <p className="font-medium text-sm">
                                                {transaction.transactionId}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {transaction.description}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold">
                                            {formatCurrency(transaction.amount, transaction.currency)}
                                        </p>
                                        <Badge className={getStatusColor(transaction.status)}>
                                            {transaction.status.toLowerCase()}
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            )}

            {/* Transaction Details */}
            {selectedTransaction && (
                <Card className="shadow-card border-border/50">
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <Receipt className="w-5 h-5" />
                                <span>Transaction Details</span>
                            </div>
                            <Badge className={getStatusColor(selectedTransaction.status)}>
                                {selectedTransaction.status.toLowerCase()}
                            </Badge>
                        </CardTitle>
                    </CardHeader>

                    <CardContent className="space-y-6">
                        {/* Header Information */}
                        <div className="flex items-center justify-between p-4 bg-muted/20 rounded-lg">
                            <div className="flex items-center space-x-3">
                                {getTransactionIcon(selectedTransaction.type)}
                                <div>
                                    <h3 className="font-semibold text-lg">
                                        {selectedTransaction.type} Transaction
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        {selectedTransaction.description}
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-2xl font-bold">
                                    {formatCurrency(selectedTransaction.amount, selectedTransaction.currency)}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    {selectedTransaction.currency}
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
                                            <span className="font-mono text-sm">{selectedTransaction.transactionId}</span>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => copyToClipboard(selectedTransaction.transactionId, 'Transaction ID')}
                                                className="p-1 h-6 w-6"
                                            >
                                                <Copy className="w-3 h-3" />
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <Label className="text-sm text-muted-foreground">Type</Label>
                                        <div className="flex items-center space-x-2">
                                            {getTransactionIcon(selectedTransaction.type)}
                                            <span className="font-medium capitalize">
                                                {selectedTransaction.type.toLowerCase()}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <Label className="text-sm text-muted-foreground">Amount</Label>
                                        <span className="font-semibold">
                                            {formatCurrency(selectedTransaction.amount, selectedTransaction.currency)}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <Label className="text-sm text-muted-foreground">Status</Label>
                                        <Badge className={getStatusColor(selectedTransaction.status)}>
                                            {selectedTransaction.status.toLowerCase()}
                                        </Badge>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <Label className="text-sm text-muted-foreground">Date & Time</Label>
                                        <div className="flex items-center space-x-2">
                                            <Calendar className="w-4 h-4 text-muted-foreground" />
                                            <span className="text-sm">
                                                {formatDateTime(selectedTransaction.createdAt)}
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
                                    {selectedTransaction.fromAccountId && (
                                        <div className="flex items-center justify-between">
                                            <Label className="text-sm text-muted-foreground">From Account</Label>
                                            <div className="flex items-center space-x-2">
                                                <span className="font-mono text-sm">
                                                    {getAccountNumber(selectedTransaction.fromAccountId)}
                                                </span>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => copyToClipboard(selectedTransaction.fromAccountId!, 'From Account ID')}
                                                    className="p-1 h-6 w-6"
                                                >
                                                    <Copy className="w-3 h-3" />
                                                </Button>
                                            </div>
                                        </div>
                                    )}

                                    {selectedTransaction.toAccountId && (
                                        <div className="flex items-center justify-between">
                                            <Label className="text-sm text-muted-foreground">To Account</Label>
                                            <div className="flex items-center space-x-2">
                                                <span className="font-mono text-sm">
                                                    {getAccountNumber(selectedTransaction.toAccountId)}
                                                </span>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => copyToClipboard(selectedTransaction.toAccountId!, 'To Account ID')}
                                                    className="p-1 h-6 w-6"
                                                >
                                                    <Copy className="w-3 h-3" />
                                                </Button>
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex items-center justify-between">
                                        <Label className="text-sm text-muted-foreground">Currency</Label>
                                        <span className="font-medium">{selectedTransaction.currency}</span>
                                    </div>

                                    {selectedTransaction.description && (
                                        <div className="flex items-start justify-between">
                                            <Label className="text-sm text-muted-foreground">Description</Label>
                                            <div className="flex items-start space-x-2 max-w-xs">
                                                <FileText className="w-4 h-4 text-muted-foreground mt-0.5" />
                                                <span className="text-sm text-right">
                                                    {selectedTransaction.description}
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
                                Transaction processed on {formatDateTime(selectedTransaction.createdAt)}
                            </div>
                            <div className="flex items-center space-x-2">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => copyToClipboard(
                                        JSON.stringify(selectedTransaction, null, 2),
                                        'Transaction details'
                                    )}
                                >
                                    <Copy className="w-4 h-4 mr-1" />
                                    Copy Details
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                        // Clear selection to allow searching again
                                        setSelectedTransaction(null);
                                        setSearchResults([]);
                                        setSearchTerm("");
                                    }}
                                >
                                    <Search className="w-4 h-4 mr-1" />
                                    New Search
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Empty State */}
            {!loading && !selectedTransaction && searchTerm && searchResults.length === 0 && (
                <Card className="shadow-card border-border/50">
                    <CardContent className="pt-6">
                        <div className="text-center py-8 text-muted-foreground">
                            <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <p>No transaction found</p>
                            <p className="text-sm">Try searching with a different transaction ID or keywords</p>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default TransactionDetails;