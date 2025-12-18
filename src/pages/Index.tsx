import { Link } from "react-router-dom";
import { Flag, Users, CalendarDays, MapPin, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageContainer } from "@/components/layout/PageContainer";

const Index = () => {
  return (
    <PageContainer>
      {/* Hero Section */}
      <div className="animate-fade-in pt-8 text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl gradient-hero shadow-elevated">
          <Flag className="h-8 w-8 text-primary-foreground" />
        </div>
        
        <h1 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          CrewSync Golf
        </h1>
        <p className="mt-3 text-muted-foreground">
          Coordinate your golf outings effortlessly
        </p>
      </div>

      {/* Create Outing Card */}
      <div className="mt-10 animate-slide-up" style={{ animationDelay: "0.1s" }}>
        <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
          <h2 className="font-display text-xl font-semibold text-card-foreground">
            Plan Your Outing
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Create an outing, invite friends, and vote on the best plan together.
          </p>
          
          <Button variant="hero" size="lg" className="mt-6 w-full" asChild>
            <Link to="/outing/demo">
              <Plus className="h-5 w-5" />
              Create New Outing
            </Link>
          </Button>
        </div>
      </div>

      {/* Features Grid */}
      <div className="mt-8 grid gap-4 animate-slide-up" style={{ animationDelay: "0.2s" }}>
        <FeatureCard
          icon={<Users className="h-5 w-5" />}
          title="Invite Your Crew"
          description="Share a link and let everyone join in seconds"
        />
        <FeatureCard
          icon={<CalendarDays className="h-5 w-5" />}
          title="Find the Best Date"
          description="Collect availability and find overlap"
        />
        <FeatureCard
          icon={<MapPin className="h-5 w-5" />}
          title="Pick the Course"
          description="Vote on courses and tee times together"
        />
      </div>

      {/* Quick Actions */}
      <div className="mt-8 animate-slide-up" style={{ animationDelay: "0.3s" }}>
        <p className="text-center text-sm text-muted-foreground">
          Have an invite link?
        </p>
        <div className="mt-3 flex gap-3">
          <Button variant="outline" className="flex-1" asChild>
            <Link to="/join/demo">Join Outing</Link>
          </Button>
          <Button variant="outline" className="flex-1" asChild>
            <Link to="/vote/demo">Vote on Plans</Link>
          </Button>
        </div>
      </div>
    </PageContainer>
  );
};

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-4 rounded-xl border border-border bg-card p-4 transition-all duration-200 hover:shadow-soft">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent text-primary">
        {icon}
      </div>
      <div>
        <h3 className="font-medium text-card-foreground">{title}</h3>
        <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

export default Index;
