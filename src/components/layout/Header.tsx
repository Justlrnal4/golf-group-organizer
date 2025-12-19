import { Link } from "react-router-dom";
import { Flag, ChevronLeft } from "lucide-react";

interface HeaderProps {
  showBack?: boolean;
  backTo?: string;
  title?: string;
}

export function Header({ showBack, backTo = "/", title }: HeaderProps) {
  return (
    <header className="mb-8 flex items-center justify-between">
      {showBack ? (
        <Link
          to={backTo}
          className="group flex items-center gap-1.5 text-sm font-semibold text-muted-foreground transition-all duration-200 hover:text-foreground btn-press"
        >
          <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
          Back
        </Link>
      ) : (
        <Link to="/" className="group flex items-center gap-3 btn-press">
          <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl gradient-hero shadow-elevated glow-pulse">
            <Flag className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-display text-xl font-bold text-foreground tracking-tight">
            CrewSync Golf
          </span>
        </Link>
      )}
      {title && (
        <h1 className="font-display text-lg font-bold text-foreground tracking-tight">
          {title}
        </h1>
      )}
      <div className="w-16" />
    </header>
  );
}