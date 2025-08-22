import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { MapPin, Users, Globe, Heart, Target, Zap } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <div className="flex items-center justify-center mb-4">
          <MapPin className="h-8 w-8 text-primary mr-2" />
          <h1 className="text-4xl font-bold text-foreground">
            About FreeNomad
          </h1>
        </div>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Empowering digital nomads to discover their perfect destination with
          comprehensive data, community insights, and real-world experiences.
        </p>
      </div>

      {/* Mission Section */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Target className="h-5 w-5 mr-2 text-primary" />
            Our Mission
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground leading-relaxed">
            FreeNomad exists to bridge the gap between wanderlust and practical
            decision-making. We believe that choosing your next destination
            should not be a gamble. Our platform provides data-driven insights,
            authentic community reviews, and comprehensive city profiles to help
            digital nomads make informed decisions about where to live, work,
            and thrive.
          </p>
        </CardContent>
      </Card>

      {/* Value Proposition */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Globe className="h-5 w-5 mr-2 text-primary" />
              Global Coverage
            </CardTitle>
            <CardDescription>
              Comprehensive data on 100+ nomad-friendly cities worldwide
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              From bustling metropolises to hidden gems, we cover destinations
              across six continents with detailed metrics on cost of living,
              internet infrastructure, safety, and quality of life.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2 text-primary" />
              Community-Driven
            </CardTitle>
            <CardDescription>
              Real insights from verified digital nomads
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Our platform thrives on authentic experiences shared by fellow
              nomads. Every review is from verified users who have actually
              lived and worked in these destinations.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Key Features */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Zap className="h-5 w-5 mr-2 text-primary" />
            What Makes Us Different
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-2">Data-Driven Insights</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Real-time cost of living data, internet speed tests, safety
                ratings, and infrastructure quality metrics.
              </p>

              <h4 className="font-semibold mb-2">Advanced Filtering</h4>
              <p className="text-sm text-muted-foreground">
                Find your perfect destination based on budget, climate
                preferences, time zones, visa requirements, and lifestyle
                factors.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Performance Optimized</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Lightning-fast load times, offline capabilities, and
                mobile-first design for nomads always on the move.
              </p>

              <h4 className="font-semibold mb-2">Open Source</h4>
              <p className="text-sm text-muted-foreground">
                Built by the community, for the community. Transparent, secure,
                and continuously improving through collaborative development.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Technology Stack */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Built with Modern Technology</CardTitle>
          <CardDescription>
            Leveraging cutting-edge tools for optimal performance and user
            experience
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">Next.js 15</Badge>
            <Badge variant="secondary">React 19</Badge>
            <Badge variant="secondary">TypeScript</Badge>
            <Badge variant="secondary">Tailwind CSS</Badge>
            <Badge variant="secondary">Prisma ORM</Badge>
            <Badge variant="secondary">PostgreSQL</Badge>
            <Badge variant="secondary">NextAuth.js</Badge>
            <Badge variant="secondary">Vercel</Badge>
          </div>
          <Separator className="my-4" />
          <p className="text-sm text-muted-foreground">
            Our tech stack prioritizes performance, scalability, and developer
            experience. We use modern frameworks and tools to ensure fast load
            times, excellent SEO, and a seamless user experience across all
            devices.
          </p>
        </CardContent>
      </Card>

      {/* Community Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Heart className="h-5 w-5 mr-2 text-primary" />
            Join Our Community
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            FreeNomad is more than just a platform—it is a community of
            like-minded individuals who believe in the freedom to work from
            anywhere. Whether you are a seasoned nomad or just starting your
            journey, you are welcome here.
          </p>
          <div className="grid md:grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-primary">10,000+</div>
              <div className="text-sm text-muted-foreground">Active Users</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary">100+</div>
              <div className="text-sm text-muted-foreground">
                Cities Covered
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary">5,000+</div>
              <div className="text-sm text-muted-foreground">
                Community Reviews
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
