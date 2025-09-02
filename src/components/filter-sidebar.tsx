"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  ChevronDown,
  ChevronUp,
  Filter,
  X,
  RotateCcw,
  DollarSign,
  Wifi,
  Shield,
  MapPin,
  Star,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface FilterState {
  search: string;
  country: string;
  featured: boolean;
  verified: boolean;
  costRange: [number, number];
  internetRange: [number, number];
  safetyRange: [number, number];
  walkabilityRange: [number, number];
  sortBy: string;
  sortOrder: "asc" | "desc";
}

interface FilterSidebarProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  onReset: () => void;
  resultCount?: number;
  isLoading?: boolean;
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

const COUNTRIES = [
  "Portugal",
  "Indonesia",
  "Mexico",
  "Colombia",
  "Georgia",
  "Czech Republic",
  "Argentina",
  "Thailand",
];

const SORT_OPTIONS = [
  { value: "name", label: "Name" },
  { value: "country", label: "Country" },
  { value: "costOfLiving", label: "Cost of Living" },
  { value: "internetSpeed", label: "Internet Speed" },
  { value: "safetyRating", label: "Safety Rating" },
  { value: "walkability", label: "Walkability" },
  { value: "createdAt", label: "Recently Added" },
];

export function FilterSidebar({
  filters,
  onFiltersChange,
  onReset,
  resultCount,
  isLoading,
  className,
}: FilterSidebarProps) {
  const [openSections, setOpenSections] = useState({
    search: true,
    location: true,
    cost: true,
    ratings: true,
    sorting: false,
  });

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const updateFilter = <K extends keyof FilterState>(
    key: K,
    value: FilterState[K]
  ) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const hasActiveFilters = () => {
    return (
      filters.search !== DEFAULT_FILTERS.search ||
      filters.country !== DEFAULT_FILTERS.country ||
      filters.featured !== DEFAULT_FILTERS.featured ||
      filters.verified !== DEFAULT_FILTERS.verified ||
      filters.costRange[0] !== DEFAULT_FILTERS.costRange[0] ||
      filters.costRange[1] !== DEFAULT_FILTERS.costRange[1] ||
      filters.internetRange[0] !== DEFAULT_FILTERS.internetRange[0] ||
      filters.internetRange[1] !== DEFAULT_FILTERS.internetRange[1] ||
      filters.safetyRange[0] !== DEFAULT_FILTERS.safetyRange[0] ||
      filters.safetyRange[1] !== DEFAULT_FILTERS.safetyRange[1] ||
      filters.walkabilityRange[0] !== DEFAULT_FILTERS.walkabilityRange[0] ||
      filters.walkabilityRange[1] !== DEFAULT_FILTERS.walkabilityRange[1]
    );
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.search) count++;
    if (filters.country) count++;
    if (filters.featured) count++;
    if (filters.verified) count++;
    if (
      filters.costRange[0] !== DEFAULT_FILTERS.costRange[0] ||
      filters.costRange[1] !== DEFAULT_FILTERS.costRange[1]
    )
      count++;
    if (
      filters.internetRange[0] !== DEFAULT_FILTERS.internetRange[0] ||
      filters.internetRange[1] !== DEFAULT_FILTERS.internetRange[1]
    )
      count++;
    if (
      filters.safetyRange[0] !== DEFAULT_FILTERS.safetyRange[0] ||
      filters.safetyRange[1] !== DEFAULT_FILTERS.safetyRange[1]
    )
      count++;
    if (
      filters.walkabilityRange[0] !== DEFAULT_FILTERS.walkabilityRange[0] ||
      filters.walkabilityRange[1] !== DEFAULT_FILTERS.walkabilityRange[1]
    )
      count++;
    return count;
  };

  return (
    <div className={cn("w-full max-w-sm space-y-6 relative", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          <h2 className="text-lg font-semibold">Filters</h2>
          {getActiveFilterCount() > 0 && (
            <Badge variant="secondary" className="text-xs">
              {getActiveFilterCount()}
            </Badge>
          )}
        </div>
        {hasActiveFilters() && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="h-4 w-4 mr-1" />
            Reset
          </Button>
        )}
      </div>

      {/* Result Count */}
      {resultCount !== undefined && (
        <div className="text-sm text-muted-foreground">
          {isLoading
            ? "Searching..."
            : `${resultCount} ${resultCount === 1 ? "city" : "cities"} found`}
        </div>
      )}

      {/* Search Section */}
      <Collapsible
        open={openSections.search}
        onOpenChange={() => toggleSection("search")}
      >
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className="w-full justify-between p-2 h-auto hover:bg-muted/50 rounded-md transition-colors"
          >
            <span className="font-medium">Search</span>
            {openSections.search ? (
              <ChevronUp className="h-4 w-4 transition-transform" />
            ) : (
              <ChevronDown className="h-4 w-4 transition-transform" />
            )}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-3 pt-3 overflow-hidden">
          <div className="space-y-2">
            <Label htmlFor="search">City or Country</Label>
            <div className="relative">
              <Input
                id="search"
                placeholder="Search cities..."
                value={filters.search}
                onChange={e => updateFilter("search", e.target.value)}
              />
              {filters.search && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                  onClick={() => updateFilter("search", "")}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      <Separator />

      {/* Location Section */}
      <Collapsible
        open={openSections.location}
        onOpenChange={() => toggleSection("location")}
      >
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className="w-full justify-between p-2 h-auto hover:bg-muted/50 rounded-md transition-colors"
          >
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span className="font-medium">Location & Type</span>
            </div>
            {openSections.location ? (
              <ChevronUp className="h-4 w-4 transition-transform" />
            ) : (
              <ChevronDown className="h-4 w-4 transition-transform" />
            )}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-4 pt-3 overflow-hidden">
          {/* Country Filter */}
          <div className="space-y-2">
            <Label>Country</Label>
            <Select
              value={filters.country}
              onValueChange={(value: string) =>
                updateFilter("country", value === "all" ? "" : value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="All countries" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All countries</SelectItem>
                {COUNTRIES.map(country => (
                  <SelectItem key={country} value={country}>
                    {country}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Quick Filters */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="featured"
                checked={filters.featured}
                onCheckedChange={(checked: boolean) =>
                  updateFilter("featured", !!checked)
                }
              />
              <Label htmlFor="featured" className="text-sm font-normal">
                Featured cities only
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="verified"
                checked={filters.verified}
                onCheckedChange={(checked: boolean) =>
                  updateFilter("verified", !!checked)
                }
              />
              <Label htmlFor="verified" className="text-sm font-normal">
                Verified data only
              </Label>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      <Separator />

      {/* Cost Section */}
      <Collapsible
        open={openSections.cost}
        onOpenChange={() => toggleSection("cost")}
      >
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className="w-full justify-between p-2 h-auto hover:bg-muted/50 rounded-md transition-colors"
          >
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              <span className="font-medium">Cost & Internet</span>
            </div>
            {openSections.cost ? (
              <ChevronUp className="h-4 w-4 transition-transform" />
            ) : (
              <ChevronDown className="h-4 w-4 transition-transform" />
            )}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-4 pt-3 overflow-hidden">
          {/* Cost of Living Range */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Cost of Living (USD/month)</Label>
              <span className="text-sm text-muted-foreground">
                ${filters.costRange[0]} - ${filters.costRange[1]}
              </span>
            </div>
            <Slider
              value={filters.costRange}
              onValueChange={(value: number[]) =>
                updateFilter("costRange", value as [number, number])
              }
              max={5000}
              min={0}
              step={50}
              className="w-full"
            />
          </div>

          {/* Internet Speed Range */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-1">
                <Wifi className="h-3 w-3" />
                Internet Speed (Mbps)
              </Label>
              <span className="text-sm text-muted-foreground">
                {filters.internetRange[0]} - {filters.internetRange[1]}
              </span>
            </div>
            <Slider
              value={filters.internetRange}
              onValueChange={(value: number[]) =>
                updateFilter("internetRange", value as [number, number])
              }
              max={200}
              min={0}
              step={5}
              className="w-full"
            />
          </div>
        </CollapsibleContent>
      </Collapsible>

      <Separator />

      {/* Ratings Section */}
      <Collapsible
        open={openSections.ratings}
        onOpenChange={() => toggleSection("ratings")}
      >
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className="w-full justify-between p-2 h-auto hover:bg-muted/50 rounded-md transition-colors"
          >
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4" />
              <span className="font-medium">Ratings</span>
            </div>
            {openSections.ratings ? (
              <ChevronUp className="h-4 w-4 transition-transform" />
            ) : (
              <ChevronDown className="h-4 w-4 transition-transform" />
            )}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-4 pt-3 overflow-hidden">
          {/* Safety Rating Range */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-1">
                <Shield className="h-3 w-3" />
                Safety Rating
              </Label>
              <span className="text-sm text-muted-foreground">
                {filters.safetyRange[0]} - {filters.safetyRange[1]}
              </span>
            </div>
            <Slider
              value={filters.safetyRange}
              onValueChange={(value: number[]) =>
                updateFilter("safetyRange", value as [number, number])
              }
              max={10}
              min={0}
              step={0.5}
              className="w-full"
            />
          </div>

          {/* Walkability Range */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Walkability</Label>
              <span className="text-sm text-muted-foreground">
                {filters.walkabilityRange[0]} - {filters.walkabilityRange[1]}
              </span>
            </div>
            <Slider
              value={filters.walkabilityRange}
              onValueChange={(value: number[]) =>
                updateFilter("walkabilityRange", value as [number, number])
              }
              max={10}
              min={0}
              step={0.5}
              className="w-full"
            />
          </div>
        </CollapsibleContent>
      </Collapsible>

      <Separator />

      {/* Sorting Section */}
      <Collapsible
        open={openSections.sorting}
        onOpenChange={() => toggleSection("sorting")}
      >
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className="w-full justify-between p-2 h-auto hover:bg-muted/50 rounded-md transition-colors"
          >
            <span className="font-medium">Sort By</span>
            {openSections.sorting ? (
              <ChevronUp className="h-4 w-4 transition-transform" />
            ) : (
              <ChevronDown className="h-4 w-4 transition-transform" />
            )}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-3 pt-3 overflow-hidden">
          <div className="space-y-2">
            <Label>Sort by</Label>
            <Select
              value={filters.sortBy}
              onValueChange={(value: string) => updateFilter("sortBy", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Order</Label>
            <Select
              value={filters.sortOrder}
              onValueChange={(value: string) =>
                updateFilter("sortOrder", value as "asc" | "desc")
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="desc">Descending</SelectItem>
                <SelectItem value="asc">Ascending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
