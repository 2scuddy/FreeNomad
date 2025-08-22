import { cn } from "@/lib/utils";

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  );
}

// City card skeleton for loading states
function CityCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-col space-y-3 p-4", className)}>
      {/* Image skeleton */}
      <Skeleton className="h-48 w-full rounded-lg" />

      {/* Content skeleton */}
      <div className="space-y-2">
        {/* City name */}
        <Skeleton className="h-6 w-3/4" />

        {/* Country */}
        <Skeleton className="h-4 w-1/2" />

        {/* Description */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
        </div>

        {/* Stats */}
        <div className="flex justify-between pt-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-16" />
        </div>
      </div>
    </div>
  );
}

// Grid skeleton for multiple cards
function CityGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <CityCardSkeleton key={i} className="border rounded-lg" />
      ))}
    </div>
  );
}

export { Skeleton, CityCardSkeleton, CityGridSkeleton };
