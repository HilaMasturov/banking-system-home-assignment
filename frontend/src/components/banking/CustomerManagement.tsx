import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    UserPlus,
    Users,
    User,
    Mail,
    Phone,
    Calendar,
    AlertCircle,
    CheckCircle,
    Loader2,
    ArrowRight,
    LogOut
} from "lucide-react";
import { Customer, CustomerCreateRequest, customerService } from "../services/customerService";

interface CustomerManagementProps {
    onCustomerChange: (customer: Customer | null) => void;
    currentCustomer: Customer | null;
    showCustomerSelection?: boolean;
}

const CustomerManagement = ({ onCustomerChange, currentCustomer, showCustomerSelection = false }: CustomerManagementProps) => {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(false);
    const [creating, setCreating] = useState(false);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const { toast } = useToast();

    // Form state for creating new customer
    const [newCustomer, setNewCustomer] = useState<CustomerCreateRequest>({
        firstName: "",
        lastName: "",
        email: "",
        phoneNumber: ""
    });

    useEffect(() => {
        loadCustomers();
    }, []);

    const loadCustomers = async () => {
        try {
            setLoading(true);
            const customersData = await customerService.getAllCustomers();
            setCustomers(customersData);
        } catch (error) {
            console.error("Error loading customers:", error);
            toast({
                title: "Error",
                description: "Failed to load customers",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleCreateCustomer = async () => {
        try {
            setCreating(true);
            
            // Validate form
            if (!newCustomer.firstName || !newCustomer.lastName || !newCustomer.email || !newCustomer.phoneNumber) {
                toast({
                    title: "Validation Error",
                    description: "Please fill in all fields",
                    variant: "destructive",
                });
                return;
            }

            // Check if email already exists
            const emailExists = await customerService.customerExistsByEmail(newCustomer.email);
            if (emailExists) {
                toast({
                    title: "Error",
                    description: "A customer with this email already exists",
                    variant: "destructive",
                });
                return;
            }

            // Create customer
            const createdCustomer = await customerService.createCustomer(newCustomer);
            
            // Add to local state
            setCustomers(prev => [...prev, createdCustomer]);
            
            // Reset form
            setNewCustomer({
                firstName: "",
                lastName: "",
                email: "",
                phoneNumber: ""
            });
            
            setIsCreateDialogOpen(false);
            
            toast({
                title: "Success",
                description: "Customer created successfully",
            });
        } catch (error) {
            console.error("Error creating customer:", error);
            toast({
                title: "Error",
                description: "Failed to create customer",
                variant: "destructive",
            });
        } finally {
            setCreating(false);
        }
    };

    const handleCustomerSelect = (customer: Customer) => {
        onCustomerChange(customer);
    };

    const handleSignOut = () => {
        onCustomerChange(null);
    };

    // If we should show customer selection (no customer selected or explicitly requested)
    if (!currentCustomer || showCustomerSelection) {
        return (
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold">Select Customer</h2>
                        <p className="text-muted-foreground">Choose a customer to view their banking information</p>
                    </div>
                    <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <UserPlus className="h-4 w-4 mr-2" />
                                New Customer
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[500px] bg-white border-2 border-primary/20 shadow-2xl">
                            <DialogHeader className="text-center">
                                <div className="mx-auto mb-4 w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center">
                                    <UserPlus className="w-6 h-6 text-primary-foreground" />
                                </div>
                                <DialogTitle className="text-xl font-bold">Create New Customer</DialogTitle>
                                <DialogDescription className="text-muted-foreground">
                                    Enter the customer's information to create a new banking account.
                                </DialogDescription>
                            </DialogHeader>
                            
                            <div className="space-y-6 py-6">
                                {/* Name Fields */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-3">
                                        <Label htmlFor="firstName" className="text-sm font-medium">
                                            First Name
                                        </Label>
                                        <Input
                                            id="firstName"
                                            value={newCustomer.firstName}
                                            onChange={(e) => setNewCustomer(prev => ({
                                                ...prev,
                                                firstName: e.target.value
                                            }))}
                                            placeholder="John"
                                            className="h-11 border-border/50 focus:border-primary/50 focus:ring-primary/20"
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <Label htmlFor="lastName" className="text-sm font-medium">
                                            Last Name
                                        </Label>
                                        <Input
                                            id="lastName"
                                            value={newCustomer.lastName}
                                            onChange={(e) => setNewCustomer(prev => ({
                                                ...prev,
                                                lastName: e.target.value
                                            }))}
                                            placeholder="Doe"
                                            className="h-11 border-border/50 focus:border-primary/50 focus:ring-primary/20"
                                        />
                                    </div>
                                </div>

                                {/* Contact Information */}
                                <div className="space-y-4">
                                    <div className="space-y-3">
                                        <Label htmlFor="email" className="text-sm font-medium flex items-center gap-2">
                                            <Mail className="w-4 h-4 text-muted-foreground" />
                                            Email Address
                                        </Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={newCustomer.email}
                                            onChange={(e) => setNewCustomer(prev => ({
                                                ...prev,
                                                email: e.target.value
                                            }))}
                                            placeholder="john.doe@example.com"
                                            className="h-11 border-border/50 focus:border-primary/50 focus:ring-primary/20"
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <Label htmlFor="phoneNumber" className="text-sm font-medium flex items-center gap-2">
                                            <Phone className="w-4 h-4 text-muted-foreground" />
                                            Phone Number
                                        </Label>
                                        <Input
                                            id="phoneNumber"
                                            value={newCustomer.phoneNumber}
                                            onChange={(e) => setNewCustomer(prev => ({
                                                ...prev,
                                                phoneNumber: e.target.value
                                            }))}
                                            placeholder="+1234567890"
                                            className="h-11 border-border/50 focus:border-primary/50 focus:ring-primary/20"
                                        />
                                    </div>
                                </div>

                                {/* Info Card */}
                                <div className="bg-muted/30 rounded-lg p-4 border border-border/50">
                                    <div className="flex items-start space-x-3">
                                        <AlertCircle className="w-5 h-5 text-muted-foreground mt-0.5" />
                                        <div className="text-sm text-muted-foreground">
                                            <p className="font-medium mb-1">What happens next?</p>
                                            <p>After creating a customer, you can create banking accounts and manage their financial services.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <DialogFooter className="gap-3">
                                <Button
                                    variant="outline"
                                    onClick={() => setIsCreateDialogOpen(false)}
                                    disabled={creating}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleCreateCustomer}
                                    disabled={creating}
                                    className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                                >
                                    {creating ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Creating Customer...
                                        </>
                                    ) : (
                                        <>
                                            <UserPlus className="mr-2 h-4 w-4" />
                                            Create Customer
                                        </>
                                    )}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Customer Cards Grid */}
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin mr-2" />
                        <span>Loading customers...</span>
                    </div>
                ) : customers.length === 0 ? (
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-center py-8">
                                <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                                <h3 className="text-lg font-semibold mb-2">No Customers Found</h3>
                                <p className="text-muted-foreground mb-4">
                                    Create your first customer to get started with the banking system.
                                </p>
                                <Button onClick={() => setIsCreateDialogOpen(true)}>
                                    <UserPlus className="h-4 w-4 mr-2" />
                                    Create First Customer
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {customers.map((customer) => (
                            <Card 
                                key={customer.customerId} 
                                className={`cursor-pointer transition-all duration-200 hover:scale-105 ${
                                    currentCustomer?.customerId === customer.customerId
                                        ? 'ring-4 ring-primary shadow-xl bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-primary/20'
                                        : 'hover:shadow-lg hover:ring-2 hover:ring-primary/20'
                                }`}
                                onClick={() => handleCustomerSelect(customer)}
                            >
                                <CardContent className="pt-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center space-x-3">
                                            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                                                currentCustomer?.customerId === customer.customerId
                                                    ? 'bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-lg'
                                                    : 'bg-primary/10 text-primary'
                                            }`}>
                                                <User className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold">
                                                    {customer.firstName} {customer.lastName}
                                                </h3>
                                                <p className="text-sm text-muted-foreground">
                                                    {customer.email}
                                                </p>
                                            </div>
                                        </div>
                                        {currentCustomer?.customerId === customer.customerId ? (
                                            <CheckCircle className="w-5 h-5 text-primary" />
                                        ) : (
                                            <ArrowRight className="w-4 h-4 text-muted-foreground" />
                                        )}
                                    </div>
                                    
                                    <div className="space-y-2 text-sm">
                                        <div className="flex items-center space-x-2">
                                            <Phone className="w-4 h-4 text-muted-foreground" />
                                            <span>{customer.phoneNumber}</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Calendar className="w-4 h-4 text-muted-foreground" />
                                            <span>
                                                Member since {new Date(customer.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    {currentCustomer?.customerId === customer.customerId && (
                                        <div className="mt-4 pt-4 border-t border-primary/20">
                                            <Badge className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground font-semibold text-xs px-3 py-1">
                                                ✓ Currently Selected
                                            </Badge>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    // Show current customer information when a customer is selected and not in customer selection mode
    if (currentCustomer && !showCustomerSelection) {
        return (
            <div className="space-y-6">
                {/* Current Customer Display */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="h-5 w-5" />
                            Current Customer
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="h-4 w-4 text-green-500" />
                                        <span className="font-medium">
                                            {currentCustomer.firstName} {currentCustomer.lastName}
                                        </span>
                                    </div>
                                    <Badge variant="secondary">
                                        {currentCustomer.customerId.slice(0, 8)}...
                                    </Badge>
                                </div>
                                <Button variant="outline" size="sm" onClick={handleSignOut}>
                                    <LogOut className="h-4 w-4 mr-2" />
                                    Sign Out
                                </Button>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div className="flex items-center gap-2">
                                    <Mail className="h-4 w-4 text-muted-foreground" />
                                    <span>{currentCustomer.email}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Phone className="h-4 w-4 text-muted-foreground" />
                                    <span>{currentCustomer.phoneNumber}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    <span>
                                        Member since {new Date(currentCustomer.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Switch Customer Button */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5" />
                            Switch Customer
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground mb-4">
                            Want to view a different customer's information?
                        </p>
                        <Button 
                            variant="outline" 
                            onClick={() => onCustomerChange(null)}
                            className="w-full"
                        >
                            <Users className="h-4 w-4 mr-2" />
                            Select Different Customer
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }
};

export default CustomerManagement;
