"use client";

import { useState } from "react";
import { useCitiesWithFilters } from "@/hooks/use-cities";
import { CityGrid, CityGridContainer } from "@/components/ui/city-grid";
import { CityCard } from "@/components/city-card";
import { CityGridSkeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, RefreshCw, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface HomepageProps {
  className?: string;
}

export function Homepage({ className }: HomepageProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    search: "",
    featured: false,
    verified: false,
  });

  // Fetch cities with current filters
  const { cities, meta, isLoading, isValidating, error, refresh } =
    useCitiesWithFilters({
      ...filters,
      page: currentPage,
      limit: 20,
      sortBy: "createdAt",
      sortOrder: "desc",
    });

  // Handle search submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters(prev => ({ ...prev, search: searchTerm }));
    setCurrentPage(1);
  };

  // Handle filter changes
  const handleFilterChange = (key: string, value: boolean) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  // Handle load more
  const handleLoadMore = () => {
    if (meta?.hasMore) {
      setCurrentPage(prev => prev + 1);
    }
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm("");
    setFilters({
      search: "",
      featured: false,
      verified: false,
    });
    setCurrentPage(1);
  };

  return (
    <div className={cn("min-h-screen bg-background", className)}>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/10 via-background to-secondary/10">
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

      {/* Filters and Results */}
      <CityGridContainer>
        {/* Filter Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
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
            {/* Quick Filters */}
            <Button
              variant={filters.featured ? "default" : "outline"}
              size="sm"
              onClick={() => handleFilterChange("featured", !filters.featured)}
            >
              <Filter className="h-4 w-4 mr-2" />
              Featured
            </Button>

            <Button
              variant={filters.verified ? "default" : "outline"}
              size="sm"
              onClick={() => handleFilterChange("verified", !filters.verified)}
            >
              Verified
            </Button>

            {/* Clear Filters */}
            {(filters.search || filters.featured || filters.verified) && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Clear All
              </Button>
            )}

            {/* Refresh */}
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
                <h3 className="text-lg font-semibold">Failed to load cities</h3>
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
                    ? `No cities match your search for "${filters.search}"`
                    : "No cities available at the moment"}
                </p>
              </div>
              {(filters.search || filters.featured || filters.verified) && (
                <Button onClick={clearFilters} variant="outline">
                  Clear Filters
                </Button>
              )}
            </div>
          </div>
        )}
      </CityGridContainer>
    </div>
  );
}
