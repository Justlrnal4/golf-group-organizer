import { useState } from "react";
import { format, parseISO } from "date-fns";
import { MapPin, Clock, DollarSign, ThumbsUp, ThumbsDown, Check, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface PlanCardData {
  id: string;
  title: string;
  course_name: string;
  course_address: string;
  time_window_start: string;
  time_window_end: string;
  estimated_cost: string;
  drive_time: string;
  rationale: string[];
  fit_score: number;
}

interface PlanCardProps {
  plan: PlanCardData;
  upVotes: number;
  downVotes: number;
  userVote?: "up" | "down" | null;
  onVote: (planId: string, vote: "up" | "down") => Promise<void>;
  isVoting?: boolean;
}

export function PlanCard({ plan, upVotes, downVotes, userVote, onVote, isVoting }: PlanCardProps) {
  const [localVoting, setLocalVoting] = useState<"up" | "down" | null>(null);

  const handleVote = async (vote: "up" | "down") => {
    if (isVoting || localVoting) return;
    setLocalVoting(vote);
    try {
      await onVote(plan.id, vote);
    } finally {
      setLocalVoting(null);
    }
  };

  const formatTimeWindow = () => {
    try {
      const start = parseISO(plan.time_window_start);
      return format(start, "EEEE, MMM d 'at' h:mm a");
    } catch {
      return "Time TBD";
    }
  };

  return (
    <div className="glass-card p-6 transition-all hover:shadow-elevated group">
      {/* Header with fit score */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h3 className="font-display text-lg font-bold text-card-foreground tracking-tight">
            {plan.course_name}
          </h3>
          <p className="mt-1.5 text-sm text-muted-foreground flex items-center gap-2">
            <Clock className="h-3.5 w-3.5" />
            {formatTimeWindow()}
          </p>
        </div>
        <div className={cn(
          "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition-all",
          plan.fit_score >= 85 
            ? "bg-primary/15 text-primary border border-primary/20" 
            : plan.fit_score >= 70 
              ? "bg-accent text-accent-foreground border border-accent-foreground/10" 
              : "bg-muted text-muted-foreground border border-border"
        )}>
          {plan.fit_score >= 85 && <Sparkles className="h-3 w-3" />}
          {plan.fit_score}% match
        </div>
      </div>

      {/* Details */}
      <div className="mt-5 flex flex-wrap gap-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 rounded-xl px-3 py-2">
          <MapPin className="h-4 w-4 shrink-0 text-primary/70" />
          <span className="truncate max-w-[200px]">{plan.course_address}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 rounded-xl px-3 py-2">
          <DollarSign className="h-4 w-4 shrink-0 text-primary/70" />
          <span>{plan.estimated_cost}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 rounded-xl px-3 py-2">
          <Clock className="h-4 w-4 shrink-0 text-primary/70" />
          <span>{plan.drive_time}</span>
        </div>
      </div>

      {/* Rationale */}
      {plan.rationale && plan.rationale.length > 0 && (
        <div className="mt-5">
          <ul className="space-y-2">
            {plan.rationale.slice(0, 3).map((reason, idx) => (
              <li key={idx} className="flex items-start gap-3 text-sm text-foreground">
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-gradient-to-br from-primary to-primary/60" />
                <span>{reason}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Vote buttons */}
      <div className="mt-6 flex items-center gap-3">
        <Button
          variant={userVote === "up" ? "default" : "outline"}
          size="default"
          className={cn(
            "flex-1 gap-2.5",
            userVote === "up" && "shadow-glow"
          )}
          onClick={() => handleVote("up")}
          disabled={!!localVoting || isVoting}
        >
          {localVoting === "up" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : userVote === "up" ? (
            <Check className="h-4 w-4" />
          ) : (
            <ThumbsUp className="h-4 w-4" />
          )}
          <span className="font-bold">{upVotes}</span>
        </Button>
        <Button
          variant={userVote === "down" ? "destructive" : "outline"}
          size="default"
          className="flex-1 gap-2.5"
          onClick={() => handleVote("down")}
          disabled={!!localVoting || isVoting}
        >
          {localVoting === "down" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : userVote === "down" ? (
            <Check className="h-4 w-4" />
          ) : (
            <ThumbsDown className="h-4 w-4" />
          )}
          <span className="font-bold">{downVotes}</span>
        </Button>
      </div>
    </div>
  );
}