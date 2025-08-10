import CustomerManagement from "./CustomerManagement";
import { Customer } from "../services/customerService";

interface CustomersTabProps {
    currentCustomer: Customer | null;
    onCustomerChange: (customer: Customer | null) => void;
}

const CustomersTab = ({ currentCustomer, onCustomerChange }: CustomersTabProps) => {
    return (
        <div className="space-y-6 mt-8">
            <CustomerManagement
                currentCustomer={currentCustomer}
                onCustomerChange={onCustomerChange}
                showCustomerSelection={true}
            />
        </div>
    );
};

export default CustomersTab;
