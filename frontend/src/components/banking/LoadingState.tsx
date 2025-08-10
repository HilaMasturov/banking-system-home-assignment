import { RefreshCw } from "lucide-react";
import Header from "./Header";

const LoadingState = () => {
    return (
        <div className="min-h-screen bg-background">
            <Header />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="flex items-center justify-center py-12">
                    <RefreshCw className="w-8 h-8 animate-spin mr-2" />
                    <span>Loading your banking information...</span>
                </div>
            </main>
        </div>
    );
};

export default LoadingState;
