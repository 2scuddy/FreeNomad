import { Suspense } from "react";
import { HomepageWithFilters } from "@/components/homepage-with-filters";
import { CityGridSkeleton } from "@/components/ui/skeleton";

export default function Home() {
  return (
    <Suspense fallback={<CityGridSkeleton />}>
      <HomepageWithFilters />
    </Suspense>
  );
}
