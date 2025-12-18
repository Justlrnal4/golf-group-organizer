import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Flag, User, Loader2, CheckCircle2, Car, DollarSign, Target } from "lucide-react";
import { format, eachDayOfInterval, parseISO } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageContainer } from "@/components/layout/PageContainer";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

type TimeSlot = "morning" | "afternoon" | "either" | "cant";
type Availability = Record<string, TimeSlot>;

interface Outing {
  id: string;
  title: string;
  date_range_start: string;
  date_range_end: string;
  deadline: string;
  status: string;
}

const driveTimeOptions = [
  { value: 15, label: "15 min" },
  { value: 30, label: "30 min" },
  { value: 45, label: "45 min" },
  { value: 60, label: "60 min" },
];

const budgetOptions = [
  { value: "$", label: "$", description: "Under $50" },
  { value: "$$", label: "$$", description: "$50-100" },
  { value: "$$$", label: "$$$", description: "$100+" },
];

const holesOptions = [
  { value: "9", label: "9 holes" },
  { value: "18", label: "18 holes" },
  { value: "either", label: "Either" },
];

const timeSlotOptions: { value: TimeSlot; label: string; color: string }[] = [
  { value: "morning", label: "AM", color: "bg-amber-100 text-amber-800 border-amber-200" },
  { value: "afternoon", label: "PM", color: "bg-blue-100 text-blue-800 border-blue-200" },
  { value: "either", label: "Any", color: "bg-primary/10 text-primary border-primary/20" },
  { value: "cant", label: "✕", color: "bg-muted text-muted-foreground border-border" },
];

