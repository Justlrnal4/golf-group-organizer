import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Flag, CalendarIcon, MapPin, Clock, User, ArrowRight, Loader2 } from "lucide-react";
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
    
    // Validation
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
      // Create deadline with time
      const deadlineDateTime = new Date(
        deadline.getFullYear(),
        deadline.getMonth(),
        deadline.getDate(),
        parseInt(deadlineTime.split(":")[0]),
        parseInt(deadlineTime.split(":")[1])
      );

      // Insert outing
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

      // Insert organizer as participant
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

      // Store participant ID for voting
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
      <div className="flex items-center justify-center pt-4 pb-6 animate-fade-in">
        <Link to="/" className="flex items-center gap-2 btn-press">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-hero shadow-soft">
            <Flag className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-display text-xl font-semibold text-foreground">
            CrewSync Golf
          </span>
        </Link>
      </div>

      {/* Form Card */}
      <form onSubmit={handleSubmit} className="animate-slide-up">
        <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-soft">
          <div className="text-center mb-6">
            <h1 className="font-display text-2xl font-bold text-card-foreground">
              Create an Outing
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Set up your golf outing and invite friends
            </p>
          </div>

          <div className="space-y-5">
            {/* Outing Title */}
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm font-medium">
                Outing Title
              </Label>
              <Input
                id="title"
                type="text"
                placeholder="Saturday Golf"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="h-12"
                disabled={isSubmitting}
              />
            </div>

            {/* Date Range */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">
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
                      "w-full h-12 justify-start text-left font-normal btn-press",
                      !dateRange && "text-muted-foreground"
                    )}
                    disabled={isSubmitting}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange?.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "MMM d")} - {format(dateRange.to, "MMM d, yyyy")}
                        </>
                      ) : (
                        format(dateRange.from, "MMM d, yyyy")
                      )
                    ) : (
                      <span>Select date range</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
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
              <Label htmlFor="zipCode" className="text-sm font-medium">
                Your Zip Code
              </Label>
              <p className="text-xs text-muted-foreground">
                We'll find courses near this location
              </p>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="zipCode"
                  type="text"
                  placeholder="12345"
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value.replace(/\D/g, "").slice(0, 5))}
                  className="h-12 pl-10"
                  maxLength={5}
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Response Deadline */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Response Deadline
              </Label>
              <p className="text-xs text-muted-foreground">
                When do friends need to respond by?
              </p>
              <div className="flex gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "flex-1 h-12 justify-start text-left font-normal btn-press",
                        !deadline && "text-muted-foreground"
                      )}
                      disabled={isSubmitting}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {deadline ? format(deadline, "MMM d, yyyy") : <span>Select date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
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
                  <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="time"
                    value={deadlineTime}
                    onChange={(e) => setDeadlineTime(e.target.value)}
                    className="h-12 pl-10 w-[110px] sm:w-[120px]"
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            </div>

            {/* Organizer Name */}
            <div className="space-y-2">
              <Label htmlFor="organizerName" className="text-sm font-medium">
                Your Name
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="organizerName"
                  type="text"
                  placeholder="Enter your name"
                  value={organizerName}
                  onChange={(e) => setOrganizerName(e.target.value)}
                  className="h-12 pl-10"
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
            className="w-full mt-8 btn-press"
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
      <div className="mt-6 text-center animate-fade-in" style={{ animationDelay: "0.2s" }}>
        <p className="text-sm text-muted-foreground">
          Have an invite link?{" "}
          <Link to="/join/demo" className="font-medium text-primary hover:underline">
            Join an outing
          </Link>
        </p>
      </div>
    </PageContainer>
  );
};

export default Index;
