import { Skeleton } from "@/components/ui/skeleton";

export function OutingDetailsSkeleton() {
  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header card skeleton */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
        <Skeleton className="h-5 w-24 mb-3" />
        <Skeleton className="h-7 w-48 mb-2" />
        <Skeleton className="h-4 w-32" />
        <div className="mt-4 rounded-lg bg-muted p-3">
          <Skeleton className="h-4 w-full" />
        </div>
      </div>

      {/* Stats skeleton */}
      <div className="grid grid-cols-3 gap-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-xl border border-border bg-card p-3 text-center">
            <Skeleton className="mx-auto h-7 w-7 rounded-lg mb-1.5" />
            <Skeleton className="mx-auto h-6 w-8 mb-1" />
            <Skeleton className="mx-auto h-3 w-12" />
          </div>
        ))}
      </div>

      {/* Participants skeleton */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
        <Skeleton className="h-5 w-24 mb-3" />
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between rounded-xl bg-muted p-3">
              <div className="flex items-center gap-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function JoinOutingSkeleton() {
  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header skeleton */}
      <div className="flex items-center justify-center py-4">
        <Skeleton className="h-9 w-9 rounded-xl mr-2" />
        <Skeleton className="h-5 w-24" />
      </div>

      {/* Invite card skeleton */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
        <div className="text-center">
          <Skeleton className="mx-auto h-6 w-24 rounded-full mb-3" />
          <Skeleton className="mx-auto h-7 w-48 mb-2" />
          <Skeleton className="mx-auto h-4 w-32" />
        </div>
      </div>

      {/* Name input skeleton */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
        <Skeleton className="h-4 w-24 mb-2" />
        <Skeleton className="h-12 w-full" />
      </div>

      {/* Availability skeleton */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
        <Skeleton className="h-4 w-32 mb-4" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-16">
                <Skeleton className="h-3 w-8 mb-1" />
                <Skeleton className="h-4 w-12" />
              </div>
              <div className="flex flex-1 gap-1.5">
                {[1, 2, 3, 4].map((j) => (
                  <Skeleton key={j} className="flex-1 h-9 rounded-lg" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function VotePlansSkeleton() {
  return (
    <div className="space-y-4 animate-fade-in">
      {/* Instructions skeleton */}
      <div className="rounded-xl border border-border bg-muted/50 p-4">
        <Skeleton className="h-4 w-3/4" />
      </div>

      {/* Plan cards skeleton */}
      {[1, 2].map((i) => (
        <div key={i} className="rounded-2xl border border-border bg-card p-5 shadow-soft">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <Skeleton className="h-6 w-40 mb-2" />
              <Skeleton className="h-4 w-32" />
            </div>
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
          <div className="mt-4 space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
          <div className="mt-4 space-y-1.5">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
          <div className="mt-5 flex items-center gap-3">
            <Skeleton className="flex-1 h-9 rounded-md" />
            <Skeleton className="flex-1 h-9 rounded-md" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function FormSkeleton() {
  return (
    <div className="animate-fade-in">
      <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
        <div className="text-center mb-6">
          <Skeleton className="mx-auto h-8 w-48 mb-2" />
          <Skeleton className="mx-auto h-4 w-64" />
        </div>
        <div className="space-y-5">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-12 w-full" />
            </div>
          ))}
        </div>
        <Skeleton className="h-12 w-full mt-8 rounded-lg" />
      </div>
    </div>
  );
}
