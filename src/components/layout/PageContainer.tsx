import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageContainerProps {
  children: ReactNode;
  className?: string;
}

export function PageContainer({ children, className }: PageContainerProps) {
  return (
    <div className={cn("min-h-screen bg-background", className)}>
      <div className="mx-auto max-w-lg px-4 py-6 sm:px-6">
        {children}
      </div>
    </div>
  );
}
