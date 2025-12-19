import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageContainerProps {
  children: ReactNode;
  className?: string;
}

export function PageContainer({ children, className }: PageContainerProps) {
  return (
    <div className={cn("min-h-screen", className)}>
      <div className="mx-auto max-w-lg px-4 py-8 sm:px-6 lg:py-12">
        {children}
      </div>
    </div>
  );
}