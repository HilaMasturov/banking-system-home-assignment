import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card.tsx";
import { Button } from "../ui/button.tsx";
import { Input } from "../ui/input.tsx";
import { Label } from "../ui/label.tsx";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select.tsx";
import { Badge } from "../ui/badge.tsx";
import { useToast } from "../../hooks/use-toast.ts";
import {
    Settings,
    Edit,
    Search,
    Eye,
    EyeOff,
    CheckCircle,
    XCircle,
    Clock
} from "lucide-react";
import { Account, accountService, UpdateAccountRequest } from "../services/accountService";
import { maskAccountNumber } from "../../lib/accountUtils";

interface AccountManagementProps {
    accounts: Account[];
    onAccountUpdated: () => void;
}

const AccountManagement = ({ accounts, onAccountUpdated }: AccountManagementProps) => {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [editingAccount, setEditingAccount] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [showAccountNumbers, setShowAccountNumbers] = useState<Record<string, boolean>>({});

    const [updateData, setUpdateData] = useState<UpdateAccountRequest>({
        status: undefined,
        currency: undefined
    });

    const filteredAccounts = accounts.filter(account =>
        account.accountNumber.includes(searchTerm) ||
        account.accountType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        account.status.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleEdit = (accountId: string, account: Account) => {
        setEditingAccount(accountId);
        setUpdateData({
            status: account.status,
            currency: account.currency
        });
    };

    const handleCancelEdit = () => {
        setEditingAccount(null);
        setUpdateData({ 
            status: undefined,
            currency: undefined
        });
    };

    const handleUpdateAccount = async (accountId: string) => {
        if (!updateData.status && !updateData.currency) {
            toast({
                title: "Validation Error",
                description: "Please make at least one change",
                variant: "destructive",
            });
            return;
        }

        setLoading(true);

        try {
            await accountService.updateAccount(accountId, updateData);

            toast({
                title: "Account Updated",
                description: "Account status has been updated successfully.",
            });

            setEditingAccount(null);
            setUpdateData({ 
                status: undefined,
                currency: undefined
            });
            onAccountUpdated();

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to update account';
            toast({
                title: "Update Failed",
                description: errorMessage,
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const toggleAccountNumberVisibility = (accountId: string) => {
        setShowAccountNumbers(prev => ({
            ...prev,
            [accountId]: !prev[accountId]
        }));
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "ACTIVE":
                return <CheckCircle className="w-4 h-4 text-green-500" />;
            case "INACTIVE":
                return <Clock className="w-4 h-4 text-yellow-500" />;
            case "BLOCKED":
                return <XCircle className="w-4 h-4 text-red-500" />;
            default:
                return <Clock className="w-4 h-4 text-gray-500" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "ACTIVE":
                return "bg-green-100 text-green-800 border-green-200";
            case "INACTIVE":
                return "bg-yellow-100 text-yellow-800 border-yellow-200";
            case "BLOCKED":
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

    const formatAccountNumber = (accountNumber: string, show: boolean) => {
        if (show) {
            return accountNumber;
        }
        return maskAccountNumber(accountNumber);
    };

    return (
        <Card className="shadow-card border-border/50">
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <Settings className="w-5 h-5" />
                        <span>Account Management</span>
                    </div>
                    <Badge variant="outline">
                        {filteredAccounts.length} account{filteredAccounts.length !== 1 ? 's' : ''}
                    </Badge>
                </CardTitle>

                {/* Search Bar */}
                <div className="flex items-center space-x-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <Input
                            placeholder="Search by account number, type, or status..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </div>
            </CardHeader>

            <CardContent className="space-y-4">
                {filteredAccounts.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                        <Settings className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p>No accounts found</p>
                    </div>
                ) : (
                    filteredAccounts.map((account) => (
                        <div
                            key={account.accountId}
                            className="p-4 border border-border rounded-lg hover:bg-muted/30 transition-colors"
                        >
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center space-x-3">
                                    <div className="flex items-center space-x-2">
                                        {getStatusIcon(account.status)}
                                        <h3 className="font-semibold">
                                            {account.accountType} Account
                                        </h3>
                                    </div>
                                    <Badge className={getStatusColor(account.status)}>
                                        {account.status.toLowerCase()}
                                    </Badge>
                                </div>

                                <div className="flex items-center space-x-2">
                                    {editingAccount === account.accountId ? (
                                        <>
                                            <Button
                                                size="sm"
                                                onClick={() => handleUpdateAccount(account.accountId)}
                                                disabled={loading}
                                            >
                                                {loading ? "Saving..." : "Save"}
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={handleCancelEdit}
                                                disabled={loading}
                                            >
                                                Cancel
                                            </Button>
                                        </>
                                    ) : (
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleEdit(account.accountId, account)}
                                        >
                                            <Edit className="w-4 h-4 mr-1" />
                                            Edit
                                        </Button>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                {/* Account Number */}
                                <div>
                                    <Label className="text-sm text-muted-foreground">Account Number</Label>
                                    <div className="flex items-center space-x-2">
                                        <span className="font-mono text-sm">
                                            {formatAccountNumber(account.accountNumber, showAccountNumbers[account.accountId])}
                                        </span>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => toggleAccountNumberVisibility(account.accountId)}
                                            className="p-1 h-6 w-6"
                                        >
                                            {showAccountNumbers[account.accountId] ? (
                                                <EyeOff className="w-3 h-3" />
                                            ) : (
                                                <Eye className="w-3 h-3" />
                                            )}
                                        </Button>
                                    </div>
                                </div>

                                {/* Balance */}
                                <div>
                                    <Label className="text-sm text-muted-foreground">Current Balance</Label>
                                    <p className="font-semibold text-lg">
                                        {formatCurrency(account.balance, account.currency)}
                                    </p>
                                </div>

                                {/* Account Type */}
                                <div>
                                    <Label className="text-sm text-muted-foreground">Account Type</Label>
                                    <p className="font-medium capitalize">{account.accountType.toLowerCase()}</p>
                                </div>

                                {/* Currency */}
                                <div>
                                    <Label className="text-sm text-muted-foreground">Currency</Label>
                                    {editingAccount === account.accountId ? (
                                        <Select
                                            value={updateData.currency || ""}
                                            onValueChange={(value) =>
                                                setUpdateData({...updateData, currency: value})}
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select currency" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="USD">USD</SelectItem>
                                                <SelectItem value="EUR">EUR</SelectItem>
                                                <SelectItem value="GBP">GBP</SelectItem>
                                                <SelectItem value="JPY">JPY</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    ) : (
                                        <p className="font-medium">{account.currency}</p>
                                    )}
                                </div>
                            </div>

                            {/* Status Row */}
                            <div className="mt-4">
                                <Label className="text-sm text-muted-foreground">Account Status</Label>
                                {editingAccount === account.accountId ? (
                                    <Select
                                        value={updateData.status || ""}
                                        onValueChange={(value: "ACTIVE" | "INACTIVE" | "BLOCKED") =>
                                            setUpdateData({...updateData, status: value})}
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="ACTIVE">
                                                <div className="flex items-center space-x-2">
                                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                                    <span>Active</span>
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="INACTIVE">
                                                <div className="flex items-center space-x-2">
                                                    <Clock className="w-4 h-4 text-yellow-500" />
                                                    <span>Inactive</span>
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="BLOCKED">
                                                <div className="flex items-center space-x-2">
                                                    <XCircle className="w-4 h-4 text-red-500" />
                                                    <span>Blocked</span>
                                                </div>
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                ) : (
                                    <div className="flex items-center space-x-2 mt-1">
                                        {getStatusIcon(account.status)}
                                        <span className="font-medium capitalize">
                                            {account.status.toLowerCase()}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Dates */}
                            <div className="mt-3 pt-3 border-t border-border">
                                <div className="flex justify-between text-xs text-muted-foreground">
                                    <span>Created: {new Date(account.createdAt).toLocaleDateString()}</span>
                                    <span>Updated: {new Date(account.updatedAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </CardContent>
        </Card>
    );
};

export default AccountManagement;