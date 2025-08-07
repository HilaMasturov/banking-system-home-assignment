import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  CreditCard, 
  PiggyBank
} from "lucide-react";

interface AccountCardProps {
  accountNumber: string;
  accountType: "SAVINGS" | "CHECKING";
  balance: number;
  currency: string;
  status: "ACTIVE" | "INACTIVE" | "BLOCKED";
}

const AccountCard = ({ 
  accountNumber, 
  accountType, 
  balance, 
  currency, 
  status 
}: AccountCardProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-success text-success-foreground";
      case "INACTIVE":
        return "bg-warning text-warning-foreground";
      case "BLOCKED":
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

  const AccountIcon = accountType === "SAVINGS" ? PiggyBank : CreditCard;

  return (
    <Card className="shadow-card hover:shadow-elevated transition-all duration-300 border-border/50 bg-gradient-card">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center space-x-2">
          <AccountIcon className="w-4 h-4" />
          <span>{accountType.toLowerCase().replace('_', ' ')} Account</span>
        </CardTitle>
        <Badge className={getStatusColor(status)}>
          {status.toLowerCase()}
        </Badge>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {/* Balance */}
          <div>
            <div className="text-3xl font-bold text-foreground">
              {formatCurrency(balance, currency)}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Available Balance
            </p>
          </div>

          {/* Account Number */}
          <div className="bg-muted/30 rounded-lg p-3">
            <div>
              <p className="text-xs text-muted-foreground">Account Number</p>
              <p className="text-sm font-mono font-medium">
                •••• •••• •••• {accountNumber.slice(-4)}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AccountCard;