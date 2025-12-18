import { useState } from "react";
import { Link } from "react-router-dom";
import { Flag, CalendarIcon, MapPin, Clock, User, ArrowRight } from "lucide-react";
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

const Index = () => {
  const [title, setTitle] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [zipCode, setZipCode] = useState("");
  const [deadline, setDeadline] = useState<Date | undefined>();
  const [deadlineTime, setDeadlineTime] = useState("18:00");
  const [organizerName, setOrganizerName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const formData = {
      title: title || "Saturday Golf",
      dateRange: {
        from: dateRange?.from,
        to: dateRange?.to,
      },
      zipCode,
      deadline: deadline ? new Date(
        deadline.getFullYear(),
        deadline.getMonth(),
        deadline.getDate(),
        parseInt(deadlineTime.split(":")[0]),
        parseInt(deadlineTime.split(":")[1])
      ) : null,
      organizerName,
    };

    console.log("Form Data:", formData);
    toast.success("Outing created! Check console for data.");
  };

  return (
    <PageContainer>
      {/* Header */}
      <div className="flex items-center justify-center pt-4 pb-6 animate-fade-in">
        <Link to="/" className="flex items-center gap-2">
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
        <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
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
                      "w-full h-12 justify-start text-left font-normal",
                      !dateRange && "text-muted-foreground"
                    )}
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
                        "flex-1 h-12 justify-start text-left font-normal",
                        !deadline && "text-muted-foreground"
                      )}
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
                    className="h-12 pl-10 w-[120px]"
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
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <Button 
            type="submit" 
            variant="hero" 
            size="lg" 
            className="w-full mt-8"
          >
            Create Outing
            <ArrowRight className="h-5 w-5" />
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
