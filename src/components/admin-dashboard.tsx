"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  MapPin,
  MessageSquare,
  Star,
  TrendingUp,
  Settings,
  Shield,
  BarChart3,
  Calendar,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminDashboardProps {
  user: {
    id: string;
    name?: string;
    email: string;
    role: string;
  };
  stats: {
    overview: {
      totalUsers: number;
      totalCities: number;
      totalReviews: number;
      averageRating: number;
    };
    recentActivity: {
      users: Array<{
        id: string;
        name: string | null;
        email: string;
        createdAt: string;
        role: string;
      }>;
      cities: Array<{
        id: string;
        name: string;
        country: string;
        createdAt: string;
        featured: boolean;
        verified: boolean;
      }>;
      reviews: Array<{
        id: string;
        rating: number;
        content: string;
        createdAt: string;
        user: {
          id: string;
          name: string | null;
        };
        city: {
          id: string;
          name: string;
          country: string;
        };
      }>;
    };
    growth: any[];
  };
}

export function AdminDashboard({ user, stats }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState("overview");

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatRating = (rating: number) => {
    return rating.toFixed(1);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Admin Dashboard</h1>
              <p className="text-muted-foreground">
                Welcome back, {user.name || user.email}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="default">
                <Shield className="h-3 w-3 mr-1" />
                Admin
              </Badge>
              <Link href="/">
                <Button variant="outline" size="sm">
                  View Site
                </Button>
              </Link>
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
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="cities">Cities</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Total Users
                      </p>
                      <p className="text-2xl font-bold">
                        {stats.overview.totalUsers}
                      </p>
                    </div>
                    <Users className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Total Cities
                      </p>
                      <p className="text-2xl font-bold">
                        {stats.overview.totalCities}
                      </p>
                    </div>
                    <MapPin className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Total Reviews
                      </p>
                      <p className="text-2xl font-bold">
                        {stats.overview.totalReviews}
                      </p>
                    </div>
                    <MessageSquare className="h-8 w-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Avg Rating
                      </p>
                      <p className="text-2xl font-bold">
                        {formatRating(stats.overview.averageRating)}
                      </p>
                    </div>
                    <Star className="h-8 w-8 text-yellow-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Recent Users */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Recent Users</CardTitle>
                  <CardDescription>Latest user registrations</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {stats.recentActivity.users.map(user => (
                      <div
                        key={user.id}
                        className="flex items-center justify-between"
                      >
                        <div>
                          <p className="font-medium">
                            {user.name || "Anonymous"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {user.email}
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge
                            variant={
                              user.role === "ADMIN" ? "default" : "secondary"
                            }
                          >
                            {user.role}
                          </Badge>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatDate(user.createdAt)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Cities */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Recent Cities</CardTitle>
                  <CardDescription>Latest city additions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {stats.recentActivity.cities.map(city => (
                      <div
                        key={city.id}
                        className="flex items-center justify-between"
                      >
                        <div>
                          <p className="font-medium">{city.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {city.country}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="flex gap-1 mb-1">
                            {city.featured && (
                              <Badge variant="default" className="text-xs">
                                Featured
                              </Badge>
                            )}
                            {city.verified && (
                              <Badge variant="secondary" className="text-xs">
                                Verified
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(city.createdAt)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Reviews */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Recent Reviews</CardTitle>
                  <CardDescription>Latest user reviews</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {stats.recentActivity.reviews.map(review => (
                      <div key={review.id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={cn(
                                  "h-3 w-3",
                                  i < review.rating
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-muted-foreground"
                                )}
                              />
                            ))}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(review.createdAt)}
                          </p>
                        </div>
                        <p className="text-sm">
                          <span className="font-medium">
                            {review.user.name || "Anonymous"}
                          </span>
                          {" reviewed "}
                          <span className="font-medium">
                            {review.city.name}
                          </span>
                        </p>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {review.content}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>
                  Manage user accounts and permissions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4" />
                  <p>User management interface will be implemented here</p>
                  <p className="text-sm">
                    Features: User list, role management, account actions
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Cities Tab */}
          <TabsContent value="cities" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>City Management</CardTitle>
                <CardDescription>
                  Manage city data and featured status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <MapPin className="h-12 w-12 mx-auto mb-4" />
                  <p>City management interface will be implemented here</p>
                  <p className="text-sm">
                    Features: City list, featured/verified toggles, bulk
                    operations
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reviews Tab */}
          <TabsContent value="reviews" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Review Management</CardTitle>
                <CardDescription>
                  Moderate and manage user reviews
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4" />
                  <p>Review management interface will be implemented here</p>
                  <p className="text-sm">
                    Features: Review moderation, verification, content filtering
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
