import { useParams, Link } from "react-router-dom";
import { Copy, Users, Calendar, MapPin, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageContainer } from "@/components/layout/PageContainer";
import { Header } from "@/components/layout/Header";
import { toast } from "sonner";

const OutingDetails = () => {
  const { id } = useParams();

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/join/${id}`);
    toast.success("Link copied to clipboard!");
  };

  return (
    <PageContainer>
      <Header showBack title="Outing Details" />

      {/* Outing Header */}
      <div className="animate-fade-in rounded-2xl border border-border bg-card p-6 shadow-soft">
        <div className="flex items-center justify-between">
          <div>
            <span className="inline-flex items-center rounded-full bg-accent px-2.5 py-0.5 text-xs font-medium text-accent-foreground">
              Collecting responses
            </span>
            <h1 className="mt-2 font-display text-2xl font-bold text-card-foreground">
              Weekend Golf Trip
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Outing ID: {id}
            </p>
          </div>
        </div>

        {/* Share Link */}
        <div className="mt-6 flex items-center gap-2 rounded-lg bg-muted p-3">
          <div className="flex-1 truncate text-sm text-muted-foreground">
            {window.location.origin}/join/{id}
          </div>
          <Button variant="ghost" size="icon" onClick={handleCopyLink}>
            <Copy className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-6 grid grid-cols-3 gap-3 animate-slide-up" style={{ animationDelay: "0.1s" }}>
        <StatCard icon={<Users className="h-4 w-4" />} value="0" label="Joined" />
        <StatCard icon={<Calendar className="h-4 w-4" />} value="0" label="Dates" />
        <StatCard icon={<MapPin className="h-4 w-4" />} value="0" label="Courses" />
      </div>

      {/* Participants Section */}
      <div className="mt-6 animate-slide-up" style={{ animationDelay: "0.15s" }}>
        <h2 className="font-display text-lg font-semibold text-foreground">
          Participants
        </h2>
        <div className="mt-3 rounded-xl border border-dashed border-border bg-muted/50 p-8 text-center">
          <Users className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-2 text-sm text-muted-foreground">
            No one has joined yet
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Share the link above to invite friends
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-8 space-y-3 animate-slide-up" style={{ animationDelay: "0.2s" }}>
        <Button variant="hero" size="lg" className="w-full" onClick={handleCopyLink}>
          <Share2 className="h-5 w-5" />
          Share Invite Link
        </Button>
        <Button variant="outline" size="lg" className="w-full" asChild>
          <Link to={`/vote/${id}`}>View Voting Results</Link>
        </Button>
      </div>
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
    <div className="rounded-xl border border-border bg-card p-4 text-center shadow-soft">
      <div className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-primary">
        {icon}
      </div>
      <div className="font-display text-2xl font-bold text-card-foreground">
        {value}
      </div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}

export default OutingDetails;
