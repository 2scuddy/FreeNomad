import { Metadata } from "next";
import Link from "next/link";
import { Star, MapPin, Wifi, DollarSign, Shield } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Featured Destinations | FreeNomad",
  description:
    "Discover our hand-picked featured destinations perfect for digital nomads. Top-rated cities with excellent infrastructure and nomad communities.",
};

// Mock data for featured destinations
const featuredDestinations = [
  {
    id: "1",
    name: "Lisbon",
    country: "Portugal",
    image:
      "https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=800&h=600&fit=crop",
    rating: 4.8,
    costOfLiving: 1200,
    internetSpeed: 85.5,
    safetyRating: 8.5,
    description:
      "Historic coastal capital with great nomad infrastructure and vibrant culture.",
    highlights: [
      "Excellent coworking spaces",
      "Great weather",
      "Strong nomad community",
      "Affordable living",
    ],
  },
  {
    id: "2",
    name: "Bali",
    country: "Indonesia",
    image:
      "https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?w=800&h=600&fit=crop",
    rating: 4.7,
    costOfLiving: 800,
    internetSpeed: 45.2,
    safetyRating: 7.5,
    description:
      "Tropical paradise with strong nomad community and beautiful beaches.",
    highlights: [
      "Beautiful beaches",
      "Low cost of living",
      "Rich culture",
      "Yoga and wellness",
    ],
  },
  {
    id: "3",
    name: "Mexico City",
    country: "Mexico",
    image:
      "https://images.unsplash.com/photo-1518105779142-d975f22f1b0a?w=800&h=600&fit=crop",
    rating: 4.6,
    costOfLiving: 900,
    internetSpeed: 65.8,
    safetyRating: 6.5,
    description: "Vibrant metropolis with rich culture and great food scene.",
    highlights: [
      "Amazing food scene",
      "Rich history",
      "Affordable",
      "Great nightlife",
    ],
  },
  {
    id: "4",
    name: "Medellín",
    country: "Colombia",
    image:
      "https://images.unsplash.com/photo-1561731216-c3a4d99437d5?w=800&h=600&fit=crop",
    rating: 4.9,
    costOfLiving: 700,
    internetSpeed: 55.3,
    safetyRating: 7.0,
    description: "City of eternal spring with perfect climate year-round.",
    highlights: [
      "Perfect weather",
      "Modern infrastructure",
      "Friendly locals",
      "Growing tech scene",
    ],
  },
];

export default function FeaturedPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Featured Destinations</h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Discover our hand-picked destinations that offer the perfect
          combination of infrastructure, community, and lifestyle for digital
          nomads. These cities have been carefully selected based on nomad
          reviews, internet quality, cost of living, and overall experience.
        </p>
      </div>

      {/* Featured Cities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        {featuredDestinations.map(city => (
          <Card
            key={city.id}
            className="overflow-hidden hover:shadow-lg transition-shadow"
          >
            <div className="relative">
              <img
                src={city.image}
                alt={`${city.name}, ${city.country}`}
                className="w-full h-48 object-cover"
              />
              <Badge className="absolute top-4 left-4 bg-primary">
                <Star className="h-3 w-3 mr-1" />
                Featured
              </Badge>
            </div>

            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl">{city.name}</CardTitle>
                  <CardDescription className="flex items-center mt-1">
                    <MapPin className="h-4 w-4 mr-1" />
                    {city.country}
                  </CardDescription>
                </div>
                <div className="flex items-center">
                  <Star className="h-4 w-4 text-yellow-500 mr-1" />
                  <span className="font-semibold">{city.rating}</span>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <p className="text-muted-foreground mb-4">{city.description}</p>

              {/* Key Metrics */}
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <DollarSign className="h-5 w-5 mx-auto mb-1 text-green-600" />
                  <div className="text-sm font-semibold">
                    ${city.costOfLiving}
                  </div>
                  <div className="text-xs text-muted-foreground">per month</div>
                </div>
                <div className="text-center">
                  <Wifi className="h-5 w-5 mx-auto mb-1 text-blue-600" />
                  <div className="text-sm font-semibold">
                    {city.internetSpeed} Mbps
                  </div>
                  <div className="text-xs text-muted-foreground">avg speed</div>
                </div>
                <div className="text-center">
                  <Shield className="h-5 w-5 mx-auto mb-1 text-purple-600" />
                  <div className="text-sm font-semibold">
                    {city.safetyRating}/10
                  </div>
                  <div className="text-xs text-muted-foreground">safety</div>
                </div>
              </div>

              {/* Highlights */}
              <div className="mb-4">
                <h4 className="text-sm font-semibold mb-2">Highlights:</h4>
                <div className="flex flex-wrap gap-1">
                  {city.highlights.map((highlight, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {highlight}
                    </Badge>
                  ))}
                </div>
              </div>

              <Button asChild className="w-full">
                <Link href={`/cities/${city.id}`}>Explore {city.name}</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Why These Cities */}
      <Card className="mb-12">
        <CardHeader>
          <CardTitle>Why These Destinations?</CardTitle>
          <CardDescription>
            Our featured destinations are selected based on comprehensive
            criteria
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <Wifi className="h-8 w-8 mx-auto mb-3 text-blue-600" />
              <h3 className="font-semibold mb-2">Reliable Internet</h3>
              <p className="text-sm text-muted-foreground">
                Fast, stable internet connections essential for remote work
              </p>
            </div>
            <div className="text-center">
              <DollarSign className="h-8 w-8 mx-auto mb-3 text-green-600" />
              <h3 className="font-semibold mb-2">Great Value</h3>
              <p className="text-sm text-muted-foreground">
                Excellent quality of life at reasonable costs
              </p>
            </div>
            <div className="text-center">
              <Shield className="h-8 w-8 mx-auto mb-3 text-purple-600" />
              <h3 className="font-semibold mb-2">Safety & Security</h3>
              <p className="text-sm text-muted-foreground">
                Safe environments where you can focus on work and exploration
              </p>
            </div>
            <div className="text-center">
              <Star className="h-8 w-8 mx-auto mb-3 text-yellow-600" />
              <h3 className="font-semibold mb-2">Nomad Community</h3>
              <p className="text-sm text-muted-foreground">
                Thriving communities of like-minded remote workers
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Call to Action */}
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Ready to Explore More?</h2>
        <p className="text-muted-foreground mb-6">
          Browse our complete database of 100+ cities to find your perfect nomad
          destination.
        </p>
        <Button asChild size="lg">
          <Link href="/">Browse All Cities</Link>
        </Button>
      </div>
    </div>
  );
}
