import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Users, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageContainer } from "@/components/layout/PageContainer";
import { Header } from "@/components/layout/Header";
import { VotePlansSkeleton } from "@/components/LoadingSkeleton";
import { ErrorState } from "@/components/ErrorState";
import { EmptyState } from "@/components/EmptyState";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { PlanCard, type PlanCardData } from "@/components/PlanCard";

interface Vote {
  id: string;
  plan_card_id: string;
  participant_id: string;
  vote: "up" | "down";
}

interface Outing {
  id: string;
  title: string;
}

const VotePlans = () => {
  const { id } = useParams();
  const [outing, setOuting] = useState<Outing | null>(null);
  const [planCards, setPlanCards] = useState<PlanCardData[]>([]);
  const [votes, setVotes] = useState<Vote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const participantId = localStorage.getItem(`participant_${id}`);

  useEffect(() => {
    fetchData();
  }, [id]);

  // Subscribe to real-time vote updates
  useEffect(() => {
    if (planCards.length === 0) return;

    const channel = supabase
      .channel('vote-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'votes',
        },
        () => {
          fetchVotes();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [planCards]);

  const fetchData = async () => {
    if (!id) return;

    try {
      // Fetch outing
      const { data: outingData, error: outingError } = await supabase
        .from("outings")
        .select("id, title")
        .eq("id", id)
        .maybeSingle();

      if (outingError) throw outingError;
      if (!outingData) {
        setError("Outing not found");
        return;
      }
      setOuting(outingData);

      // Fetch plan cards
      const { data: planCardsData, error: planCardsError } = await supabase
        .from("plan_cards")
        .select("*")
        .eq("outing_id", id)
        .order("fit_score", { ascending: false });

      if (planCardsError) throw planCardsError;
      setPlanCards(planCardsData || []);

      if (planCardsData && planCardsData.length > 0) {
        await fetchVotes();
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to load plans");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchVotes = async () => {
    const { data: votesData, error: votesError } = await supabase
      .from("votes")
      .select("*");

    if (!votesError && votesData) {
      setVotes(votesData as Vote[]);
    }
  };

  const handleVote = async (planId: string, vote: "up" | "down") => {
    if (!participantId) {
      toast.error("Please join the outing first to vote", {
        action: {
          label: "Join",
          onClick: () => window.location.href = `/join/${id}`,
        },
      });
      return;
    }

    try {
      const { error } = await supabase
        .from("votes")
        .upsert(
          {
            plan_card_id: planId,
            participant_id: participantId,
            vote,
          },
          { onConflict: "plan_card_id,participant_id" }
        );

      if (error) throw error;
      toast.success("Voted!");
      await fetchVotes();
    } catch (err) {
      console.error("Error voting:", err);
      toast.error("Failed to save vote");
    }
  };

  const getVoteCounts = (planId: string) => {
    const planVotes = votes.filter(v => v.plan_card_id === planId);
    return {
      up: planVotes.filter(v => v.vote === "up").length,
      down: planVotes.filter(v => v.vote === "down").length,
      userVote: planVotes.find(v => v.participant_id === participantId)?.vote || null,
    };
  };

  const handleRetry = () => {
    setError(null);
    setIsLoading(true);
    fetchData();
  };

  if (isLoading) {
    return (
      <PageContainer>
        <Header showBack backTo={`/outing/${id}`} title="Vote on Plans" />
        <VotePlansSkeleton />
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <Header showBack backTo={`/outing/${id}`} title="Vote on Plans" />
        <ErrorState message={error} onRetry={handleRetry} />
      </PageContainer>
    );
  }

  if (planCards.length === 0) {
    return (
      <PageContainer>
        <Header showBack backTo={`/outing/${id}`} title="Vote on Plans" />
        <EmptyState
          icon={ClipboardList}
          title="No plans generated yet"
          description="The organizer hasn't generated any plan options yet. Check back soon!"
          action={{
            label: "View Outing Details",
            onClick: () => window.location.href = `/outing/${id}`,
          }}
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Header showBack backTo={`/outing/${id}`} title="Vote on Plans" />

      {/* Instructions */}
      <div className="animate-fade-in rounded-xl border border-border bg-accent/50 p-4 mb-4">
        <p className="text-sm text-accent-foreground">
          <strong>Vote for your favorite plans!</strong> The option with the most votes wins.
        </p>
      </div>

      {!participantId && (
        <div className="animate-fade-in rounded-xl border border-primary/20 bg-primary/5 p-4 mb-4" style={{ animationDelay: "0.05s" }}>
          <p className="text-sm text-foreground">
            <strong>Want to vote?</strong>{" "}
            <Link to={`/join/${id}`} className="text-primary underline font-medium">
              Join the outing first
            </Link>
          </p>
        </div>
      )}

      {/* Plan Cards */}
      <div className="space-y-4">
        {planCards.map((plan, index) => {
          const { up, down, userVote } = getVoteCounts(plan.id);
          return (
            <div 
              key={plan.id} 
              className="animate-slide-up" 
              style={{ animationDelay: `${0.1 + index * 0.05}s` }}
            >
              <PlanCard
                plan={plan}
                upVotes={up}
                downVotes={down}
                userVote={userVote}
                onVote={handleVote}
              />
            </div>
          );
        })}
      </div>

      <div className="h-8" />
    </PageContainer>
  );
};

export default VotePlans;
