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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Users,
  MapPin,
  MessageSquare,
  Star,
  TrendingUp,
  Shield,
  BarChart3,
  Eye,
  Edit,
  Upload,
  Download,
  FileJson,
  AlertCircle,
  CheckCircle,
  Loader2,
  Activity,
  DollarSign,
  Globe,
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
  const [uploadStatus, setUploadStatus] = useState<
    "idle" | "uploading" | "success" | "error"
  >("idle");
  const [uploadMessage, setUploadMessage] = useState("");
  const [jsonInput, setJsonInput] = useState("");

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

  const handleBulkUpload = async () => {
    if (!jsonInput.trim()) {
      setUploadStatus("error");
      setUploadMessage("Please enter JSON data");
      return;
    }

    setUploadStatus("uploading");
    setUploadMessage("Processing cities...");

    try {
      const cities = JSON.parse(jsonInput);

      // Validate JSON structure
      if (!Array.isArray(cities)) {
        throw new Error("JSON must be an array of cities");
      }

      // TODO: Implement actual API call
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call

      setUploadStatus("success");
      setUploadMessage(`Successfully uploaded ${cities.length} cities`);
      setJsonInput("");
    } catch (error) {
      setUploadStatus("error");
      setUploadMessage(
        error instanceof Error ? error.message : "Invalid JSON format"
      );
    }
  };

  const sampleJsonData = {
    cities: [
      {
        name: "Lisbon",
        country: "Portugal",
        region: "Europe",
        latitude: 38.7223,
        longitude: -9.1393,
        population: 547733,
        timezone: "Europe/Lisbon",
        costOfLiving: 1200,
        internetSpeed: 85.5,
        safetyRating: 8.5,
        walkability: 7.8,
        nightlife: 8.2,
        culture: 9.1,
        weather: 8.7,
        description:
          "A vibrant coastal city with rich history and growing tech scene.",
        shortDescription: "Historic coastal capital with modern amenities.",
        featured: true,
        verified: true,
      },
    ],
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
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="cities">Cities</TabsTrigger>
            <TabsTrigger value="bulk-upload">Bulk Upload</TabsTrigger>
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
                    <Users className="h-8 w-8 text-blue-500" />
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
                    <MapPin className="h-8 w-8 text-green-500" />
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
                    <MessageSquare className="h-8 w-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Average Rating
                      </p>
                      <p className="text-2xl font-bold">
                        {formatRating(stats.overview.averageRating)}
                      </p>
                    </div>
                    <Star className="h-8 w-8 text-yellow-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Users</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {stats.recentActivity.users.slice(0, 5).map(user => (
                      <div
                        key={user.id}
                        className="flex items-center justify-between"
                      >
                        <div>
                          <p className="font-medium">
                            {user.name || user.email}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(user.createdAt)}
                          </p>
                        </div>
                        <Badge
                          variant={
                            user.role === "ADMIN" ? "default" : "secondary"
                          }
                        >
                          {user.role}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Cities</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {stats.recentActivity.cities.slice(0, 5).map(city => (
                      <div
                        key={city.id}
                        className="flex items-center justify-between"
                      >
                        <div>
                          <p className="font-medium">{city.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {city.country} • {formatDate(city.createdAt)}
                          </p>
                        </div>
                        <div className="flex gap-1">
                          {city.featured && (
                            <Badge variant="default">Featured</Badge>
                          )}
                          {city.verified && (
                            <Badge variant="secondary">Verified</Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Activity className="h-5 w-5 mr-2" />
                    User Growth
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">
                      Analytics charts coming soon
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Globe className="h-5 w-5 mr-2" />
                    Geographic Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">
                      Geographic analytics coming soon
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <DollarSign className="h-5 w-5 mr-2" />
                    Cost Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">
                      Cost analytics coming soon
                    </p>
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
                <div className="space-y-4">
                  {stats.recentActivity.users.map(user => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{user.name || "No name"}</p>
                        <p className="text-sm text-muted-foreground">
                          {user.email}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Joined {formatDate(user.createdAt)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            user.role === "ADMIN" ? "default" : "secondary"
                          }
                        >
                          {user.role}
                        </Badge>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
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
                  Manage city listings and information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.recentActivity.cities.map(city => (
                    <div
                      key={city.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{city.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {city.country}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Added {formatDate(city.createdAt)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {city.featured && (
                          <Badge variant="default">Featured</Badge>
                        )}
                        {city.verified && (
                          <Badge variant="secondary">Verified</Badge>
                        )}
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Bulk Upload Tab */}
          <TabsContent value="bulk-upload" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Upload className="h-5 w-5 mr-2" />
                    Bulk City Upload
                  </CardTitle>
                  <CardDescription>
                    Upload multiple cities using JSON format
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="json-input">JSON Data</Label>
                    <Textarea
                      id="json-input"
                      placeholder="Paste your JSON data here..."
                      value={jsonInput}
                      onChange={e => setJsonInput(e.target.value)}
                      rows={10}
                      className="font-mono text-sm"
                    />
                  </div>

                  {uploadStatus !== "idle" && (
                    <div
                      className={cn(
                        "flex items-center p-3 rounded-md",
                        uploadStatus === "success" &&
                          "bg-green-50 text-green-700 border border-green-200",
                        uploadStatus === "error" &&
                          "bg-red-50 text-red-700 border border-red-200",
                        uploadStatus === "uploading" &&
                          "bg-blue-50 text-blue-700 border border-blue-200"
                      )}
                    >
                      {uploadStatus === "uploading" && (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      )}
                      {uploadStatus === "success" && (
                        <CheckCircle className="h-4 w-4 mr-2" />
                      )}
                      {uploadStatus === "error" && (
                        <AlertCircle className="h-4 w-4 mr-2" />
                      )}
                      <span className="text-sm">{uploadMessage}</span>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button
                      onClick={handleBulkUpload}
                      disabled={uploadStatus === "uploading"}
                      className="flex-1"
                    >
                      {uploadStatus === "uploading" ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4 mr-2" />
                          Upload Cities
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setJsonInput("");
                        setUploadStatus("idle");
                        setUploadMessage("");
                      }}
                    >
                      Clear
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileJson className="h-5 w-5 mr-2" />
                    JSON Format Example
                  </CardTitle>
                  <CardDescription>
                    Use this format for your city data
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <pre className="bg-muted p-4 rounded-md text-xs overflow-x-auto">
                      <code>{JSON.stringify(sampleJsonData, null, 2)}</code>
                    </pre>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setJsonInput(
                            JSON.stringify(sampleJsonData.cities, null, 2)
                          )
                        }
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Use Example
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          navigator.clipboard.writeText(
                            JSON.stringify(sampleJsonData, null, 2)
                          );
                        }}
                      >
                        Copy Example
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
