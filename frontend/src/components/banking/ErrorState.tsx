import { AlertCircle, RefreshCw } from "lucide-react";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import Header from "./Header";

interface ErrorStateProps {
    error: string;
    onRetry: () => void;
}

const ErrorState = ({ error, onRetry }: ErrorStateProps) => {
    return (
        <div className="min-h-screen bg-background">
            <Header />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <Card className="max-w-md mx-auto">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-center mb-4">
                            <AlertCircle className="w-12 h-12 text-destructive" />
                        </div>
                        <h2 className="text-xl font-semibold text-center mb-2">Connection Error</h2>
                        <p className="text-muted-foreground text-center mb-4">{error}</p>
                        <Button onClick={onRetry} className="w-full">
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Try Again
                        </Button>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
};

export default ErrorState;
