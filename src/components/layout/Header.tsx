import { Link } from "react-router-dom";
import { Flag } from "lucide-react";

interface HeaderProps {
  showBack?: boolean;
  backTo?: string;
  title?: string;
}

export function Header({ showBack, backTo = "/", title }: HeaderProps) {
  return (
    <header className="mb-6 flex items-center justify-between">
      {showBack ? (
        <Link
          to={backTo}
          className="flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back
        </Link>
      ) : (
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl gradient-hero shadow-soft">
            <Flag className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-display text-lg font-semibold text-foreground">
            CrewSync
          </span>
        </Link>
      )}
      {title && (
        <h1 className="font-display text-lg font-semibold text-foreground">
          {title}
        </h1>
      )}
      <div className="w-16" /> {/* Spacer for centering */}
    </header>
  );
}
