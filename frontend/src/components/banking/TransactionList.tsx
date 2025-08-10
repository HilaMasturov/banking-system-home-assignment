import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Copy,
  Calendar,
  FileText,
  X,
  Search
} from "lucide-react";
import { useState, useMemo } from "react";
import { useToast } from "../../hooks/use-toast";
import { transactionService } from "../services/transactionService";
import { useAccountMasking } from "../../hooks/useAccountMasking";
import { Account } from "../services/accountService";

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
  accounts?: Account[];
  // Pagination props
  currentPage?: number;
  totalPages?: number;
  totalElements?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  showPagination?: boolean;
}

const TransactionList = ({ 
  transactions, 
  onTransactionClick, 
  accounts = [],
  currentPage = 0,
  totalPages = 0,
  totalElements = 0,
  pageSize = 20,
  onPageChange,
  onPageSizeChange,
  showPagination = false
}: TransactionListProps) => {
  const { toast } = useToast();
  const [expandedTransaction, setExpandedTransaction] = useState<string | null>(null);
  const [searchTransactionId, setSearchTransactionId] = useState<string>("");
  const [searching, setSearching] = useState(false);
  const [searchedTransaction, setSearchedTransaction] = useState<Transaction | null>(null);

  // Use the custom hook for account masking
  const { getMaskedAccountNumber } = useAccountMasking(accounts);

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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
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
    return getMaskedAccountNumber(accountId);
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

  const handleSearchTransaction = async () => {
    if (!searchTransactionId.trim()) {
      toast({
        title: "Search Error",
        description: "Please enter a transaction ID to search for.",
        variant: "destructive",
      });
      return;
    }

    setSearching(true);
    try {
      // Use getTransaction to fetch the transaction from the API
      const foundTransaction = await transactionService.getTransaction(searchTransactionId.trim());
      
      if (foundTransaction) {
        // Check if the transaction is already in our list
        const existingTransaction = transactions.find(t => t.transactionId === foundTransaction.transactionId);
        
        if (existingTransaction) {
          // Expand the existing transaction
          setExpandedTransaction(foundTransaction.transactionId);
          setSearchedTransaction(null); // Clear any previous search result
          toast({
            title: "Transaction Found",
            description: "Transaction has been located and expanded.",
          });
        } else {
          // Transaction found but not in current list - display it
          setSearchedTransaction(foundTransaction);
          setExpandedTransaction(null); // Close any expanded transaction
          toast({
            title: "Transaction Found",
            description: `Transaction ${foundTransaction.transactionId} found and displayed below.`,
          });
        }
        
        // Clear the search input
        setSearchTransactionId("");
      }
            } catch (error) {
            toast({
        title: "Transaction Not Found",
        description: "No transaction found with the provided ID.",
        variant: "destructive",
      });
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Transaction Search */}
      <div className="bg-muted/20 rounded-lg p-4">
        <div className="flex items-center space-x-2">
          <div className="flex-1">
            <Input
              placeholder="Search by Transaction ID..."
              value={searchTransactionId}
              onChange={(e) => setSearchTransactionId(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearchTransaction()}
              className="max-w-md"
            />
          </div>
          <Button
            onClick={handleSearchTransaction}
            disabled={searching || !searchTransactionId.trim()}
            size="sm"
          >
            {searching ? (
              <RefreshCw className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Search className="w-4 h-4 mr-2" />
            )}
            Search
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Enter a transaction ID to search the entire system and locate specific transactions
        </p>
      </div>

      {/* Searched Transaction Display */}
      {searchedTransaction && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-muted-foreground">Searched Transaction</h3>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setSearchedTransaction(null)}
              className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
            >
              <X className="w-3 h-3 mr-1" />
              Clear
            </Button>
          </div>
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    {getTransactionIcon(searchedTransaction.type)}
                    <div>
                      <p className="font-medium text-sm">
                        {searchedTransaction.type.charAt(0) + searchedTransaction.type.slice(1).toLowerCase()}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(searchedTransaction.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-semibold text-lg ${
                    searchedTransaction.type === 'WITHDRAWAL' ? 'text-destructive' : 'text-success'
                  }`}>
                    {searchedTransaction.type === 'WITHDRAWAL' ? '-' : '+'}${searchedTransaction.amount.toFixed(2)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {searchedTransaction.currency}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Status</span>
                  <Badge className={getStatusColor(searchedTransaction.status)}>
                    {searchedTransaction.status.toLowerCase()}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Transaction ID</span>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs">{searchedTransaction.transactionId}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        navigator.clipboard.writeText(searchedTransaction.transactionId);
                        toast({
                          title: "Copied!",
                          description: "Transaction ID copied to clipboard",
                        });
                      }}
                      className="h-6 w-6 p-0"
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                </div>

                {searchedTransaction.description && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Description</span>
                    <span className="text-xs max-w-[200px] truncate" title={searchedTransaction.description}>
                      {searchedTransaction.description}
                    </span>
                  </div>
                )}

              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {transactions.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <RefreshCw className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>No transactions found</p>
          {showPagination && totalElements > 0 && (
            <p className="text-sm mt-2">Try adjusting the page size or check other pages</p>
          )}
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
                    {formatCurrency(transaction.amount)}
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
                          {formatCurrency(transaction.amount)}
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
                          <span className="font-mono text-sm bg-muted/30 px-2 py-1 rounded">
                            {getAccountNumber(transaction.fromAccountId)}
                          </span>
                        </div>
                      )}

                      {transaction.toAccountId && (
                        <div className="flex items-center justify-between">
                          <Label className="text-sm text-muted-foreground">To Account</Label>
                          <span className="font-mono text-sm bg-muted/30 px-2 py-1 rounded">
                            {getAccountNumber(transaction.toAccountId)}
                          </span>
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

      {/* Pagination Controls */}
      {showPagination && totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0 pt-6 border-t border-border/50">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <span>
              Showing {Math.min((currentPage * pageSize) + 1, totalElements)} to{' '}
              {Math.min((currentPage + 1) * pageSize, totalElements)} of {totalElements} transactions
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Page Size Selector */}
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange?.(Number(e.target.value))}
              className="px-3 py-1 text-sm border border-border rounded-md bg-background"
            >
              <option value={10}>10 per page</option>
              <option value={20}>20 per page</option>
              <option value={50}>50 per page</option>
              <option value={100}>100 per page</option>
            </select>
            
            {/* Previous Page Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange?.(currentPage - 1)}
              disabled={currentPage === 0}
              className="px-3"
            >
              Previous
            </Button>
            
            {/* Page Numbers */}
            <div className="flex items-center space-x-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i;
                } else if (currentPage < 3) {
                  pageNum = i;
                } else if (currentPage >= totalPages - 3) {
                  pageNum = totalPages - 5 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => onPageChange?.(pageNum)}
                    className="px-3 min-w-[40px]"
                  >
                    {pageNum + 1}
                  </Button>
                );
              })}
            </div>
            
            {/* Next Page Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange?.(currentPage + 1)}
              disabled={currentPage >= totalPages - 1}
              className="px-3"
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionList;