import Header from "./Header";
import LoadingState from "./LoadingState";
import CustomerSelectionState from "./CustomerSelectionState";
import ErrorState from "./ErrorState";
import MainTabs from "./MainTabs";
import { useBankingSystemState } from "../../hooks/BankingSystemState.ts";

const BankingSystem = () => {
    const {
        // State
        accounts,
        transactions,
        loading,
        error,
        transactionsLoading,
        activeTab,
        currentCustomer,
        selectedAccountId,
        selectedAccount,
        viewMode,
        transactionPage,
        transactionPageSize,
        totalTransactions,
        totalTransactionPages,
        
        // Computed values
        balancesByCurrency,
        
        // Actions
        setActiveTab,
        setCurrentCustomer,
        handleTransactionSubmit,
        handleAccountCreated,
        handleAccountUpdated,
        handleRefresh,
        handlePageSizeChange,
        handleAccountSelectionChange,
        setTransactionPage,
        
        // Utilities
        formatCurrencyBalance
    } = useBankingSystemState();

    if (loading) {
        return <LoadingState />;
    }

    // If no customer is selected, show customer selection
    if (!currentCustomer) {
        return (
            <CustomerSelectionState
                currentCustomer={currentCustomer}
                onCustomerChange={setCurrentCustomer}
            />
        );
    }

    if (error) {
        return (
            <ErrorState
                error={error}
                onRetry={handleRefresh}
            />
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <Header />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <MainTabs
                    activeTab={activeTab}
                    accounts={accounts}
                    transactions={transactions}
                    viewMode={viewMode}
                    selectedAccountId={selectedAccountId}
                    selectedAccount={selectedAccount}
                    transactionsLoading={transactionsLoading}
                    transactionPage={transactionPage}
                    totalTransactionPages={totalTransactionPages}
                    totalTransactions={totalTransactions}
                    transactionPageSize={transactionPageSize}
                    balancesByCurrency={balancesByCurrency}
                    formatCurrencyBalance={formatCurrencyBalance}
                    currentCustomer={currentCustomer}
                    onTabChange={setActiveTab}
                    onAccountSelectionChange={handleAccountSelectionChange}
                    onTransactionSubmit={handleTransactionSubmit}
                    onTransactionClick={() => {}} // This is handled inline in TransactionList
                    onPageChange={setTransactionPage}
                    onPageSizeChange={handlePageSizeChange}
                    onCustomerChange={setCurrentCustomer}
                    onAccountCreated={handleAccountCreated}
                    onAccountUpdated={handleAccountUpdated}
                />
            </main>
        </div>
    );
};

export default BankingSystem;