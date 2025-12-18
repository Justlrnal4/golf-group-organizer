import { useParams } from "react-router-dom";
import { Calendar, MapPin, Clock, ThumbsUp, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageContainer } from "@/components/layout/PageContainer";
import { Header } from "@/components/layout/Header";

// Placeholder plan data
const samplePlans = [
  {
    id: 1,
    course: "Pebble Beach Golf Links",
    date: "Saturday, Jan 25",
    time: "8:00 AM",
    votes: 3,
    voters: ["Mike", "John", "Sarah"],
  },
  {
    id: 2,
    course: "TPC Sawgrass",
    date: "Sunday, Jan 26",
    time: "9:30 AM",
    votes: 2,
    voters: ["Alex", "Chris"],
  },
  {
    id: 3,
    course: "Augusta National",
    date: "Saturday, Feb 1",
    time: "7:30 AM",
    votes: 1,
    voters: ["Dave"],
  },
];

const VotePlans = () => {
  const { id } = useParams();

  return (
    <PageContainer>
      <Header showBack backTo={`/outing/${id}`} title="Vote on Plans" />

      {/* Instructions */}
      <div className="animate-fade-in rounded-xl border border-border bg-accent/50 p-4">
        <p className="text-sm text-accent-foreground">
          <strong>Vote for your favorite plans!</strong> The option with the most votes wins.
        </p>
      </div>

      {/* Plan Cards */}
      <div className="mt-6 space-y-4">
        {samplePlans.map((plan, index) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            rank={index + 1}
            delay={index * 0.05}
          />
        ))}
      </div>

      {/* Empty State Hint */}
      <div className="mt-8 animate-slide-up text-center" style={{ animationDelay: "0.2s" }}>
        <p className="text-sm text-muted-foreground">
          More plans will appear as participants add their preferences
        </p>
      </div>
    </PageContainer>
  );
};

function PlanCard({
  plan,
  rank,
  delay,
}: {
  plan: typeof samplePlans[0];
  rank: number;
  delay: number;
}) {
  return (
    <div
      className="animate-slide-up rounded-2xl border border-border bg-card p-5 shadow-soft transition-all duration-200 hover:shadow-elevated"
      style={{ animationDelay: `${delay}s` }}
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent font-display text-sm font-bold text-accent-foreground">
            #{rank}
          </div>
          <div>
            <h3 className="font-display font-semibold text-card-foreground">
              {plan.course}
            </h3>
          </div>
        </div>
        <div className="flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-sm font-medium text-primary">
          <ThumbsUp className="h-3.5 w-3.5" />
          {plan.votes}
        </div>
      </div>

      {/* Details */}
      <div className="mt-4 flex flex-wrap gap-3">
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          {plan.date}
        </div>
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          {plan.time}
        </div>
      </div>

      {/* Voters */}
      <div className="mt-4 flex items-center gap-2">
        <Users className="h-4 w-4 text-muted-foreground" />
        <div className="flex -space-x-2">
          {plan.voters.slice(0, 3).map((voter, i) => (
            <div
              key={i}
              className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-card bg-accent text-[10px] font-medium text-accent-foreground"
            >
              {voter[0]}
            </div>
          ))}
        </div>
        <span className="text-xs text-muted-foreground">
          {plan.voters.join(", ")}
        </span>
      </div>

      {/* Vote Button */}
      <Button variant="outline" className="mt-4 w-full">
        <ThumbsUp className="h-4 w-4" />
        Vote for this plan
      </Button>
    </div>
  );
}

export default VotePlans;
