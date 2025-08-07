import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  RefreshCw
} from "lucide-react";

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
}

const TransactionList = ({ transactions }: TransactionListProps) => {
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
            className="flex items-center justify-between p-4 bg-muted/20 rounded-lg hover:bg-muted/30 transition-colors duration-200"
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
          </div>
        ))
      )}
    </div>
  );
};

export default TransactionList;