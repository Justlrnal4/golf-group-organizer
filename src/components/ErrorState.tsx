import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center text-center animate-fade-in">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 mb-4">
        <AlertCircle className="h-7 w-7 text-destructive" />
      </div>
      <h3 className="font-display text-lg font-semibold text-foreground">
        Something went wrong
      </h3>
      <p className="mt-2 text-sm text-muted-foreground max-w-xs">
        {message}
      </p>
      {onRetry && (
        <Button 
          variant="outline" 
          className="mt-6 btn-press"
          onClick={onRetry}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      )}
    </div>
  );
}
