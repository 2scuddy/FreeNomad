"use client";

import Link from "next/link";
import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  OptimizedImage,
  imageSizes,
  imageQuality,
} from "@/components/ui/optimized-image";
import { useCityImage } from "@/hooks/use-city-image";
import { MapPin, Wifi, Shield, DollarSign, Star } from "lucide-react";

// Utility functions
const formatCost = (cost?: number) => {
  if (!cost) return "N/A";
  return `$${cost.toLocaleString()}/mo`;
};

const formatSpeed = (speed?: number) => {
  if (!speed) return "N/A";
  return `${speed} Mbps`;
};

const formatRating = (rating?: number) => {
  if (!rating) return "N/A";
  return rating.toFixed(1);
};

const formatReviewCount = (count?: number) => {
  if (!count) return "No reviews";
  return `${count} review${count !== 1 ? "s" : ""}`;
};

interface CityCardProps {
  city: {
    id: string;
    name: string;
    country: string;
    region?: string;
    imageUrl?: string;
    imageAttribution?: string;
    shortDescription?: string;
    costOfLiving?: number;
    internetSpeed?: number;
    safetyRating?: number;
    averageRating?: number;
    reviewCount?: number;
    featured?: boolean;
  };
  className?: string;
}

export function CityCard({ city, className }: CityCardProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  // Fetch Unsplash image with fallback to existing imageUrl
  const {
    imageUrl: unsplashImageUrl,
    imageAttribution: unsplashAttribution,
    isLoading: unsplashLoading,
    error: unsplashError,
  } = useCityImage(city.name, city.country, {
    enabled: !city.imageUrl, // Only fetch if no existing image
    priority: city.featured,
  });

  // Determine which image to use
  const finalImageUrl = city.imageUrl || unsplashImageUrl;
  const finalAttribution = city.imageAttribution || unsplashAttribution;

  return (
    <Link href={`/cities/${city.id}`} className="group block">
      <div
        className={cn(
          // Base card styling
          "relative overflow-hidden rounded-lg border bg-card text-card-foreground shadow-sm",
          // Hover effects
          "transition-all duration-300 ease-in-out",
          "group-hover:shadow-lg group-hover:scale-[1.02]",
          "group-hover:border-primary/20",
          // Focus states
          "focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
          className
        )}
      >
        {/* Featured badge */}
        {city.featured && (
          <div className="absolute top-3 left-3 z-10">
            <span className="inline-flex items-center rounded-full bg-primary px-2.5 py-0.5 text-xs font-medium text-primary-foreground">
              Featured
            </span>
          </div>
        )}

        {/* Image section */}
        <div className="relative aspect-[4/3] overflow-hidden">
          {finalImageUrl && !imageError ? (
            <>
              {(imageLoading || unsplashLoading) && (
                <div className="absolute inset-0 bg-muted animate-pulse" />
              )}
              <OptimizedImage
                src={finalImageUrl}
                alt={`${city.name}, ${city.country}`}
                fill
                className={cn(
                  "object-cover transition-all duration-300",
                  "group-hover:scale-105",
                  imageLoading || unsplashLoading ? "opacity-0" : "opacity-100"
                )}
                sizes={imageSizes.cityCard}
                quality={imageQuality.high}
                onLoad={() => setImageLoading(false)}
                onError={() => {
                  setImageError(true);
                  setImageLoading(false);
                }}
                priority={city.featured}
              />
              {/* Image attribution for Unsplash images */}
              {finalAttribution && (
                <div className="absolute bottom-1 right-1 bg-black/50 text-white text-xs px-1 py-0.5 rounded opacity-70 hover:opacity-100 transition-opacity">
                  {finalAttribution}
                </div>
              )}
            </>
          ) : (
            // Fallback gradient background
            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
              <MapPin className="h-12 w-12 text-muted-foreground" />
              {unsplashError && (
                <div className="absolute bottom-2 left-2 text-xs text-muted-foreground bg-background/80 px-2 py-1 rounded">
                  Image unavailable
                </div>
              )}
            </div>
          )}

          {/* Gradient overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        </div>

        {/* Content section */}
        <div className="p-4 space-y-3">
          {/* City name and location */}
          <div className="space-y-1">
            <h3 className="font-semibold text-lg leading-tight group-hover:text-primary transition-colors">
              {city.name}
            </h3>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {city.region ? `${city.region}, ${city.country}` : city.country}
            </p>
          </div>

          {/* Description */}
          {city.shortDescription && (
            <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
              {city.shortDescription}
            </p>
          )}

          {/* Rating and reviews */}
          {(city.averageRating || city.reviewCount) && (
            <div className="flex items-center gap-2 text-sm">
              {city.averageRating && (
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">
                    {formatRating(city.averageRating)}
                  </span>
                </div>
              )}
              <span className="text-muted-foreground">
                {formatReviewCount(city.reviewCount)}
              </span>
            </div>
          )}

          {/* Key statistics */}
          <div className="grid grid-cols-3 gap-2 pt-2 border-t">
            {/* Cost of living */}
            <div className="text-center">
              <div className="flex items-center justify-center mb-1">
                <DollarSign className="h-4 w-4 text-green-600" />
              </div>
              <div className="text-xs font-medium">
                {formatCost(city.costOfLiving)}
              </div>
              <div className="text-xs text-muted-foreground">Cost</div>
            </div>

            {/* Internet speed */}
            <div className="text-center">
              <div className="flex items-center justify-center mb-1">
                <Wifi className="h-4 w-4 text-blue-600" />
              </div>
              <div className="text-xs font-medium">
                {formatSpeed(city.internetSpeed)}
              </div>
              <div className="text-xs text-muted-foreground">Internet</div>
            </div>

            {/* Safety rating */}
            <div className="text-center">
              <div className="flex items-center justify-center mb-1">
                <Shield className="h-4 w-4 text-emerald-600" />
              </div>
              <div className="text-xs font-medium">
                {city.safetyRating
                  ? `${formatRating(city.safetyRating)}/10`
                  : "N/A"}
              </div>
              <div className="text-xs text-muted-foreground">Safety</div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

// Compact version for smaller spaces
export function CityCardCompact({ city, className }: CityCardProps) {
  const [imageError, setImageError] = useState(false);

  return (
    <Link href={`/cities/${city.id}`} className="group block">
      <div
        className={cn(
          "flex items-center gap-3 p-3 rounded-lg border bg-card",
          "transition-all duration-200 group-hover:shadow-md group-hover:border-primary/20",
          className
        )}
      >
        {/* Small image */}
        <div className="relative w-16 h-16 rounded-md overflow-hidden flex-shrink-0">
          {city.imageUrl && !imageError ? (
            <OptimizedImage
              src={city.imageUrl}
              alt={`${city.name}, ${city.country}`}
              fill
              className="object-cover"
              sizes="64px"
              quality={imageQuality.medium}
              priority={false}
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
              <MapPin className="h-6 w-6 text-muted-foreground" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm group-hover:text-primary transition-colors truncate">
            {city.name}
          </h4>
          <p className="text-xs text-muted-foreground truncate">
            {city.country}
          </p>
          {city.averageRating && (
            <div className="flex items-center gap-1 mt-1">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              <span className="text-xs font-medium">
                {formatRating(city.averageRating)}
              </span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
