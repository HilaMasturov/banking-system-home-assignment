import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card.tsx";
import { Button } from "../ui/button.tsx";
import { Input } from "../ui/input.tsx";
import { Label } from "../ui/label.tsx";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select.tsx";
import { useToast } from "../../hooks/use-toast.ts";
import {
    UserPlus,
    CreditCard,
    AlertCircle
} from "lucide-react";
import { accountService, CreateAccountRequest } from "../services/accountService";

interface CreateAccountFormProps {
    onAccountCreated: () => void;
    customerId: string;
}

const CreateAccountForm = ({ onAccountCreated, customerId }: CreateAccountFormProps) => {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        customerId: customerId,
        accountType: "" as "CHECKING" | "SAVINGS" | "",
        currency: "USD",
        initialDeposit: ""
    });

    const validateForm = (): string | null => {
        if (!formData.accountType) {
            return "Please select an account type";
        }
        if (!formData.currency) {
            return "Please select a currency";
        }
        if (formData.initialDeposit && parseFloat(formData.initialDeposit) < 0) {
            return "Initial deposit cannot be negative";
        }
        return null;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const validationError = validateForm();
        if (validationError) {
            toast({
                title: "Validation Error",
                description: validationError,
                variant: "destructive",
            });
            return;
        }

        setLoading(true);

        try {
            const createRequest: CreateAccountRequest = {
                customerId: formData.customerId,
                accountType: formData.accountType as "CHECKING" | "SAVINGS",
                currency: formData.currency,
                initialDeposit: formData.initialDeposit ? parseFloat(formData.initialDeposit) : 0
            };

            console.log('🏦 Creating new account:', createRequest);
            const newAccount = await accountService.createAccount(createRequest);
            console.log('✅ Account created successfully:', newAccount);

            toast({
                title: "Account Created",
                description: `Your ${formData.accountType.toLowerCase()} account has been created successfully.`,
            });

            // Reset form
            setFormData({
                customerId: customerId,
                accountType: "",
                currency: "USD",
                initialDeposit: ""
            });

            // Notify parent component
            onAccountCreated();

        } catch (error) {
            console.error('❌ Failed to create account:', error);
            const errorMessage = error instanceof Error ? error.message : 'Failed to create account';
            toast({
                title: "Account Creation Failed",
                description: errorMessage,
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="shadow-card border-border/50">
            <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                    <UserPlus className="w-5 h-5" />
                    <span>Create New Account</span>
                </CardTitle>
            </CardHeader>

            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="account-type">Account Type</Label>
                        <Select
                            value={formData.accountType}
                            onValueChange={(value: "CHECKING" | "SAVINGS") =>
                                setFormData({...formData, accountType: value})}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select account type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="CHECKING">
                                    <div className="flex items-center space-x-2">
                                        <CreditCard className="w-4 h-4" />
                                        <span>Checking Account</span>
                                    </div>
                                </SelectItem>
                                <SelectItem value="SAVINGS">
                                    <div className="flex items-center space-x-2">
                                        <CreditCard className="w-4 h-4" />
                                        <span>Savings Account</span>
                                    </div>
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="currency">Currency</Label>
                        <Select
                            value={formData.currency}
                            onValueChange={(value) => setFormData({...formData, currency: value})}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select currency" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="USD">USD - US Dollar</SelectItem>
                                <SelectItem value="EUR">EUR - Euro</SelectItem>
                                <SelectItem value="GBP">GBP - British Pound</SelectItem>
                                <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="initial-deposit">Initial Deposit (Optional)</Label>
                        <Input
                            id="initial-deposit"
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="0.00"
                            value={formData.initialDeposit}
                            onChange={(e) => setFormData({...formData, initialDeposit: e.target.value})}
                        />
                        <p className="text-sm text-muted-foreground">
                            Leave empty for $0.00 initial balance
                        </p>
                    </div>

                    <Button
                        type="submit"
                        className="w-full bg-gradient-primary hover:bg-primary-hover"
                        disabled={loading}
                    >
                        {loading ? "Creating Account..." : "Create Account"}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
};

export default CreateAccountForm;