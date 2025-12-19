import { CheckCircle2, Clock, DollarSign, Car, Target } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PageContainer } from "@/components/layout/PageContainer";

interface StoredPreferences {
  name: string;
  budget: string;
  maxDriveMinutes: number;
  holesPreference: string;
}

interface AlreadyRespondedProps {
  outingId: string;
  preferences: StoredPreferences;
}

export function AlreadyResponded({ outingId, preferences }: AlreadyRespondedProps) {
  return (
    <PageContainer>
      <div className="flex min-h-[70vh] flex-col items-center justify-center text-center animate-scale-in">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 mb-6">
          <CheckCircle2 className="h-10 w-10 text-primary" />
        </div>
        <h1 className="font-display text-2xl font-bold text-foreground">
          You've already responded!
        </h1>
        <p className="mt-3 text-muted-foreground max-w-xs">
          Your preferences have been saved. Here's what you submitted:
        </p>

        {/* Show saved preferences */}
        <div className="mt-6 w-full max-w-sm space-y-3">
          <div className="flex items-center justify-between rounded-xl bg-muted p-3">
            <span className="text-sm text-muted-foreground">Name</span>
            <span className="text-sm font-medium text-foreground">{preferences.name}</span>
          </div>
          <div className="flex items-center justify-between rounded-xl bg-muted p-3">
            <div className="flex items-center gap-2 text-muted-foreground">
              <DollarSign className="h-4 w-4" />
              <span className="text-sm">Budget</span>
            </div>
            <span className="text-sm font-medium text-foreground">{preferences.budget}</span>
          </div>
          <div className="flex items-center justify-between rounded-xl bg-muted p-3">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Car className="h-4 w-4" />
              <span className="text-sm">Max Drive</span>
            </div>
            <span className="text-sm font-medium text-foreground">{preferences.maxDriveMinutes} min</span>
          </div>
          <div className="flex items-center justify-between rounded-xl bg-muted p-3">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Target className="h-4 w-4" />
              <span className="text-sm">Holes</span>
            </div>
            <span className="text-sm font-medium text-foreground capitalize">{preferences.holesPreference}</span>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 w-full max-w-sm">
          <Link to={`/vote/${outingId}`} className="w-full">
            <Button variant="hero" size="lg" className="w-full btn-press">
              Vote on Plans
            </Button>
          </Link>
          <Link to="/" className="w-full">
            <Button variant="outline" size="lg" className="w-full btn-press">
              Create your own outing
            </Button>
          </Link>
        </div>
      </div>
    </PageContainer>
  );
}
