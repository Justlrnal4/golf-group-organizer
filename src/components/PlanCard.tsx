import { useState } from "react";
import { format, parseISO } from "date-fns";
import { MapPin, Clock, DollarSign, ThumbsUp, ThumbsDown, Check, Loader2 } from "lucide-react";
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
    <div className="rounded-2xl border border-border bg-card p-5 shadow-soft transition-all hover:shadow-md">
      {/* Header with fit score */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-display text-lg font-bold text-card-foreground">
            {plan.course_name}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {formatTimeWindow()}
          </p>
        </div>
        <div className={cn(
          "flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold",
          plan.fit_score >= 85 
            ? "bg-primary/15 text-primary" 
            : plan.fit_score >= 70 
              ? "bg-accent text-accent-foreground" 
              : "bg-muted text-muted-foreground"
        )}>
          {plan.fit_score}% match
        </div>
      </div>

      {/* Details */}
      <div className="mt-4 space-y-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4 shrink-0" />
          <span className="truncate">{plan.course_address}</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <DollarSign className="h-4 w-4 shrink-0" />
            <span>{plan.estimated_cost}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4 shrink-0" />
            <span>{plan.drive_time}</span>
          </div>
        </div>
      </div>

      {/* Rationale */}
      {plan.rationale && plan.rationale.length > 0 && (
        <div className="mt-4">
          <ul className="space-y-1.5">
            {plan.rationale.slice(0, 3).map((reason, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-foreground">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                <span>{reason}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Vote buttons */}
      <div className="mt-5 flex items-center gap-3">
        <Button
          variant={userVote === "up" ? "default" : "outline"}
          size="sm"
          className="flex-1 gap-2"
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
          <span>{upVotes}</span>
        </Button>
        <Button
          variant={userVote === "down" ? "destructive" : "outline"}
          size="sm"
          className="flex-1 gap-2"
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
          <span>{downVotes}</span>
        </Button>
      </div>
    </div>
  );
}