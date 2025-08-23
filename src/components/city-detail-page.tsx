"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  OptimizedImage,
  imageSizes,
  imageQuality,
} from "@/components/ui/optimized-image";
import {
  ArrowLeft,
  MapPin,
  DollarSign,
  Wifi,
  Shield,
  Star,
  Users,
  Thermometer,
  Coffee,
  Moon,
  Heart,
  Share2,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CityDetailPageProps {
  city: {
    id: string;
    name: string;
    country: string;
    region?: string;
    latitude: number;
    longitude: number;
    population?: number;
    timezone?: string;
    costOfLiving?: number;
    internetSpeed?: number;
    safetyRating?: number;
    walkability?: number;
    nightlife?: number;
    culture?: number;
    weather?: number;
    description?: string;
    shortDescription?: string;
    imageUrl?: string;
    imageAttribution?: string;
    featured?: boolean;
    verified?: boolean;
    averageRating?: number;
    reviewCount?: number;
    ratingDistribution?: {
      1: number;
      2: number;
      3: number;
      4: number;
      5: number;
    };
    reviews?: Array<{
      id: string;
      rating: number;
      title: string;
      content: string;
      internetRating?: number;
      costRating?: number;
      safetyRating?: number;
      funRating?: number;
      helpful: number;
      verified: boolean;
      createdAt: string;
      user: {
        id: string;
        name?: string;
        image?: string;
      };
    }>;
    createdAt: string;
    updatedAt: string;
  };
}

export function CityDetailPage({ city }: CityDetailPageProps) {
  const [imageError, setImageError] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  const formatCost = (cost?: number) => {
    if (!cost) return "N/A";
    return `$${cost.toLocaleString()}/mo`;
  };

  const formatRating = (rating?: number) => {
    if (!rating) return "N/A";
    return rating.toFixed(1);
  };

  const formatPopulation = (pop?: number) => {
    if (!pop) return "N/A";
    if (pop >= 1000000) return `${(pop / 1000000).toFixed(1)}M`;
    if (pop >= 1000) return `${(pop / 1000).toFixed(0)}K`;
    return pop.toLocaleString();
  };

  const getRatingColor = (rating?: number) => {
    if (!rating) return "text-muted-foreground";
    if (rating >= 8) return "text-green-600";
    if (rating >= 6) return "text-yellow-600";
    return "text-red-600";
  };

  const getRatingLabel = (rating?: number) => {
    if (!rating) return "No data";
    if (rating >= 9) return "Excellent";
    if (rating >= 8) return "Very Good";
    if (rating >= 7) return "Good";
    if (rating >= 6) return "Fair";
    if (rating >= 5) return "Average";
    return "Below Average";
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Cities
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              {city.featured && <Badge variant="default">Featured</Badge>}
              {city.verified && <Badge variant="secondary">Verified</Badge>}
            </div>
            <div className="ml-auto flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Heart className="h-4 w-4 mr-2" />
                Save
              </Button>
              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative">
        {/* Hero Image */}
        <div className="relative h-64 md:h-96 overflow-hidden">
          {city.imageUrl && !imageError ? (
            <OptimizedImage
              src={city.imageUrl}
              alt={`${city.name}, ${city.country}`}
              fill
              className="object-cover"
              sizes={imageSizes.cityHero}
              quality={imageQuality.high}
              priority
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
              <MapPin className="h-24 w-24 text-muted-foreground" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

          {/* Image Attribution */}
          {city.imageAttribution && !imageError && (
            <div className="absolute bottom-2 right-2 text-xs text-white/80 bg-black/20 px-2 py-1 rounded">
              {city.imageAttribution}
            </div>
          )}
        </div>

        {/* City Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <div className="container mx-auto">
            <div className="flex items-end justify-between">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold mb-2">
                  {city.name}
                </h1>
                <div className="flex items-center gap-2 text-lg">
                  <MapPin className="h-5 w-5" />
                  <span>
                    {city.region
                      ? `${city.region}, ${city.country}`
                      : city.country}
                  </span>
                </div>
                {city.shortDescription && (
                  <p className="mt-2 text-lg text-white/90 max-w-2xl">
                    {city.shortDescription}
                  </p>
                )}
              </div>

              {/* Rating Summary */}
              {city.averageRating && (
                <div className="text-right">
                  <div className="flex items-center gap-2 mb-1">
                    <Star className="h-6 w-6 fill-yellow-400 text-yellow-400" />
                    <span className="text-2xl font-bold">
                      {formatRating(city.averageRating)}
                    </span>
                  </div>
                  <div className="text-sm text-white/80">
                    {city.reviewCount}{" "}
                    {city.reviewCount === 1 ? "review" : "reviews"}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="stats">Statistics</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
            <TabsTrigger value="location">Location</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <DollarSign className="h-8 w-8 mx-auto mb-2 text-green-600" />
                  <div className="text-2xl font-bold">
                    {formatCost(city.costOfLiving)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Cost of Living
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 text-center">
                  <Wifi className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                  <div className="text-2xl font-bold">
                    {city.internetSpeed ? `${city.internetSpeed} Mbps` : "N/A"}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Internet Speed
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 text-center">
                  <Shield className="h-8 w-8 mx-auto mb-2 text-emerald-600" />
                  <div
                    className={cn(
                      "text-2xl font-bold",
                      getRatingColor(city.safetyRating)
                    )}
                  >
                    {formatRating(city.safetyRating)}/10
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Safety Rating
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 text-center">
                  <Users className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                  <div className="text-2xl font-bold">
                    {formatPopulation(city.population)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Population
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Description */}
            {city.description && (
              <Card>
                <CardHeader>
                  <CardTitle>About {city.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    {city.description}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Lifestyle Ratings */}
            <Card>
              <CardHeader>
                <CardTitle>Lifestyle Ratings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Coffee className="h-5 w-5 text-amber-600" />
                      <span>Walkability</span>
                    </div>
                    <div
                      className={cn(
                        "font-semibold",
                        getRatingColor(city.walkability)
                      )}
                    >
                      {formatRating(city.walkability)}/10
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Moon className="h-5 w-5 text-indigo-600" />
                      <span>Nightlife</span>
                    </div>
                    <div
                      className={cn(
                        "font-semibold",
                        getRatingColor(city.nightlife)
                      )}
                    >
                      {formatRating(city.nightlife)}/10
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Heart className="h-5 w-5 text-pink-600" />
                      <span>Culture</span>
                    </div>
                    <div
                      className={cn(
                        "font-semibold",
                        getRatingColor(city.culture)
                      )}
                    >
                      {formatRating(city.culture)}/10
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Thermometer className="h-5 w-5 text-orange-600" />
                      <span>Weather</span>
                    </div>
                    <div
                      className={cn(
                        "font-semibold",
                        getRatingColor(city.weather)
                      )}
                    >
                      {formatRating(city.weather)}/10
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Statistics Tab */}
          <TabsContent value="stats" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Detailed Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Basic Information</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Population:
                        </span>
                        <span>{formatPopulation(city.population)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Timezone:</span>
                        <span>{city.timezone || "N/A"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Coordinates:
                        </span>
                        <span>
                          {city.latitude.toFixed(4)},{" "}
                          {city.longitude.toFixed(4)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Nomad Metrics</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Cost of Living:
                        </span>
                        <span>{formatCost(city.costOfLiving)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Internet Speed:
                        </span>
                        <span>
                          {city.internetSpeed
                            ? `${city.internetSpeed} Mbps`
                            : "N/A"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Safety Rating:
                        </span>
                        <span className={getRatingColor(city.safetyRating)}>
                          {formatRating(city.safetyRating)}/10 (
                          {getRatingLabel(city.safetyRating)})
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reviews Tab */}
          <TabsContent value="reviews" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>User Reviews</CardTitle>
              </CardHeader>
              <CardContent>
                {city.reviews && city.reviews.length > 0 ? (
                  <div className="space-y-6">
                    {city.reviews.map(review => (
                      <div
                        key={review.id}
                        className="border-b pb-6 last:border-b-0"
                      >
                        <div className="flex items-start gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={cn(
                                      "h-4 w-4",
                                      i < review.rating
                                        ? "fill-yellow-400 text-yellow-400"
                                        : "text-muted-foreground"
                                    )}
                                  />
                                ))}
                              </div>
                              <span className="font-semibold">
                                {review.title}
                              </span>
                              {review.verified && (
                                <Badge variant="secondary" className="text-xs">
                                  Verified
                                </Badge>
                              )}
                            </div>
                            <p className="text-muted-foreground mb-3">
                              {review.content}
                            </p>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span>By {review.user.name || "Anonymous"}</span>
                              <span>•</span>
                              <span>
                                {new Date(
                                  review.createdAt
                                ).toLocaleDateString()}
                              </span>
                              <span>•</span>
                              <span>{review.helpful} helpful</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Star className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                    <p>No reviews yet. Be the first to review {city.name}!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Location Tab */}
          <TabsContent value="location" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Location & Map</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-semibold mb-2">Address</h3>
                      <p className="text-muted-foreground">
                        {city.name}
                        <br />
                        {city.region && `${city.region}, `}
                        {city.country}
                      </p>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">Coordinates</h3>
                      <p className="text-muted-foreground">
                        Latitude: {city.latitude.toFixed(6)}
                        <br />
                        Longitude: {city.longitude.toFixed(6)}
                      </p>
                    </div>
                  </div>

                  {/* Map Placeholder */}
                  <div className="h-64 bg-muted rounded-lg flex items-center justify-center">
                    <div className="text-center text-muted-foreground">
                      <MapPin className="h-12 w-12 mx-auto mb-2" />
                      <p>Interactive map will be implemented here</p>
                      <Button variant="outline" size="sm" className="mt-2">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View on Google Maps
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
