"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  User,
  MapPin,
  Globe,
  Calendar,
  Star,
  Edit,
  Save,
  X,
  Mail,
  Shield,
  MessageSquare,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface UserProfileProps {
  user: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
    bio: string | null;
    location: string | null;
    website: string | null;
    role: string;
    emailVerified: Date | null;
    createdAt: string;
    updatedAt: string;
    reviews: Array<{
      id: string;
      rating: number;
      title: string | null;
      content: string;
      internetRating: number | null;
      costRating: number | null;
      safetyRating: number | null;
      funRating: number | null;
      helpful: number;
      verified: boolean;
      createdAt: string;
      city: {
        id: string;
        name: string;
        country: string;
        imageUrl: string | null;
      };
    }>;
    stats: {
      totalReviews: number;
      averageRating: number | null;
    };
  };
}

export function UserProfile({ user }: UserProfileProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [formData, setFormData] = useState({
    name: user.name || "",
    bio: user.bio || "",
    location: user.location || "",
    website: user.website || "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || "Failed to update profile");
      }

      setSuccess("Profile updated successfully!");
      setIsEditing(false);

      // Refresh the page to show updated data
      window.location.reload();
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user.name || "",
      bio: user.bio || "",
      location: user.location || "",
      website: user.website || "",
    });
    setIsEditing(false);
    setError("");
    setSuccess("");
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatRating = (rating: number | null) => {
    if (!rating) return "N/A";
    return rating.toFixed(1);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link
              href="/"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              ← Back to Cities
            </Link>
          </div>

          <div className="flex flex-col md:flex-row gap-6">
            {/* Profile Image */}
            <div className="flex-shrink-0">
              <div className="relative w-32 h-32 rounded-full overflow-hidden bg-muted">
                {user.image ? (
                  <Image
                    src={user.image}
                    alt={user.name || "User"}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <User className="h-16 w-16 text-muted-foreground" />
                  </div>
                )}
              </div>
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold mb-2">
                    {user.name || "Anonymous User"}
                  </h1>
                  <div className="flex items-center gap-4 text-muted-foreground mb-2">
                    <div className="flex items-center gap-1">
                      <Mail className="h-4 w-4" />
                      <span>{user.email}</span>
                    </div>
                    {user.emailVerified && (
                      <Badge variant="secondary" className="text-xs">
                        <Shield className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                    {user.role === "ADMIN" && (
                      <Badge variant="default" className="text-xs">
                        Admin
                      </Badge>
                    )}
                  </div>

                  {user.location && (
                    <div className="flex items-center gap-1 text-muted-foreground mb-2">
                      <MapPin className="h-4 w-4" />
                      <span>{user.location}</span>
                    </div>
                  )}

                  {user.website && (
                    <div className="flex items-center gap-1 text-muted-foreground mb-2">
                      <Globe className="h-4 w-4" />
                      <a
                        href={user.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-primary underline"
                      >
                        {user.website}
                      </a>
                    </div>
                  )}

                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Joined {formatDate(user.createdAt)}</span>
                  </div>
                </div>

                <Button
                  onClick={() => setIsEditing(!isEditing)}
                  variant="outline"
                  size="sm"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              </div>

              {user.bio && (
                <p className="text-muted-foreground leading-relaxed">
                  {user.bio}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <MessageSquare className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <div className="text-2xl font-bold">
                {user.stats.totalReviews}
              </div>
              <div className="text-sm text-muted-foreground">Reviews</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <Star className="h-8 w-8 mx-auto mb-2 text-yellow-600" />
              <div className="text-2xl font-bold">
                {formatRating(user.stats.averageRating)}
              </div>
              <div className="text-sm text-muted-foreground">Avg Rating</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <TrendingUp className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <div className="text-2xl font-bold">
                {user.reviews.reduce((sum, review) => sum + review.helpful, 0)}
              </div>
              <div className="text-sm text-muted-foreground">Helpful Votes</div>
            </CardContent>
          </Card>
        </div>

        {/* Edit Profile Modal/Section */}
        {isEditing && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Edit Profile</CardTitle>
              <CardDescription>Update your profile information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert>
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Your name"
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="Your location"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  name="website"
                  type="url"
                  value={formData.website}
                  onChange={handleInputChange}
                  placeholder="https://your-website.com"
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  placeholder="Tell us about yourself..."
                  rows={4}
                  disabled={isLoading}
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={handleSave} disabled={isLoading}>
                  <Save className="h-4 w-4 mr-2" />
                  {isLoading ? "Saving..." : "Save Changes"}
                </Button>
                <Button
                  onClick={handleCancel}
                  variant="outline"
                  disabled={isLoading}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Reviews Section */}
        <Tabs defaultValue="reviews" className="space-y-6">
          <TabsList>
            <TabsTrigger value="reviews">
              My Reviews ({user.stats.totalReviews})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="reviews">
            {user.reviews.length > 0 ? (
              <div className="space-y-6">
                {user.reviews.map(review => (
                  <Card key={review.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        {/* City Image */}
                        <div className="flex-shrink-0">
                          <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-muted">
                            {review.city.imageUrl ? (
                              <Image
                                src={review.city.imageUrl}
                                alt={review.city.name}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <MapPin className="h-6 w-6 text-muted-foreground" />
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Review Content */}
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <Link
                                href={`/cities/${review.city.id}`}
                                className="font-semibold hover:text-primary"
                              >
                                {review.city.name}, {review.city.country}
                              </Link>
                              <div className="flex items-center gap-2 mt-1">
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
                                {review.verified && (
                                  <Badge
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    Verified
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {formatDate(review.createdAt)}
                            </div>
                          </div>

                          {review.title && (
                            <h4 className="font-medium mb-2">{review.title}</h4>
                          )}

                          <p className="text-muted-foreground mb-3 leading-relaxed">
                            {review.content}
                          </p>

                          {/* Category Ratings */}
                          {(review.internetRating ||
                            review.costRating ||
                            review.safetyRating ||
                            review.funRating) && (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                              {review.internetRating && (
                                <div className="text-center">
                                  <div className="font-medium">
                                    {formatRating(review.internetRating)}/10
                                  </div>
                                  <div className="text-muted-foreground">
                                    Internet
                                  </div>
                                </div>
                              )}
                              {review.costRating && (
                                <div className="text-center">
                                  <div className="font-medium">
                                    {formatRating(review.costRating)}/10
                                  </div>
                                  <div className="text-muted-foreground">
                                    Cost
                                  </div>
                                </div>
                              )}
                              {review.safetyRating && (
                                <div className="text-center">
                                  <div className="font-medium">
                                    {formatRating(review.safetyRating)}/10
                                  </div>
                                  <div className="text-muted-foreground">
                                    Safety
                                  </div>
                                </div>
                              )}
                              {review.funRating && (
                                <div className="text-center">
                                  <div className="font-medium">
                                    {formatRating(review.funRating)}/10
                                  </div>
                                  <div className="text-muted-foreground">
                                    Fun
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          <div className="flex items-center justify-between mt-4 pt-4 border-t">
                            <div className="text-sm text-muted-foreground">
                              {review.helpful} people found this helpful
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No reviews yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Start exploring cities and share your experiences with the
                    community.
                  </p>
                  <Link href="/">
                    <Button>Explore Cities</Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