const JoinOuting = () => {
  const { id } = useParams();
  const [outing, setOuting] = useState<Outing | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [availability, setAvailability] = useState<Availability>({});
  const [maxDriveMinutes, setMaxDriveMinutes] = useState(30);
  const [budget, setBudget] = useState("$$");
  const [holesPreference, setHolesPreference] = useState("either");

  useEffect(() => {
    const fetchOuting = async () => {
      if (!id) return;

      try {
        const { data, error } = await supabase
          .from("outings")
          .select("*")
          .eq("id", id)
          .maybeSingle();

        if (error) throw error;
        if (!data) {
          setError("Outing not found");
          return;
        }

        setOuting(data);

        // Initialize availability for each day
        const days = eachDayOfInterval({
          start: parseISO(data.date_range_start),
          end: parseISO(data.date_range_end),
        });
        const initialAvailability: Availability = {};
        days.forEach((day) => {
          initialAvailability[format(day, "yyyy-MM-dd")] = "either";
        });
        setAvailability(initialAvailability);
      } catch (err) {
        console.error("Error fetching outing:", err);
        setError("Failed to load outing");
      } finally {
        setIsLoading(false);
      }
    };

    fetchOuting();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Please enter your name");
      return;
    }

    if (!outing) return;

    setIsSubmitting(true);

    try {
      // Create participant
      const { data: participant, error: participantError } = await supabase
        .from("participants")
        .insert({
          outing_id: outing.id,
          name: name.trim(),
          is_organizer: false,
        })
        .select()
        .single();

      if (participantError) throw participantError;

      // Create preferences
      const { error: preferencesError } = await supabase
        .from("preferences")
        .insert({
          participant_id: participant.id,
          outing_id: outing.id,
          availability: availability,
          max_drive_minutes: maxDriveMinutes,
          budget: budget,
          holes_preference: holesPreference,
        });

      if (preferencesError) throw preferencesError;

      setIsSuccess(true);
    } catch (err) {
      console.error("Error submitting preferences:", err);
      toast.error("Failed to submit. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const setDayAvailability = (date: string, slot: TimeSlot) => {
    setAvailability((prev) => ({ ...prev, [date]: slot }));
  };

  // Loading state
  if (isLoading) {
    return (
      <PageContainer>
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </PageContainer>
    );
  }

  // Error state
  if (error || !outing) {
    return (
      <PageContainer>
        <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
          <p className="text-lg font-medium text-foreground">{error || "Outing not found"}</p>
          <Link to="/" className="mt-4 text-sm text-primary hover:underline">
            Create your own outing
          </Link>
        </div>
      </PageContainer>
    );
  }

  // Success state
  if (isSuccess) {
    return (
      <PageContainer>
        <div className="flex min-h-[70vh] flex-col items-center justify-center text-center animate-scale-in">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 mb-6">
            <CheckCircle2 className="h-10 w-10 text-primary" />
          </div>
          <h1 className="font-display text-3xl font-bold text-foreground">You're in!</h1>
          <p className="mt-3 text-muted-foreground max-w-xs">
            We'll text you when the plan is locked in.
          </p>
          <Link to="/" className="mt-8">
            <Button variant="outline">Create your own outing</Button>
          </Link>
        </div>
      </PageContainer>
    );
  }

  const days = eachDayOfInterval({
    start: parseISO(outing.date_range_start),
    end: parseISO(outing.date_range_end),
  });

  return (
    <PageContainer>
      {/* Logo */}
      <div className="flex items-center justify-center pt-4 pb-4 animate-fade-in">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl gradient-hero shadow-soft">
            <Flag className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-display text-lg font-semibold text-foreground">
            CrewSync
          </span>
        </Link>
      </div>

      {/* Header Card */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-soft mb-4 animate-fade-in">
        <div className="text-center">
          <span className="inline-flex items-center rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground">
            You're invited!
          </span>
          <h1 className="mt-3 font-display text-xl font-bold text-card-foreground">
            {outing.title}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {format(parseISO(outing.date_range_start), "MMM d")} - {format(parseISO(outing.date_range_end), "MMM d")}
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4 animate-slide-up">
        {/* Name Input */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
          <Label htmlFor="name" className="text-sm font-medium flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            Your Name
          </Label>
          <Input
            id="name"
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-2 h-12"
            disabled={isSubmitting}
          />
        </div>

        {/* Availability */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
          <Label className="text-sm font-medium">When can you play?</Label>
          <p className="text-xs text-muted-foreground mt-1 mb-4">
            Tap to select your availability for each day
          </p>

          <div className="space-y-3">
            {days.map((day) => {
              const dateKey = format(day, "yyyy-MM-dd");
              const currentSlot = availability[dateKey] || "either";

              return (
                <div key={dateKey} className="flex items-center gap-3">
                  <div className="w-16 shrink-0">
                    <div className="text-xs text-muted-foreground">{format(day, "EEE")}</div>
                    <div className="font-medium text-sm">{format(day, "MMM d")}</div>
                  </div>
                  <div className="flex flex-1 gap-1.5">
                    {timeSlotOptions.map((slot) => (
                      <button
                        key={slot.value}
                        type="button"
                        onClick={() => setDayAvailability(dateKey, slot.value)}
                        disabled={isSubmitting}
                        className={cn(
                          "flex-1 py-2 px-2 rounded-lg text-xs font-medium border transition-all",
                          currentSlot === slot.value
                            ? slot.color + " ring-2 ring-offset-1 ring-primary/30"
                            : "bg-background text-muted-foreground border-border hover:bg-muted"
                        )}
                      >
                        {slot.label}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Drive Time */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
          <Label className="text-sm font-medium flex items-center gap-2">
            <Car className="h-4 w-4 text-muted-foreground" />
            Max drive time?
          </Label>
          <div className="flex gap-2 mt-3">
            {driveTimeOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setMaxDriveMinutes(option.value)}
                disabled={isSubmitting}
                className={cn(
                  "flex-1 py-3 px-3 rounded-xl text-sm font-medium border transition-all",
                  maxDriveMinutes === option.value
                    ? "bg-primary text-primary-foreground border-primary shadow-soft"
                    : "bg-background text-foreground border-border hover:bg-muted"
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Budget */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
          <Label className="text-sm font-medium flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            Budget per round?
          </Label>
          <div className="flex gap-2 mt-3">
            {budgetOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setBudget(option.value)}
                disabled={isSubmitting}
                className={cn(
                  "flex-1 py-3 px-3 rounded-xl border transition-all text-center",
                  budget === option.value
                    ? "bg-primary text-primary-foreground border-primary shadow-soft"
                    : "bg-background text-foreground border-border hover:bg-muted"
                )}
              >
                <div className="font-semibold">{option.label}</div>
                <div className="text-[10px] opacity-80 mt-0.5">{option.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Holes Preference */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
          <Label className="text-sm font-medium flex items-center gap-2">
            <Target className="h-4 w-4 text-muted-foreground" />
            How many holes?
          </Label>
          <div className="flex gap-2 mt-3">
            {holesOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setHolesPreference(option.value)}
                disabled={isSubmitting}
                className={cn(
                  "flex-1 py-3 px-3 rounded-xl text-sm font-medium border transition-all",
                  holesPreference === option.value
                    ? "bg-primary text-primary-foreground border-primary shadow-soft"
                    : "bg-background text-foreground border-border hover:bg-muted"
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          variant="hero"
          size="xl"
          className="w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Submitting...
            </>
          ) : (
            "I'm In!"
          )}
        </Button>
      </form>

      <div className="h-8" />
    </PageContainer>
  );
};

export default JoinOuting;
