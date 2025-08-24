import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  Users,
  MessageSquare,
  Calendar,
  MapPin,
  Star,
  ExternalLink,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
// Removed Avatar import - using simple div implementation

export const metadata: Metadata = {
  title: "Community | FreeNomad",
  description:
    "Connect with the global digital nomad community. Join discussions, find travel buddies, and share experiences with fellow remote workers.",
};

// Mock community data
const communityStats = {
  totalMembers: 15420,
  activeCities: 89,
  monthlyPosts: 2340,
  countries: 67,
};

const featuredMembers = [
  {
    id: "1",
    name: "Sarah Johnson",
    avatar:
      "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face",
    location: "Currently in Lisbon",
    profession: "Full-stack Developer",
    reviews: 12,
    rating: 4.9,
  },
  {
    id: "2",
    name: "Marco Rodriguez",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
    location: "Currently in Bali",
    profession: "UX Designer",
    reviews: 8,
    rating: 4.8,
  },
  {
    id: "3",
    name: "Alex Chen",
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
    location: "Currently in Mexico City",
    profession: "Software Engineer",
    reviews: 15,
    rating: 4.9,
  },
];

const recentDiscussions = [
  {
    id: "1",
    title: "Best coworking spaces in Lisbon?",
    author: "Emma Thompson",
    replies: 23,
    lastActivity: "2 hours ago",
    category: "Coworking",
  },
  {
    id: "2",
    title: "Tax implications of nomad life - need advice",
    author: "David Kim",
    replies: 45,
    lastActivity: "4 hours ago",
    category: "Legal & Finance",
  },
  {
    id: "3",
    title: "Anyone in Medellín this month?",
    author: "Lisa Anderson",
    replies: 12,
    lastActivity: "6 hours ago",
    category: "Meetups",
  },
  {
    id: "4",
    title: "Internet speed reality check in Bali",
    author: "Tom Wilson",
    replies: 31,
    lastActivity: "8 hours ago",
    category: "Tech & Internet",
  },
];

const upcomingEvents = [
  {
    id: "1",
    title: "Digital Nomad Meetup Lisbon",
    date: "2025-01-25",
    time: "19:00",
    location: "Lisbon, Portugal",
    attendees: 45,
    type: "In-person",
  },
  {
    id: "2",
    title: "Remote Work Best Practices Webinar",
    date: "2025-01-27",
    time: "15:00 UTC",
    location: "Online",
    attendees: 120,
    type: "Virtual",
  },
  {
    id: "3",
    title: "Nomad Networking Night - Mexico City",
    date: "2025-01-30",
    time: "20:00",
    location: "Mexico City, Mexico",
    attendees: 32,
    type: "In-person",
  },
];

export default function CommunityPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Join Our Community</h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Connect with thousands of digital nomads worldwide. Share experiences,
          get advice, find travel buddies, and build lasting relationships with
          fellow remote workers.
        </p>
      </div>

      {/* Community Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
        <Card className="text-center">
          <CardContent className="pt-6">
            <Users className="h-8 w-8 mx-auto mb-2 text-primary" />
            <div className="text-2xl font-bold">
              {communityStats.totalMembers.toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground">Active Members</div>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="pt-6">
            <MapPin className="h-8 w-8 mx-auto mb-2 text-primary" />
            <div className="text-2xl font-bold">
              {communityStats.activeCities}
            </div>
            <div className="text-sm text-muted-foreground">Cities Covered</div>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="pt-6">
            <MessageSquare className="h-8 w-8 mx-auto mb-2 text-primary" />
            <div className="text-2xl font-bold">
              {communityStats.monthlyPosts.toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground">Monthly Posts</div>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="pt-6">
            <Star className="h-8 w-8 mx-auto mb-2 text-primary" />
            <div className="text-2xl font-bold">{communityStats.countries}</div>
            <div className="text-sm text-muted-foreground">Countries</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Recent Discussions */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recent Discussions</CardTitle>
                  <CardDescription>
                    Latest conversations from the community
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentDiscussions.map(discussion => (
                  <div
                    key={discussion.id}
                    className="flex items-start justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold hover:text-primary cursor-pointer">
                          {discussion.title}
                        </h3>
                        <Badge variant="secondary" className="text-xs">
                          {discussion.category}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>by {discussion.author}</span>
                        <span>•</span>
                        <span>{discussion.replies} replies</span>
                        <span>•</span>
                        <span>{discussion.lastActivity}</span>
                      </div>
                    </div>
                    <MessageSquare className="h-5 w-5 text-muted-foreground" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Events */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Upcoming Events</CardTitle>
                  <CardDescription>
                    Meetups and events in the nomad community
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  View Calendar
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingEvents.map(event => (
                  <div
                    key={event.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-start gap-4">
                      <div className="text-center">
                        <Calendar className="h-6 w-6 mx-auto mb-1 text-primary" />
                        <div className="text-xs text-muted-foreground">
                          {new Date(event.date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </div>
                      </div>
                      <div>
                        <h3 className="font-semibold">{event.title}</h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          <span>{event.location}</span>
                          <span>•</span>
                          <span>{event.time}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge
                            variant={
                              event.type === "Virtual" ? "secondary" : "default"
                            }
                            className="text-xs"
                          >
                            {event.type}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {event.attendees} attending
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button size="sm">Join</Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          {/* Featured Members */}
          <Card>
            <CardHeader>
              <CardTitle>Featured Members</CardTitle>
              <CardDescription>
                Active contributors to our community
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {featuredMembers.map(member => (
                  <div key={member.id} className="flex items-center gap-3">
                    <div className="relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full bg-muted">
                      <Image
                        src={member.avatar}
                        alt={member.name}
                        width={40}
                        height={40}
                        className="aspect-square h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold">{member.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {member.profession}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {member.location}
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        <Star className="h-3 w-3 text-yellow-500" />
                        <span className="text-xs">
                          {member.rating} ({member.reviews} reviews)
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Community Guidelines */}
          <Card>
            <CardHeader>
              <CardTitle>Community Guidelines</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <span>Be respectful and supportive of fellow nomads</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <span>Share accurate and helpful information</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <span>No spam or self-promotion without value</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <span>Keep discussions relevant to nomad life</span>
                </div>
              </div>
              <Button variant="outline" size="sm" className="w-full mt-4">
                Read Full Guidelines
              </Button>
            </CardContent>
          </Card>

          {/* External Links */}
          <Card>
            <CardHeader>
              <CardTitle>Connect Elsewhere</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  asChild
                >
                  <Link href="#">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Discord Server
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  asChild
                >
                  <Link href="#">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Telegram Group
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  asChild
                >
                  <Link href="#">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Facebook Group
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Call to Action */}
      <Card className="mt-12 text-center">
        <CardContent className="pt-8">
          <h2 className="text-2xl font-bold mb-4">
            Ready to Join the Community?
          </h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Create your free account to start connecting with nomads, sharing
            experiences, and accessing exclusive community features.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg">Sign Up Now</Button>
            <Button variant="outline" size="lg">
              Learn More
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
