import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Flag, CalendarIcon, MapPin, Clock, User, ArrowRight, Loader2, Sparkles } from "lucide-react";
import { format } from "date-fns";
import { DateRange } from "react-day-picker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { PageContainer } from "@/components/layout/PageContainer";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [title, setTitle] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [zipCode, setZipCode] = useState("");
  const [deadline, setDeadline] = useState<Date | undefined>();
  const [deadlineTime, setDeadlineTime] = useState("18:00");
  const [organizerName, setOrganizerName] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!dateRange?.from || !dateRange?.to) {
      toast.error("Please select a date range");
      return;
    }
    if (!zipCode || zipCode.length < 5) {
      toast.error("Please enter a valid zip code");
      return;
    }
    if (!deadline) {
      toast.error("Please select a response deadline");
      return;
    }
    if (!organizerName.trim()) {
      toast.error("Please enter your name");
      return;
    }

    setIsSubmitting(true);

    try {
      const deadlineDateTime = new Date(
        deadline.getFullYear(),
        deadline.getMonth(),
        deadline.getDate(),
        parseInt(deadlineTime.split(":")[0]),
        parseInt(deadlineTime.split(":")[1])
      );

      const { data: outing, error: outingError } = await supabase
        .from("outings")
        .insert({
          title: title.trim() || "Saturday Golf",
          date_range_start: format(dateRange.from, "yyyy-MM-dd"),
          date_range_end: format(dateRange.to, "yyyy-MM-dd"),
          location_zip: zipCode,
          deadline: deadlineDateTime.toISOString(),
          status: "open",
        })
        .select()
        .single();

      if (outingError) throw outingError;

      const { data: participant, error: participantError } = await supabase
        .from("participants")
        .insert({
          outing_id: outing.id,
          name: organizerName.trim(),
          is_organizer: true,
        })
        .select()
        .single();

      if (participantError) throw participantError;

      localStorage.setItem(`participant_${outing.id}`, participant.id);

      toast.success("Outing created!");
      navigate(`/outing/${outing.id}`);
    } catch (error) {
      console.error("Error creating outing:", error);
      toast.error("Failed to create outing. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageContainer>
      {/* Header */}
      <div className="flex items-center justify-center pt-2 pb-8 animate-fade-in">
        <Link to="/" className="group flex items-center gap-3 btn-press">
          <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl gradient-hero shadow-elevated">
            <Flag className="h-6 w-6 text-primary-foreground" />
            <div className="absolute inset-0 rounded-2xl bg-primary/20 blur-xl opacity-60" />
          </div>
          <span className="font-display text-2xl font-bold text-foreground tracking-tight">
            CrewSync Golf
          </span>
        </Link>
      </div>

      {/* Form Card */}
      <form onSubmit={handleSubmit} className="animate-slide-up">
        <div className="glass-card p-6 sm:p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/80 text-accent-foreground text-xs font-semibold mb-4">
              <Sparkles className="h-3.5 w-3.5" />
              New Outing
            </div>
            <h1 className="font-display text-3xl font-bold text-card-foreground tracking-tight">
              Create an Outing
            </h1>
            <p className="mt-2 text-muted-foreground">
              Set up your golf outing and invite friends
            </p>
          </div>

          <div className="space-y-6">
            {/* Outing Title */}
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm font-semibold">
                Outing Title
              </Label>
              <Input
                id="title"
                type="text"
                placeholder="Saturday Golf"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="h-13"
                disabled={isSubmitting}
              />
            </div>

            {/* Date Range */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold">
                Possible Dates
              </Label>
              <p className="text-xs text-muted-foreground">
                Select a range of dates when the group could play
              </p>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full h-13 justify-start text-left font-normal",
                      !dateRange && "text-muted-foreground"
                    )}
                    disabled={isSubmitting}
                  >
                    <CalendarIcon className="mr-3 h-4 w-4 text-primary" />
                    {dateRange?.from ? (
                      dateRange.to ? (
                        <span className="font-medium">
                          {format(dateRange.from, "MMM d")} - {format(dateRange.to, "MMM d, yyyy")}
                        </span>
                      ) : (
                        format(dateRange.from, "MMM d, yyyy")
                      )
                    ) : (
                      <span>Select date range</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 glass-card" align="start">
                  <Calendar
                    mode="range"
                    selected={dateRange}
                    onSelect={setDateRange}
                    numberOfMonths={1}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Zip Code */}
            <div className="space-y-2">
              <Label htmlFor="zipCode" className="text-sm font-semibold">
                Your Zip Code
              </Label>
              <p className="text-xs text-muted-foreground">
                We'll find courses near this location
              </p>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-primary" />
                <Input
                  id="zipCode"
                  type="text"
                  placeholder="12345"
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value.replace(/\D/g, "").slice(0, 5))}
                  className="h-13 pl-11"
                  maxLength={5}
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Response Deadline */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold">
                Response Deadline
              </Label>
              <p className="text-xs text-muted-foreground">
                When do friends need to respond by?
              </p>
              <div className="flex gap-3">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "flex-1 h-13 justify-start text-left font-normal",
                        !deadline && "text-muted-foreground"
                      )}
                      disabled={isSubmitting}
                    >
                      <CalendarIcon className="mr-3 h-4 w-4 text-primary" />
                      {deadline ? (
                        <span className="font-medium">{format(deadline, "MMM d, yyyy")}</span>
                      ) : (
                        <span>Select date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 glass-card" align="start">
                    <Calendar
                      mode="single"
                      selected={deadline}
                      onSelect={setDeadline}
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <div className="relative">
                  <Clock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-primary" />
                  <Input
                    type="time"
                    value={deadlineTime}
                    onChange={(e) => setDeadlineTime(e.target.value)}
                    className="h-13 pl-11 w-[120px] sm:w-[130px]"
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            </div>

            {/* Organizer Name */}
            <div className="space-y-2">
              <Label htmlFor="organizerName" className="text-sm font-semibold">
                Your Name
              </Label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-primary" />
                <Input
                  id="organizerName"
                  type="text"
                  placeholder="Enter your name"
                  value={organizerName}
                  onChange={(e) => setOrganizerName(e.target.value)}
                  className="h-13 pl-11"
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <Button 
            type="submit" 
            variant="hero" 
            size="lg" 
            className="w-full mt-10"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                Create Outing
                <ArrowRight className="h-5 w-5" />
              </>
            )}
          </Button>
        </div>
      </form>

      {/* Footer Link */}
      <div className="mt-8 text-center animate-fade-in" style={{ animationDelay: "0.3s" }}>
        <p className="text-sm text-muted-foreground">
          Have an invite link?{" "}
          <Link to="/join/demo" className="font-semibold text-primary hover:text-primary/80 transition-colors">
            Join an outing
          </Link>
        </p>
      </div>
    </PageContainer>
  );
};

export default Index;