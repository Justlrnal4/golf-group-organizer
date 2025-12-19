import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Flag, User, Loader2, CheckCircle2, Car, DollarSign, Target, Sparkles, Phone } from "lucide-react";
import { format, eachDayOfInterval, parseISO, isBefore } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageContainer } from "@/components/layout/PageContainer";
import { JoinOutingSkeleton } from "@/components/LoadingSkeleton";
import { ErrorState } from "@/components/ErrorState";
import { AlreadyResponded } from "@/components/AlreadyResponded";
import { OutingClosed } from "@/components/OutingClosed";
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

interface StoredPreferences {
  name: string;
  phone?: string;
  budget: string;
  maxDriveMinutes: number;
  holesPreference: string;
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

const timeSlotOptions: { value: TimeSlot; label: string; color: string; activeColor: string }[] = [
  { value: "morning", label: "AM", color: "bg-amber-50 text-amber-700 border-amber-200", activeColor: "bg-amber-100 text-amber-800 border-amber-300 ring-2 ring-amber-200" },
  { value: "afternoon", label: "PM", color: "bg-blue-50 text-blue-700 border-blue-200", activeColor: "bg-blue-100 text-blue-800 border-blue-300 ring-2 ring-blue-200" },
  { value: "either", label: "Any", color: "bg-primary/5 text-primary border-primary/20", activeColor: "bg-primary/15 text-primary border-primary/30 ring-2 ring-primary/20" },
  { value: "cant", label: "✕", color: "bg-muted text-muted-foreground border-border", activeColor: "bg-muted text-muted-foreground border-border ring-2 ring-border" },
];

const JoinOuting = () => {
  const { id } = useParams();
  const [outing, setOuting] = useState<Outing | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [alreadyResponded, setAlreadyResponded] = useState<StoredPreferences | null>(null);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [availability, setAvailability] = useState<Availability>({});
  const [maxDriveMinutes, setMaxDriveMinutes] = useState(30);
  const [budget, setBudget] = useState("$$");
  const [holesPreference, setHolesPreference] = useState("either");

  useEffect(() => {
    const fetchOuting = async () => {
      if (!id) return;

      try {
        const participantId = localStorage.getItem(`participant_${id}`);
        const storedPrefs = localStorage.getItem(`preferences_${id}`);
        
        if (participantId && storedPrefs) {
          try {
            const prefs = JSON.parse(storedPrefs) as StoredPreferences;
            setAlreadyResponded(prefs);
          } catch {
            // Invalid stored data, continue with normal flow
          }
        }

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
      const { data: participant, error: participantError } = await supabase
        .from("participants")
        .insert({
          outing_id: outing.id,
          name: name.trim(),
          phone: phone.trim() || null,
          is_organizer: false,
        })
        .select()
        .single();

      if (participantError) throw participantError;

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

      localStorage.setItem(`participant_${outing.id}`, participant.id);
      localStorage.setItem(`preferences_${outing.id}`, JSON.stringify({
        name: name.trim(),
        phone: phone.trim() || undefined,
        budget,
        maxDriveMinutes,
        holesPreference,
      }));

      setIsSuccess(true);
    } catch (err) {
      console.error("Error submitting preferences:", err);
      toast.error("Failed to submit. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRetry = () => {
    setError(null);
    setIsLoading(true);
    window.location.reload();
  };

  const setDayAvailability = (date: string, slot: TimeSlot) => {
    setAvailability((prev) => ({ ...prev, [date]: slot }));
  };

  if (isLoading) {
    return (
      <PageContainer>
        <JoinOutingSkeleton />
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <ErrorState message={error} onRetry={handleRetry} />
      </PageContainer>
    );
  }

  if (!outing) {
    return (
      <PageContainer>
        <ErrorState message="Outing not found" />
      </PageContainer>
    );
  }

  const deadlinePassed = isBefore(parseISO(outing.deadline), new Date());
  if (deadlinePassed) {
    return <OutingClosed outingTitle={outing.title} deadline={outing.deadline} outingId={outing.id} />;
  }

  if (alreadyResponded) {
    return <AlreadyResponded outingId={outing.id} preferences={alreadyResponded} />;
  }

  if (isSuccess) {
    return (
      <PageContainer>
        <div className="flex min-h-[70vh] flex-col items-center justify-center text-center animate-scale-in">
          <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 mb-8">
            <CheckCircle2 className="h-12 w-12 text-primary" />
            <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl" />
          </div>
          <h1 className="font-display text-4xl font-bold text-foreground tracking-tight">You're in!</h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-xs">
            We'll notify you when the plan is locked in.
          </p>
          <div className="mt-10 flex flex-col gap-4 w-full max-w-sm">
            <Link to={`/vote/${outing.id}`} className="w-full">
              <Button variant="hero" size="lg" className="w-full">
                Vote on Plans
              </Button>
            </Link>
            <Link to="/" className="w-full">
              <Button variant="outline" size="lg" className="w-full">
                Create your own outing
              </Button>
            </Link>
          </div>
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
      <div className="flex items-center justify-center pt-2 pb-6 animate-fade-in">
        <Link to="/" className="group flex items-center gap-3 btn-press">
          <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl gradient-hero shadow-elevated">
            <Flag className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-display text-xl font-bold text-foreground tracking-tight">
            CrewSync Golf
          </span>
        </Link>
      </div>

      {/* Header Card */}
      <div className="glass-card p-6 mb-5 animate-fade-in">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-accent/80 px-4 py-1.5 text-xs font-semibold text-accent-foreground mb-4">
            <Sparkles className="h-3.5 w-3.5" />
            You're invited!
          </div>
          <h1 className="font-display text-2xl font-bold text-card-foreground tracking-tight">
            {outing.title}
          </h1>
          <p className="mt-2 text-muted-foreground">
            {format(parseISO(outing.date_range_start), "MMM d")} - {format(parseISO(outing.date_range_end), "MMM d")}
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5 animate-slide-up" style={{ animationDelay: "0.1s" }}>
        {/* Name & Phone Input */}
        <div className="glass-card p-6 space-y-5">
          <div>
            <Label htmlFor="name" className="text-sm font-semibold flex items-center gap-2">
              <User className="h-4 w-4 text-primary" />
              Your Name
            </Label>
            <Input
              id="name"
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-3"
              disabled={isSubmitting}
            />
          </div>
          <div>
            <Label htmlFor="phone" className="text-sm font-semibold flex items-center gap-2">
              <Phone className="h-4 w-4 text-primary" />
              Phone Number
              <span className="text-xs font-normal text-muted-foreground">(optional)</span>
            </Label>
            <Input
              id="phone"
              type="tel"
              placeholder="(555) 123-4567"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="mt-3"
              disabled={isSubmitting}
            />
            <p className="text-xs text-muted-foreground mt-2">
              Share with your crew for easier coordination
            </p>
          </div>
        </div>

        {/* Availability */}
        <div className="glass-card p-6">
          <Label className="text-sm font-semibold">When can you play?</Label>
          <p className="text-xs text-muted-foreground mt-1 mb-5">
            Tap to select your availability for each day
          </p>

          <div className="space-y-3">
            {days.map((day) => {
              const dateKey = format(day, "yyyy-MM-dd");
              const currentSlot = availability[dateKey] || "either";

              return (
                <div key={dateKey} className="flex items-center gap-3">
                  <div className="w-16 shrink-0">
                    <div className="text-xs text-muted-foreground font-medium">{format(day, "EEE")}</div>
                    <div className="font-semibold text-sm">{format(day, "MMM d")}</div>
                  </div>
                  <div className="flex flex-1 gap-2">
                    {timeSlotOptions.map((slot) => (
                      <button
                        key={slot.value}
                        type="button"
                        onClick={() => setDayAvailability(dateKey, slot.value)}
                        disabled={isSubmitting}
                        className={cn(
                          "flex-1 py-2.5 px-2 rounded-xl text-xs font-semibold border transition-all duration-200",
                          currentSlot === slot.value ? slot.activeColor : slot.color + " hover:opacity-80"
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
        <div className="glass-card p-6">
          <Label className="text-sm font-semibold flex items-center gap-2">
            <Car className="h-4 w-4 text-primary" />
            Max drive time?
          </Label>
          <div className="flex gap-2.5 mt-4">
            {driveTimeOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setMaxDriveMinutes(option.value)}
                disabled={isSubmitting}
                className={cn(
                  "flex-1 py-3.5 px-3 rounded-xl text-sm font-semibold border-2 transition-all duration-200",
                  maxDriveMinutes === option.value
                    ? "bg-primary text-primary-foreground border-primary shadow-soft"
                    : "bg-card/50 text-foreground border-border/60 hover:border-primary/30"
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Budget */}
        <div className="glass-card p-6">
          <Label className="text-sm font-semibold flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-primary" />
            Budget per round?
          </Label>
          <div className="flex gap-2.5 mt-4">
            {budgetOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setBudget(option.value)}
                disabled={isSubmitting}
                className={cn(
                  "flex-1 py-3.5 px-3 rounded-xl border-2 transition-all duration-200 text-center",
                  budget === option.value
                    ? "bg-primary text-primary-foreground border-primary shadow-soft"
                    : "bg-card/50 text-foreground border-border/60 hover:border-primary/30"
                )}
              >
                <div className="font-bold text-base">{option.label}</div>
                <div className="text-[10px] opacity-80 mt-0.5">{option.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Holes Preference */}
        <div className="glass-card p-6">
          <Label className="text-sm font-semibold flex items-center gap-2">
            <Target className="h-4 w-4 text-primary" />
            How many holes?
          </Label>
          <div className="flex gap-2.5 mt-4">
            {holesOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setHolesPreference(option.value)}
                disabled={isSubmitting}
                className={cn(
                  "flex-1 py-3.5 px-3 rounded-xl text-sm font-semibold border-2 transition-all duration-200",
                  holesPreference === option.value
                    ? "bg-primary text-primary-foreground border-primary shadow-soft"
                    : "bg-card/50 text-foreground border-border/60 hover:border-primary/30"
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

      <div className="h-10" />
    </PageContainer>
  );
};

export default JoinOuting;