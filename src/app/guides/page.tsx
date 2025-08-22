import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  MapPin,
  Clock,
  DollarSign,
  Wifi,
  Shield,
  Plane,
  FileText,
  Users,
  Star,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

interface GuideCard {
  id: string;
  title: string;
  description: string;
  category: string;
  readTime: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  tags: string[];
  featured?: boolean;
}

const guides: GuideCard[] = [
  {
    id: "getting-started",
    title: "Complete Beginner's Guide to Digital Nomadism",
    description:
      "Everything you need to know to start your nomadic journey, from planning to execution.",
    category: "Getting Started",
    readTime: "15 min",
    difficulty: "Beginner",
    tags: ["Planning", "Basics", "First-time"],
    featured: true,
  },
  {
    id: "visa-guide",
    title: "Visa Requirements and Digital Nomad Visas",
    description:
      "Comprehensive guide to visa requirements, digital nomad visas, and legal considerations.",
    category: "Legal & Visas",
    readTime: "20 min",
    difficulty: "Intermediate",
    tags: ["Visas", "Legal", "Documentation"],
  },
  {
    id: "budget-planning",
    title: "Budget Planning for Digital Nomads",
    description:
      "How to plan and manage your finances while traveling and working remotely.",
    category: "Finance",
    readTime: "12 min",
    difficulty: "Beginner",
    tags: ["Budget", "Finance", "Planning"],
  },
  {
    id: "remote-work-setup",
    title: "Setting Up Your Mobile Office",
    description:
      "Essential gear, tools, and setups for productive remote work from anywhere.",
    category: "Work Setup",
    readTime: "18 min",
    difficulty: "Intermediate",
    tags: ["Equipment", "Productivity", "Tools"],
  },
  {
    id: "accommodation-guide",
    title: "Finding the Perfect Accommodation",
    description:
      "From Airbnb to co-living spaces: how to find and book the best places to stay.",
    category: "Accommodation",
    readTime: "10 min",
    difficulty: "Beginner",
    tags: ["Housing", "Booking", "Co-living"],
  },
  {
    id: "networking-guide",
    title: "Building Your Nomad Network",
    description:
      "How to connect with other nomads, find communities, and build lasting relationships.",
    category: "Community",
    readTime: "14 min",
    difficulty: "Intermediate",
    tags: ["Networking", "Community", "Social"],
  },
  {
    id: "health-insurance",
    title: "Health Insurance for Digital Nomads",
    description:
      "Comprehensive guide to international health insurance and staying healthy abroad.",
    category: "Health & Safety",
    readTime: "16 min",
    difficulty: "Advanced",
    tags: ["Insurance", "Health", "Safety"],
  },
  {
    id: "tax-guide",
    title: "Tax Obligations for Digital Nomads",
    description:
      "Understanding tax residency, obligations, and strategies for nomadic income.",
    category: "Legal & Visas",
    readTime: "25 min",
    difficulty: "Advanced",
    tags: ["Taxes", "Legal", "Finance"],
  },
];

const categories = [
  { id: "all", name: "All Guides", icon: FileText },
  { id: "getting-started", name: "Getting Started", icon: Plane },
  { id: "legal-visas", name: "Legal & Visas", icon: Shield },
  { id: "finance", name: "Finance", icon: DollarSign },
  { id: "work-setup", name: "Work Setup", icon: Wifi },
  { id: "accommodation", name: "Accommodation", icon: MapPin },
  { id: "community", name: "Community", icon: Users },
  { id: "health-safety", name: "Health & Safety", icon: Shield },
];

function getDifficultyColor(difficulty: string) {
  switch (difficulty) {
    case "Beginner":
      return "bg-green-100 text-green-800";
    case "Intermediate":
      return "bg-yellow-100 text-yellow-800";
    case "Advanced":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

function GuideCard({ guide }: { guide: GuideCard }) {
  return (
    <Card className="h-full hover:shadow-lg transition-shadow duration-200">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg mb-2 line-clamp-2">
              {guide.title}
            </CardTitle>
            <CardDescription className="line-clamp-3">
              {guide.description}
            </CardDescription>
          </div>
          {guide.featured && (
            <Badge variant="default" className="ml-2">
              <Star className="h-3 w-3 mr-1" />
              Featured
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              {guide.readTime}
            </div>
            <Badge
              variant="secondary"
              className={getDifficultyColor(guide.difficulty)}
            >
              {guide.difficulty}
            </Badge>
          </div>

          <div className="flex flex-wrap gap-1">
            {guide.tags.map(tag => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>

          <Separator />

          <Button asChild className="w-full">
            <Link
              href={`/guides/${guide.id}`}
              className="flex items-center justify-center"
            >
              Read Guide
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function GuidesPage() {
  const featuredGuides = guides.filter(guide => guide.featured);
  const regularGuides = guides.filter(guide => !guide.featured);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-foreground mb-4">
          Travel Guides
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Comprehensive guides to help you navigate the world of digital
          nomadism, from getting started to mastering the lifestyle.
        </p>
      </div>

      {/* Featured Guides */}
      {featuredGuides.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-6 flex items-center">
            <Star className="h-6 w-6 mr-2 text-primary" />
            Featured Guides
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredGuides.map(guide => (
              <GuideCard key={guide.id} guide={guide} />
            ))}
          </div>
        </div>
      )}

      {/* All Guides with Category Tabs */}
      <div>
        <h2 className="text-2xl font-semibold mb-6">All Guides</h2>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8 mb-8">
            {categories.map(category => {
              const Icon = category.icon;
              return (
                <TabsTrigger
                  key={category.id}
                  value={category.id}
                  className="flex items-center justify-center p-2"
                >
                  <Icon className="h-4 w-4 mr-1 hidden sm:block" />
                  <span className="text-xs sm:text-sm">{category.name}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          <TabsContent value="all">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {regularGuides.map(guide => (
                <GuideCard key={guide.id} guide={guide} />
              ))}
            </div>
          </TabsContent>

          {categories.slice(1).map(category => {
            const categoryGuides = guides.filter(
              guide =>
                guide.category
                  .toLowerCase()
                  .replace(/\s+/g, "-")
                  .replace(/&/g, "") === category.id
            );

            return (
              <TabsContent key={category.id} value={category.id}>
                {categoryGuides.length > 0 ? (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {categoryGuides.map(guide => (
                      <GuideCard key={guide.id} guide={guide} />
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="text-center py-12">
                      <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold mb-2">
                        No guides yet
                      </h3>
                      <p className="text-muted-foreground">
                        We are working on adding more guides in this category.
                        Check back soon!
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            );
          })}
        </Tabs>
      </div>

      {/* Call to Action */}
      <Card className="mt-12">
        <CardContent className="text-center py-8">
          <h3 className="text-xl font-semibold mb-4">
            Cannot find what you are looking for?
          </h3>
          <p className="text-muted-foreground mb-6">
            Join our community to ask questions, share experiences, and get
            personalized advice from fellow digital nomads.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild>
              <Link href="/auth/register">Join the Community</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/contact">Request a Guide</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
