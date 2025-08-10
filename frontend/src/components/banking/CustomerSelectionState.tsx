import Header from "./Header";
import CustomerManagement from "./CustomerManagement";
import { Customer } from "../services/customerService";

interface CustomerSelectionStateProps {
    currentCustomer: Customer | null;
    onCustomerChange: (customer: Customer | null) => void;
}

const CustomerSelectionState = ({ currentCustomer, onCustomerChange }: CustomerSelectionStateProps) => {
    return (
        <div className="min-h-screen bg-background">
            <Header />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-foreground">Banking Portal</h1>
                </div>
                <CustomerManagement
                    currentCustomer={currentCustomer}
                    onCustomerChange={onCustomerChange}
                />
            </main>
        </div>
    );
};

export default CustomerSelectionState;
