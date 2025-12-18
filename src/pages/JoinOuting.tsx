import { useParams, Link } from "react-router-dom";
import { Flag, User, Calendar, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageContainer } from "@/components/layout/PageContainer";

const JoinOuting = () => {
  const { id } = useParams();

  return (
    <PageContainer>
      {/* Logo */}
      <div className="flex items-center justify-center pt-8 animate-fade-in">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-hero shadow-soft">
            <Flag className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-display text-xl font-semibold text-foreground">
            CrewSync
          </span>
        </Link>
      </div>

      {/* Join Card */}
      <div className="mt-10 animate-slide-up">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
          <div className="text-center">
            <span className="inline-flex items-center rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground">
              You're invited!
            </span>
            <h1 className="mt-4 font-display text-2xl font-bold text-card-foreground">
              Weekend Golf Trip
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Join this outing and share your availability
            </p>
          </div>

          {/* Form */}
          <form className="mt-8 space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">
                Your Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Enter your name"
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">
                Available Dates
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Select your available dates"
                  className="pl-10"
                />
              </div>
              <p className="mt-1.5 text-xs text-muted-foreground">
                Calendar picker coming soon
              </p>
            </div>

            <Button variant="hero" size="lg" className="mt-6 w-full">
              Join Outing
              <ArrowRight className="h-5 w-5" />
            </Button>
          </form>
        </div>
      </div>

      {/* Outing Info */}
      <div className="mt-6 animate-slide-up text-center" style={{ animationDelay: "0.1s" }}>
        <p className="text-xs text-muted-foreground">
          Outing ID: {id}
        </p>
        <Link
          to="/"
          className="mt-2 inline-block text-sm font-medium text-primary hover:underline"
        >
          Create your own outing
        </Link>
      </div>
    </PageContainer>
  );
};

export default JoinOuting;
