import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Calendar, User, ArrowRight } from "lucide-react";
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
  title: "Blog | FreeNomad",
  description:
    "Read the latest insights, tips, and stories from the digital nomad community. Stay updated with travel guides, city reviews, and nomad lifestyle advice.",
};

// Mock blog posts data
const blogPosts = [
  {
    id: "1",
    title: "The Ultimate Guide to Digital Nomad Visas in 2025",
    excerpt:
      "Everything you need to know about the latest digital nomad visa programs, requirements, and application processes for remote workers.",
    author: "Sarah Johnson",
    date: "2025-01-20",
    readTime: "8 min read",
    category: "Visas & Legal",
    image:
      "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&h=400&fit=crop",
    featured: true,
  },
  {
    id: "2",
    title: "Why Lisbon is the Perfect European Base for Nomads",
    excerpt:
      "Discover why Portugal's capital has become one of the most popular destinations for digital nomads in Europe.",
    author: "Marco Rodriguez",
    date: "2025-01-18",
    readTime: "6 min read",
    category: "City Guides",
    image:
      "https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=800&h=400&fit=crop",
    featured: false,
  },
  {
    id: "3",
    title: "Managing Finances as a Digital Nomad: Tools and Tips",
    excerpt:
      "Learn how to handle banking, taxes, and budgeting while living and working remotely from different countries.",
    author: "Alex Chen",
    date: "2025-01-15",
    readTime: "10 min read",
    category: "Finance",
    image:
      "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&h=400&fit=crop",
    featured: false,
  },
  {
    id: "4",
    title: "The Rise of Nomad-Friendly Coworking Spaces in Southeast Asia",
    excerpt:
      "Explore the best coworking spaces across Thailand, Vietnam, and Indonesia that cater to digital nomads.",
    author: "Emma Thompson",
    date: "2025-01-12",
    readTime: "7 min read",
    category: "Coworking",
    image:
      "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=400&fit=crop",
    featured: false,
  },
  {
    id: "5",
    title: "Building a Sustainable Remote Work Routine",
    excerpt:
      "Tips for maintaining productivity, work-life balance, and mental health while working remotely from anywhere.",
    author: "David Kim",
    date: "2025-01-10",
    readTime: "5 min read",
    category: "Productivity",
    image:
      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=400&fit=crop",
    featured: false,
  },
  {
    id: "6",
    title: "Internet Speed Reality Check: What You Actually Need",
    excerpt:
      "A comprehensive guide to internet requirements for different types of remote work and how to test connections.",
    author: "Lisa Anderson",
    date: "2025-01-08",
    readTime: "6 min read",
    category: "Technology",
    image:
      "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=400&fit=crop",
    featured: false,
  },
];

const categories = [
  "All",
  "City Guides",
  "Visas & Legal",
  "Finance",
  "Coworking",
  "Productivity",
  "Technology",
];

export default function BlogPage() {
  const featuredPost = blogPosts.find(post => post.featured);
  const regularPosts = blogPosts.filter(post => !post.featured);

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">FreeNomad Blog</h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Insights, tips, and stories from the digital nomad community. Stay
          updated with the latest trends, destination guides, and practical
          advice for remote workers.
        </p>
      </div>

      {/* Featured Post */}
      {featuredPost && (
        <Card className="mb-12 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            <div className="relative">
              <Image
                src={featuredPost.image}
                alt={featuredPost.title}
                width={800}
                height={400}
                className="w-full h-64 lg:h-full object-cover"
              />
              <Badge className="absolute top-4 left-4 bg-primary">
                Featured
              </Badge>
            </div>
            <div className="p-8">
              <div className="flex items-center gap-2 mb-4">
                <Badge variant="secondary">{featuredPost.category}</Badge>
                <span className="text-sm text-muted-foreground">•</span>
                <span className="text-sm text-muted-foreground">
                  {featuredPost.readTime}
                </span>
              </div>

              <h2 className="text-2xl font-bold mb-4">{featuredPost.title}</h2>
              <p className="text-muted-foreground mb-6">
                {featuredPost.excerpt}
              </p>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    {featuredPost.author}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {new Date(featuredPost.date).toLocaleDateString()}
                  </div>
                </div>

                <Button asChild>
                  <Link href={`/blog/${featuredPost.id}`}>
                    Read More
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 mb-8">
        {categories.map(category => (
          <Button key={category} variant="outline" size="sm">
            {category}
          </Button>
        ))}
      </div>

      {/* Blog Posts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
        {regularPosts.map(post => (
          <Card
            key={post.id}
            className="overflow-hidden hover:shadow-lg transition-shadow"
          >
            <div className="relative">
              <Image
                src={post.image}
                alt={post.title}
                width={800}
                height={400}
                className="w-full h-48 object-cover"
              />
            </div>

            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary" className="text-xs">
                  {post.category}
                </Badge>
                <span className="text-xs text-muted-foreground">•</span>
                <span className="text-xs text-muted-foreground">
                  {post.readTime}
                </span>
              </div>
              <CardTitle className="text-lg line-clamp-2">
                {post.title}
              </CardTitle>
            </CardHeader>

            <CardContent>
              <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                {post.excerpt}
              </p>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {post.author}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(post.date).toLocaleDateString()}
                  </div>
                </div>

                <Button asChild variant="ghost" size="sm">
                  <Link href={`/blog/${post.id}`}>Read More</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Newsletter Signup */}
      <Card className="text-center">
        <CardHeader>
          <CardTitle>Stay Updated</CardTitle>
          <CardDescription>
            Get the latest nomad insights and destination guides delivered to
            your inbox
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <Button>Subscribe</Button>
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            No spam, unsubscribe at any time. Read our privacy policy.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
