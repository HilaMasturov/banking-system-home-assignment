import AccountManagement from "./AccountManagement";
import { Account } from "../services/accountService";

interface ManageTabProps {
    accounts: Account[];
    onAccountUpdated: () => void;
}

const ManageTab = ({ accounts, onAccountUpdated }: ManageTabProps) => {
    return (
        <div className="space-y-6 mt-8">
            <AccountManagement
                accounts={accounts}
                onAccountUpdated={onAccountUpdated}
            />
        </div>
    );
};

export default ManageTab;
