import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MapPin, ArrowLeft, Search } from "lucide-react";

export default function CityNotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-6 max-w-md mx-auto px-4">
        <div className="space-y-4">
          <MapPin className="h-24 w-24 text-muted-foreground mx-auto" />
          <h1 className="text-4xl font-bold">City Not Found</h1>
          <p className="text-lg text-muted-foreground">
            The city you're looking for doesn't exist or may have been removed.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/">
            <Button className="w-full sm:w-auto">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Cities
            </Button>
          </Link>
          <Link href="/?search=true">
            <Button variant="outline" className="w-full sm:w-auto">
              <Search className="h-4 w-4 mr-2" />
              Search Cities
            </Button>
          </Link>
        </div>

        <div className="text-sm text-muted-foreground">
          <p>Looking for a specific city?</p>
          <p>Try searching or browse our featured destinations.</p>
        </div>
      </div>
    </div>
  );
}
