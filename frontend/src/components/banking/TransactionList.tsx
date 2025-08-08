import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Copy,
  Calendar,
  FileText,
  X
} from "lucide-react";
import { useState } from "react";
import { useToast } from "../../hooks/use-toast";

interface Transaction {
  transactionId: string;
  fromAccountId?: string;
  toAccountId?: string;
  amount: number;
  currency: string;
  type: "DEPOSIT" | "WITHDRAWAL" | "TRANSFER";
  status: "PENDING" | "COMPLETED" | "FAILED";
  description: string;
  createdAt: string;
}

interface TransactionListProps {
  transactions: Transaction[];
  onTransactionClick?: (transaction: Transaction) => void;
  accounts?: { accountId: string; accountNumber: string }[];
}

const TransactionList = ({ transactions, onTransactionClick, accounts = [] }: TransactionListProps) => {
  const { toast } = useToast();
  const [expandedTransaction, setExpandedTransaction] = useState<string | null>(null);
  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "DEPOSIT":
        return <ArrowDownLeft className="w-4 h-4 text-success" />;
      case "WITHDRAWAL":
        return <ArrowUpRight className="w-4 h-4 text-destructive" />;
      case "TRANSFER":
        return <RefreshCw className="w-4 h-4 text-accent" />;
      default:
        return <RefreshCw className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "bg-success text-success-foreground";
      case "PENDING":
        return "bg-warning text-warning-foreground";
      case "FAILED":
        return "bg-destructive text-destructive-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "Copied",
        description: `${label} copied to clipboard`,
      });
    });
  };

  const handleTransactionClick = (transaction: Transaction) => {
    if (expandedTransaction === transaction.transactionId) {
      setExpandedTransaction(null);
    } else {
      setExpandedTransaction(transaction.transactionId);
      onTransactionClick?.(transaction);
    }
  };

  return (
    <div className="space-y-4">
      {transactions.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <RefreshCw className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>No transactions found</p>
        </div>
      ) : (
        transactions.map((transaction) => (
          <div
            key={transaction.transactionId}
            className={`bg-muted/20 rounded-lg transition-all duration-200 ${
              expandedTransaction === transaction.transactionId 
                ? 'ring-2 ring-primary/20 shadow-lg' 
                : 'hover:bg-muted/30'
            }`}
          >
            {/* Main Transaction Row */}
            <div
              className={`flex items-center justify-between p-4 cursor-pointer ${
                expandedTransaction === transaction.transactionId 
                  ? 'bg-primary/5' 
                  : ''
              }`}
              onClick={() => handleTransactionClick(transaction)}
            >
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  {getTransactionIcon(transaction.type)}
                </div>
                
                <div>
                  <p className="font-medium text-foreground">
                    {transaction.description}
                  </p>
                  <div className="flex items-center space-x-2 mt-1">
                    <p className="text-sm text-muted-foreground">
                      {formatDate(transaction.createdAt)}
                    </p>
                    <Badge className={getStatusColor(transaction.status)}>
                      {transaction.status.toLowerCase()}
                    </Badge>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className="text-right">
                  <p className={`font-semibold ${
                    transaction.type === "DEPOSIT" 
                      ? "text-success" 
                      : transaction.type === "WITHDRAWAL"
                      ? "text-destructive"
                      : "text-foreground"
                  }`}>
                    {transaction.type === "DEPOSIT" ? "+" : "-"}
                    {formatCurrency(transaction.amount, transaction.currency)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {transaction.type.toLowerCase()}
                  </p>
                </div>
                <div className="flex items-center">
                  {expandedTransaction === transaction.transactionId ? (
                    <ChevronUp className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>
              </div>
            </div>

            {/* Expanded Details */}
            {expandedTransaction === transaction.transactionId && (
              <div className="border-t border-border/50 bg-background/50">
                <div className="p-4 space-y-4">
                  {/* Transaction Information Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Basic Information */}
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

                    {/* Account Information */}
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

                  {/* Close Button */}
                  <div className="flex justify-end pt-2 border-t border-border/50">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setExpandedTransaction(null)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <X className="w-4 h-4 mr-1" />
                      Close Details
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default TransactionList;