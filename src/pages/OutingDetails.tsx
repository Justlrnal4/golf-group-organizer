import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Copy, Users, Calendar, MapPin, Share2, Loader2, Clock, DollarSign, Car, Target, Sparkles } from "lucide-react";
import { format, parseISO } from "date-fns";
import { Button } from "@/components/ui/button";
import { PageContainer } from "@/components/layout/PageContainer";
import { Header } from "@/components/layout/Header";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { computeOverlapWindows, formatWindowDisplay, type OverlapResult, type Participant, type Preference } from "@/lib/overlap";
import { cn } from "@/lib/utils";

interface Outing {
  id: string;
  title: string;
  date_range_start: string;
  date_range_end: string;
  location_zip: string;
  deadline: string;
  status: string;
}

const OutingDetails = () => {
  const { id } = useParams();
  const [outing, setOuting] = useState<Outing | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [preferences, setPreferences] = useState<Preference[]>([]);
  const [overlapResult, setOverlapResult] = useState<OverlapResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;

      try {
        // Fetch outing
        const { data: outingData, error: outingError } = await supabase
          .from("outings")
          .select("*")
          .eq("id", id)
          .maybeSingle();

        if (outingError) throw outingError;
        if (!outingData) {
          setError("Outing not found");
          return;
        }
        setOuting(outingData);

        // Fetch participants
        const { data: participantsData, error: participantsError } = await supabase
          .from("participants")
          .select("*")
          .eq("outing_id", id);

        if (participantsError) throw participantsError;
        setParticipants(participantsData || []);

        // Fetch preferences
        const { data: preferencesData, error: preferencesError } = await supabase
          .from("preferences")
          .select("*")
          .eq("outing_id", id);

        if (preferencesError) throw preferencesError;
        
        // Type assertion for preferences since availability is JSONB
        const typedPreferences: Preference[] = (preferencesData || []).map((p) => ({
          participant_id: p.participant_id,
          availability: (p.availability as Record<string, "morning" | "afternoon" | "either" | "cant">) || {},
          max_drive_minutes: p.max_drive_minutes,
          budget: p.budget,
          holes_preference: p.holes_preference,
        }));
        setPreferences(typedPreferences);

        // Compute overlaps
        if (outingData && participantsData && participantsData.length > 0) {
          const result = computeOverlapWindows(
            outingData.date_range_start,
            outingData.date_range_end,
            participantsData,
            typedPreferences
          );
          setOverlapResult(result);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load outing");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/join/${id}`);
    toast.success("Link copied to clipboard!");
  };

  if (isLoading) {
    return (
      <PageContainer>
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </PageContainer>
    );
  }

  if (error || !outing) {
    return (
      <PageContainer>
        <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
          <p className="text-lg font-medium text-foreground">{error || "Outing not found"}</p>
          <Link to="/" className="mt-4 text-sm text-primary hover:underline">
            Create a new outing
          </Link>
        </div>
      </PageContainer>
    );
  }

  const organizer = participants.find((p) => p.is_organizer);
  const respondedCount = preferences.length;
  const topWindows = overlapResult?.windows.slice(0, 5) || [];

  return (
    <PageContainer>
      <Header showBack title="Outing Details" />

      {/* Outing Header */}
      <div className="animate-fade-in rounded-2xl border border-border bg-card p-5 shadow-soft">
        <div className="flex items-start justify-between">
          <div>
            <span className="inline-flex items-center rounded-full bg-accent px-2.5 py-0.5 text-xs font-medium text-accent-foreground">
              {outing.status === "open" ? "Collecting responses" : outing.status}
            </span>
            <h1 className="mt-2 font-display text-xl font-bold text-card-foreground">
              {outing.title}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {format(parseISO(outing.date_range_start), "MMM d")} - {format(parseISO(outing.date_range_end), "MMM d, yyyy")}
            </p>
          </div>
        </div>

        {/* Share Link */}
        <div className="mt-4 flex items-center gap-2 rounded-lg bg-muted p-3">
          <div className="flex-1 truncate text-sm text-muted-foreground">
            {window.location.origin}/join/{id}
          </div>
          <Button variant="ghost" size="icon" onClick={handleCopyLink}>
            <Copy className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-4 grid grid-cols-3 gap-3 animate-slide-up" style={{ animationDelay: "0.05s" }}>
        <StatCard 
          icon={<Users className="h-4 w-4" />} 
          value={participants.length.toString()} 
          label="Joined" 
        />
        <StatCard 
          icon={<Calendar className="h-4 w-4" />} 
          value={respondedCount.toString()} 
          label="Responded" 
        />
        <StatCard 
          icon={<Clock className="h-4 w-4" />} 
          value={topWindows.length.toString()} 
          label="Time Slots" 
        />
      </div>

      {/* Constraint Summary */}
      {overlapResult && preferences.length > 0 && (
        <div className="mt-4 animate-slide-up" style={{ animationDelay: "0.1s" }}>
          <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
            <h2 className="font-display text-sm font-semibold text-card-foreground mb-3">
              Group Constraints
            </h2>
            <div className="flex flex-wrap gap-2">
              <ConstraintBadge 
                icon={<DollarSign className="h-3 w-3" />}
                label={`Budget: ${overlapResult.constraints.budget}`}
                sublabel={overlapResult.constraints.budget_description}
              />
              <ConstraintBadge 
                icon={<Car className="h-3 w-3" />}
                label={`Max drive: ${overlapResult.constraints.max_drive_minutes} min`}
              />
              <ConstraintBadge 
                icon={<Target className="h-3 w-3" />}
                label={`Holes: ${overlapResult.constraints.holes_preference === "either" ? "Flexible" : overlapResult.constraints.holes_preference}`}
              />
            </div>
          </div>
        </div>
      )}

      {/* Best Times */}
      {topWindows.length > 0 && (
        <div className="mt-4 animate-slide-up" style={{ animationDelay: "0.15s" }}>
          <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
            <h2 className="font-display text-sm font-semibold text-card-foreground mb-3">
              Best Times
            </h2>
            <div className="space-y-2">
              {topWindows.map((window, index) => (
                <div
                  key={`${window.date}-${window.time_slot}`}
                  className={cn(
                    "flex items-center justify-between rounded-xl p-3 transition-colors",
                    window.fit_rank === 1 
                      ? "bg-primary/10 border border-primary/20" 
                      : "bg-muted"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold",
                      window.fit_rank === 1 
                        ? "bg-primary text-primary-foreground" 
                        : "bg-background text-foreground border border-border"
                    )}>
                      #{window.fit_rank}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-foreground">
                        {formatWindowDisplay(window)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {window.available_names.slice(0, 3).join(", ")}
                        {window.available_names.length > 3 && ` +${window.available_names.length - 3}`}
                      </div>
                    </div>
                  </div>
                  <div className="text-sm font-semibold text-foreground">
                    {window.participant_count}/{window.total_participants}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Participants Section */}
      <div className="mt-4 animate-slide-up" style={{ animationDelay: "0.2s" }}>
        <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
          <h2 className="font-display text-sm font-semibold text-card-foreground mb-3">
            Participants
          </h2>
          {participants.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-muted/50 p-6 text-center">
              <Users className="mx-auto h-6 w-6 text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">
                No one has joined yet
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {participants.map((participant) => {
                const hasPref = preferences.some((p) => p.participant_id === participant.id);
                return (
                  <div
                    key={participant.id}
                    className="flex items-center justify-between rounded-xl bg-muted p-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-sm font-medium text-accent-foreground">
                        {participant.name[0]?.toUpperCase()}
                      </div>
                      <div>
                        <span className="text-sm font-medium text-foreground">
                          {participant.name}
                        </span>
                        {participant.is_organizer && (
                          <span className="ml-2 text-xs text-muted-foreground">
                            (Organizer)
                          </span>
                        )}
                      </div>
                    </div>
                    <span className={cn(
                      "text-xs font-medium px-2 py-1 rounded-full",
                      hasPref 
                        ? "bg-primary/10 text-primary" 
                        : "bg-muted-foreground/10 text-muted-foreground"
                    )}>
                      {hasPref ? "Responded" : "Pending"}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="mt-6 space-y-3 animate-slide-up" style={{ animationDelay: "0.25s" }}>
        {overlapResult?.has_overlap && (
          <Button variant="hero" size="lg" className="w-full" asChild>
            <Link to={`/vote/${id}`}>
              <Sparkles className="h-5 w-5" />
              Generate Plans
            </Link>
          </Button>
        )}
        <Button variant="outline" size="lg" className="w-full" onClick={handleCopyLink}>
          <Share2 className="h-5 w-5" />
          Share Invite Link
        </Button>
      </div>

      <div className="h-8" />
    </PageContainer>
  );
};

function StatCard({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-3 text-center shadow-soft">
      <div className="mx-auto mb-1.5 flex h-7 w-7 items-center justify-center rounded-lg bg-accent text-primary">
        {icon}
      </div>
      <div className="font-display text-xl font-bold text-card-foreground">
        {value}
      </div>
      <div className="text-[10px] text-muted-foreground">{label}</div>
    </div>
  );
}

function ConstraintBadge({
  icon,
  label,
  sublabel,
}: {
  icon: React.ReactNode;
  label: string;
  sublabel?: string;
}) {
  return (
    <div className="inline-flex items-center gap-1.5 rounded-lg bg-muted px-3 py-1.5">
      <span className="text-muted-foreground">{icon}</span>
      <span className="text-xs font-medium text-foreground">{label}</span>
      {sublabel && (
        <span className="text-[10px] text-muted-foreground">({sublabel})</span>
      )}
    </div>
  );
}

export default OutingDetails;
