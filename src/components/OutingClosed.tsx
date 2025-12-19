import { Clock, Lock } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PageContainer } from "@/components/layout/PageContainer";
import { format, parseISO } from "date-fns";

interface OutingClosedProps {
  outingTitle: string;
  deadline: string;
  outingId: string;
}

export function OutingClosed({ outingTitle, deadline, outingId }: OutingClosedProps) {
  return (
    <PageContainer>
      <div className="flex min-h-[70vh] flex-col items-center justify-center text-center animate-scale-in">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted mb-6">
          <Lock className="h-10 w-10 text-muted-foreground" />
        </div>
        <h1 className="font-display text-2xl font-bold text-foreground">
          This outing has closed
        </h1>
        <p className="mt-3 text-muted-foreground max-w-xs">
          The response deadline for "{outingTitle}" has passed.
        </p>
        
        <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>Deadline was {format(parseISO(deadline), "MMM d 'at' h:mm a")}</span>
        </div>

        <div className="mt-8 flex flex-col gap-3 w-full max-w-sm">
          <Link to={`/vote/${outingId}`} className="w-full">
            <Button variant="outline" size="lg" className="w-full btn-press">
              View Plans & Votes
            </Button>
          </Link>
          <Link to="/" className="w-full">
            <Button variant="ghost" size="lg" className="w-full btn-press">
              Create your own outing
            </Button>
          </Link>
        </div>
      </div>
    </PageContainer>
  );
}
