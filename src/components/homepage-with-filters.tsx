"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCitiesWithFilters } from "@/hooks/use-cities";
import { CityGrid, CityGridContainer } from "@/components/ui/city-grid";
import { CityCard } from "@/components/city-card";
import { CityGridSkeleton } from "@/components/ui/skeleton";
import { FilterSidebar, FilterState } from "@/components/filter-sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Layout } from "@/components/layout";
import {
  Search,
  RefreshCw,
  AlertCircle,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface HomepageWithFiltersProps {
  className?: string;
}

const DEFAULT_FILTERS: FilterState = {
  search: "",
  country: "",
  featured: false,
  verified: false,
  costRange: [0, 5000],
  internetRange: [0, 200],
  safetyRange: [0, 10],
  walkabilityRange: [0, 10],
  sortBy: "createdAt",
  sortOrder: "desc",
};

export function HomepageWithFilters({ className }: HomepageWithFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);

  // Initialize filters from URL on mount
  useEffect(() => {
    const urlFilters: FilterState = {
      search: searchParams.get("search") || "",
      country: searchParams.get("country") || "",
      featured: searchParams.get("featured") === "true",
      verified: searchParams.get("verified") === "true",
      costRange: [
        parseInt(searchParams.get("minCost") || "0"),
        parseInt(searchParams.get("maxCost") || "5000"),
      ],
      internetRange: [
        parseInt(searchParams.get("minInternet") || "0"),
        parseInt(searchParams.get("maxInternet") || "200"),
      ],
      safetyRange: [
        parseFloat(searchParams.get("minSafety") || "0"),
        parseFloat(searchParams.get("maxSafety") || "10"),
      ],
      walkabilityRange: [
        parseFloat(searchParams.get("minWalkability") || "0"),
        parseFloat(searchParams.get("maxWalkability") || "10"),
      ],
      sortBy: searchParams.get("sortBy") || "createdAt",
      sortOrder: (searchParams.get("sortOrder") as "asc" | "desc") || "desc",
    };

    setFilters(urlFilters);
    setSearchTerm(urlFilters.search);
  }, [searchParams]);

  // Update URL when filters change
  const updateURL = useCallback(
    (newFilters: FilterState) => {
      const params = new URLSearchParams();

      if (newFilters.search) params.set("search", newFilters.search);
      if (newFilters.country) params.set("country", newFilters.country);
      if (newFilters.featured) params.set("featured", "true");
      if (newFilters.verified) params.set("verified", "true");

      if (newFilters.costRange[0] !== DEFAULT_FILTERS.costRange[0]) {
        params.set("minCost", newFilters.costRange[0].toString());
      }
      if (newFilters.costRange[1] !== DEFAULT_FILTERS.costRange[1]) {
        params.set("maxCost", newFilters.costRange[1].toString());
      }

      if (newFilters.internetRange[0] !== DEFAULT_FILTERS.internetRange[0]) {
        params.set("minInternet", newFilters.internetRange[0].toString());
      }
      if (newFilters.internetRange[1] !== DEFAULT_FILTERS.internetRange[1]) {
        params.set("maxInternet", newFilters.internetRange[1].toString());
      }

      if (newFilters.safetyRange[0] !== DEFAULT_FILTERS.safetyRange[0]) {
        params.set("minSafety", newFilters.safetyRange[0].toString());
      }
      if (newFilters.safetyRange[1] !== DEFAULT_FILTERS.safetyRange[1]) {
        params.set("maxSafety", newFilters.safetyRange[1].toString());
      }

      if (
        newFilters.walkabilityRange[0] !== DEFAULT_FILTERS.walkabilityRange[0]
      ) {
        params.set("minWalkability", newFilters.walkabilityRange[0].toString());
      }
      if (
        newFilters.walkabilityRange[1] !== DEFAULT_FILTERS.walkabilityRange[1]
      ) {
        params.set("maxWalkability", newFilters.walkabilityRange[1].toString());
      }

      if (newFilters.sortBy !== DEFAULT_FILTERS.sortBy) {
        params.set("sortBy", newFilters.sortBy);
      }
      if (newFilters.sortOrder !== DEFAULT_FILTERS.sortOrder) {
        params.set("sortOrder", newFilters.sortOrder);
      }

      const queryString = params.toString();
      const newURL = queryString ? `/?${queryString}` : "/";

      router.push(newURL, { scroll: false });
    },
    [router]
  );

  // Fetch cities with current filters
  const { cities, meta, isLoading, isValidating, error, refresh } =
    useCitiesWithFilters({
      search: filters.search,
      country: filters.country,
      featured: filters.featured,
      verified: filters.verified,
      minCost: filters.costRange[0],
      maxCost: filters.costRange[1],
      minInternet: filters.internetRange[0],
      minSafety: filters.safetyRange[0],
      page: currentPage,
      limit: 20,
      sortBy: filters.sortBy,
      sortOrder: filters.sortOrder,
    });

  // Handle search submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const newFilters = { ...filters, search: searchTerm };
    setFilters(newFilters);
    updateURL(newFilters);
    setCurrentPage(1);
  };

  // Handle filter changes
  const handleFiltersChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    updateURL(newFilters);
    setCurrentPage(1);
    setMobileFiltersOpen(false); // Close mobile filters on change
  };

  // Handle filter reset
  const handleReset = () => {
    setFilters(DEFAULT_FILTERS);
    setSearchTerm("");
    updateURL(DEFAULT_FILTERS);
    setCurrentPage(1);
    setMobileFiltersOpen(false);
  };

  // Handle load more
  const handleLoadMore = () => {
    if (meta?.hasMore) {
      setCurrentPage(prev => prev + 1);
    }
  };

  return (
    <Layout className={cn("bg-background", className)}>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/10 via-background to-secondary/10 relative">
        <CityGridContainer>
          <div className="text-center space-y-6 py-12 lg:py-20">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
              Discover Your Next
              <span className="text-primary block">
                Digital Nomad Destination
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Find the perfect city for remote work with real data on cost of
              living, internet speed, safety, and reviews from fellow nomads.
            </p>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search cities, countries, or regions..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-3 text-lg h-12"
                />
                <Button
                  type="submit"
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2"
                >
                  Search
                </Button>
              </div>
            </form>
          </div>
        </CityGridContainer>
      </section>

      {/* Main Content */}
      <CityGridContainer>
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-80 flex-shrink-0">
            <div className="sticky top-6">
              <FilterSidebar
                filters={filters}
                onFiltersChange={handleFiltersChange}
                onReset={handleReset}
                resultCount={meta?.total}
                isLoading={isLoading}
              />
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 min-w-0">
            {/* Mobile Filter Button & Results Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-4">
                <h2 className="text-2xl font-semibold">
                  {filters.search
                    ? `Search results for "${filters.search}"`
                    : "All Cities"}
                </h2>
                {meta && (
                  <span className="text-muted-foreground">
                    {meta.total} {meta.total === 1 ? "city" : "cities"}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {/* Mobile Filter Button */}
                <Sheet
                  open={mobileFiltersOpen}
                  onOpenChange={setMobileFiltersOpen}
                >
                  <SheetTrigger asChild>
                    <Button variant="outline" size="sm" className="lg:hidden">
                      <SlidersHorizontal className="h-4 w-4 mr-2" />
                      Filters
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-80 p-0">
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold">Filters</h3>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setMobileFiltersOpen(false)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <FilterSidebar
                        filters={filters}
                        onFiltersChange={handleFiltersChange}
                        onReset={handleReset}
                        resultCount={meta?.total}
                        isLoading={isLoading}
                      />
                    </div>
                  </SheetContent>
                </Sheet>

                {/* Refresh Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => refresh()}
                  disabled={isValidating}
                >
                  <RefreshCw
                    className={cn("h-4 w-4", isValidating && "animate-spin")}
                  />
                </Button>
              </div>
            </div>

            {/* Error State */}
            {error && (
              <div className="flex items-center justify-center py-12">
                <div className="text-center space-y-4">
                  <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
                  <div>
                    <h3 className="text-lg font-semibold">
                      Failed to load cities
                    </h3>
                    <p className="text-muted-foreground">{error}</p>
                  </div>
                  <Button onClick={() => refresh()} variant="outline">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Try Again
                  </Button>
                </div>
              </div>
            )}

            {/* Loading State */}
            {isLoading && !cities.length && <CityGridSkeleton count={12} />}

            {/* Cities Grid */}
            {!error && cities.length > 0 && (
              <>
                <CityGrid>
                  {cities.map(city => (
                    <CityCard key={city.id} city={city} />
                  ))}
                </CityGrid>

                {/* Load More */}
                {meta?.hasMore && (
                  <div className="flex justify-center mt-12">
                    <Button
                      onClick={handleLoadMore}
                      disabled={isValidating}
                      size="lg"
                    >
                      {isValidating ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Loading...
                        </>
                      ) : (
                        "Load More Cities"
                      )}
                    </Button>
                  </div>
                )}
              </>
            )}

            {/* No Results */}
            {!error && !isLoading && cities.length === 0 && (
              <div className="text-center py-12">
                <div className="space-y-4">
                  <Search className="h-12 w-12 text-muted-foreground mx-auto" />
                  <div>
                    <h3 className="text-lg font-semibold">No cities found</h3>
                    <p className="text-muted-foreground">
                      {filters.search
                        ? `No cities match your current filters`
                        : "No cities available at the moment"}
                    </p>
                  </div>
                  <Button onClick={handleReset} variant="outline">
                    Clear All Filters
                  </Button>
                </div>
              </div>
            )}
          </main>
        </div>
      </CityGridContainer>
    </Layout>
  );
}
